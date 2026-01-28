import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { EID_FIELDS } from "./eid-config";
import type { SheetRow } from "@/types/application";

// Register fonts for @napi-rs/canvas so text renders on e-ID cards (local + Vercel)
const ROBOTO_FILES = path.join(process.cwd(), "node_modules", "@fontsource", "roboto", "files");
let fontsRegistered = false;
function ensureFontsRegistered() {
  if (fontsRegistered) return;

  try {
    // 1. Prefer @fontsource/roboto from node_modules (woff2; works on Vercel)
    const bundledFonts = [
      path.join(ROBOTO_FILES, "roboto-latin-400-normal.woff2"),
      path.join(ROBOTO_FILES, "roboto-latin-700-normal.woff2"),
    ];
    for (const fontPath of bundledFonts) {
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath);
      }
    }

    // 2. Fallback: fonts/ from build script (if download-fonts ran)
    const fontsDir = path.join(process.cwd(), "fonts");
    const downloadedFonts = [
      path.join(fontsDir, "Roboto-Regular.ttf"),
      path.join(fontsDir, "Roboto-Bold.ttf"),
    ];
    for (const fontPath of downloadedFonts) {
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath);
      }
    }

    // 3. Fallback: system fonts (Windows / Linux / Mac)
    const systemFonts =
      process.platform === "win32"
        ? [
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\arialbd.ttf",
          ]
        : [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
          ];
    for (const fontPath of systemFonts) {
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath);
      }
    }

    fontsRegistered = true;
  } catch (error) {
    console.warn("Failed to register fonts, text may not render correctly:", error);
  }
}

// Templates are in image_template/ at project root (downloaded by build script).
// Next.js file tracer should include them automatically since we use fs.readFile with a static base path.
const TEMPLATE_DIR = path.join(process.cwd(), "image_template");

export interface EidBuffers {
  front: Buffer;
  back: Buffer;
}

function formatDisplayName(fullName: string): string {
  // If stored as "Last, First, MI", render as "Last, First MI"
  const parts = fullName.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[1]} ${parts.slice(2).join(" ")}`.replace(/\s+/g, " ").trim();
  }
  return fullName;
}

async function drawTextOnImage(
  imagePath: string,
  data: { orNumber: string; fullName: string; programAndYear: string },
  side: "front" | "back"
): Promise<Buffer> {
  // Ensure fonts are registered before drawing
  ensureFontsRegistered();
  
  const buf = await fs.readFile(imagePath);
  const img = await loadImage(buf);
  const w = img.width;
  const h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const fieldMap: Record<string, string> = {
    orNumber: data.orNumber,
    fullName: data.fullName,
    programAndYear: data.programAndYear,
  };

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (const [key, config] of Object.entries(EID_FIELDS)) {
    if (config.side !== side) continue;
    const value = fieldMap[key] ?? "";
    if (!value) continue;
    
    // Use Roboto if we bundled it; otherwise Arial / system sans
const fontFamily = config.fontFamily ?? "Roboto, Arial, sans-serif";
    const fontWeight = config.fontWeight ?? 400;
    const fontStyle = config.fontStyle ?? "normal";
    
    // Map font weight to bold keyword for better compatibility
    const weightKeyword = fontWeight >= 700 ? "bold" : "normal";
    ctx.font = `${fontStyle} ${weightKeyword} ${config.fontSize}px ${fontFamily}`;
    ctx.fillStyle = config.color ?? "#000000";
    
    const xPx = config.x > 0 && config.x <= 1 ? config.x * w : config.x;
    const yPx = config.y > 0 && config.y <= 1 ? config.y * h : config.y;
    
    // Log for debugging
    console.log(`Drawing ${key} at (${xPx}, ${yPx}) with font: ${ctx.font}`);
    
    ctx.fillText(value, xPx, yPx);
  }

  return canvas.toBuffer("image/png");
}

export async function generateEidImages(row: SheetRow): Promise<EidBuffers> {
  const frontPath = path.join(TEMPLATE_DIR, "FRONT (clear).png");
  const backPath = path.join(TEMPLATE_DIR, "BACK.png");
  const data = {
    orNumber: row.orNumber,
    fullName: formatDisplayName(row.fullName),
    programAndYear: row.programAndYear,
  };
  const [front, back] = await Promise.all([
    drawTextOnImage(frontPath, data, "front"),
    drawTextOnImage(backPath, data, "back"),
  ]);
  return { front, back };
}


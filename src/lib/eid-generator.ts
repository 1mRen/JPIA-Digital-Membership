import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { EID_FIELDS } from "./eid-config";
import type { SheetRow } from "@/types/application";

// Register system fonts for @napi-rs/canvas
// This ensures text will render properly on the cards
let fontsRegistered = false;
function ensureFontsRegistered() {
  if (fontsRegistered) return;
  
  try {
    // Try to register common system fonts
    // On Windows, fonts are typically in C:\Windows\Fonts
    // On Linux/Mac, try common font locations
    const fontPaths = process.platform === 'win32' 
      ? [
          'C:\\Windows\\Fonts\\arial.ttf',
          'C:\\Windows\\Fonts\\arialbd.ttf',
        ]
      : [
          '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
          '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
          '/System/Library/Fonts/Helvetica.ttc',
        ];
    
    for (const fontPath of fontPaths) {
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath);
      }
    }
    
    fontsRegistered = true;
  } catch (error) {
    console.warn('Failed to register fonts, text may not render correctly:', error);
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
    
    const fontFamily = config.fontFamily ?? "Arial, sans-serif";
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


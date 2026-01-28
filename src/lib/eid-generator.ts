import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { EID_FIELDS } from "./eid-config";
import type { SheetRow } from "@/types/application";

// Vercel: build script writes to public/image_template (included in deployment).
// Local: use image_template at project root if present.
const PUBLIC_TEMPLATE_DIR = path.join(process.cwd(), "public", "image_template");
const FALLBACK_TEMPLATE_DIR = path.join(process.cwd(), "image_template");
const TEMPLATE_DIR = existsSync(PUBLIC_TEMPLATE_DIR) ? PUBLIC_TEMPLATE_DIR : FALLBACK_TEMPLATE_DIR;

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
    const fontFamily = config.fontFamily ?? "sans-serif";
    const fontWeight = config.fontWeight ?? 400;
    const fontStyle = config.fontStyle ?? "normal";
    ctx.font = `${fontStyle} ${fontWeight} ${config.fontSize}px ${fontFamily}`;
    ctx.fillStyle = config.color ?? "#000000";
    const xPx = config.x > 0 && config.x <= 1 ? config.x * w : config.x;
    const yPx = config.y > 0 && config.y <= 1 ? config.y * h : config.y;
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


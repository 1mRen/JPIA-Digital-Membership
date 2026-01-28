import { google } from "googleapis";
import path from "path";
import { existsSync } from "fs";
import type { SheetRow, ApplicationStatus } from "@/types/application";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "1J528rL6r42zY_aOeVvCrYIhAMIpY2We8AvMTRUGsFIc";
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";

/** Philippine time is UTC+8 (no DST). Format: MM/DD/YYYY HH:MM AM/PM */
export function formatTimestamp(date: Date): string {
  const phtMs = date.getTime() + 8 * 60 * 60 * 1000;
  const pht = new Date(phtMs);
  const mm = String(pht.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(pht.getUTCDate()).padStart(2, "0");
  const yyyy = pht.getUTCFullYear();
  let hours = pht.getUTCHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, "0");
  const min = String(pht.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${min} ${ampm}`;
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function parseServiceAccountJson(raw: string): object {
  let str = raw.trim();
  // Remove optional outer quotes from .env (e.g. GOOGLE_SERVICE_ACCOUNT_JSON="{...}")
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).replace(/\\"/g, '"');
  }
  // Try Base64 (common when pasting JSON into Vercel/env)
  if (!str.startsWith("{")) {
    try {
      str = Buffer.from(str, "base64").toString("utf8");
    } catch {
      // not base64, continue with raw
    }
  }
  return JSON.parse(str) as object;
}

function getAuth() {
  // 1. Use JSON string from env (Production / Vercel) — must be single-line or Base64
  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (envJson) {
    try {
      const credentials = parseServiceAccountJson(envJson);
      return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    } catch (e) {
      // If JSON is invalid (e.g. multi-line in .env), fall back to file so local dev still works
      const keyPath =
        process.env.GOOGLE_SERVICE_ACCOUNT_PATH ??
        path.join(process.cwd(), "jpia-digital-membership-3c5e52b155bb.json");
      if (existsSync(keyPath)) {
        console.warn(
          "GOOGLE_SERVICE_ACCOUNT_JSON is set but invalid (use single-line JSON or Base64). Using key file:",
          keyPath
        );
        return new google.auth.GoogleAuth({
          keyFile: keyPath,
          scopes: SCOPES,
        });
      }
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Invalid GOOGLE_SERVICE_ACCOUNT_JSON: ${msg}. ` +
          "Use a single-line JSON string, or Base64-encode the JSON. For local dev, set GOOGLE_SERVICE_ACCOUNT_PATH instead."
      );
    }
  }

  // 2. Fallback to file path (Local development)
  const keyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_PATH ??
    path.join(process.cwd(), "jpia-digital-membership-3c5e52b155bb.json");
  return new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: SCOPES,
  });
}

export async function appendRow(data: {
  orNumber: string;
  fullName: string;
  programAndYear: string;
  email: string;
}) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const timestamp = formatTimestamp(new Date());
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          timestamp,
          data.orNumber,
          data.fullName,
          data.programAndYear,
          data.email,
          "Pending",
          "",
          "",
        ],
      ],
    },
  });
}

function rowToSheetRow(rowIndex: number, values: unknown[]): SheetRow {
  return {
    rowIndex,
    timestamp: String(values[0] ?? ""),
    orNumber: String(values[1] ?? ""),
    fullName: String(values[2] ?? ""),
    programAndYear: String(values[3] ?? ""),
    email: String(values[4] ?? ""),
    status: (values[5] as ApplicationStatus) ?? "Pending",
    rejectedReason: String(values[6] ?? ""),
    releasedAt: String(values[7] ?? ""),
  };
}

export async function getPendingRows(): Promise<SheetRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:H`,
  });
  const rows = res.data.values ?? [];
  const result: SheetRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const fullRow = [...row];
    while (fullRow.length < 8) fullRow.push("");
    const sheetRow = rowToSheetRow(i + 2, fullRow); // +2 because 1-based and header row
    if (sheetRow.status === "Pending") result.push(sheetRow);
  }
  return result;
}

export async function getRowByIndex(rowIndex: number): Promise<SheetRow | null> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
  });
  const rows = res.data.values ?? [];
  if (rows.length === 0) return null;
  const row = rows[0] as unknown[];
  const fullRow = [...row];
  while (fullRow.length < 8) fullRow.push("");
  return rowToSheetRow(rowIndex, fullRow);
}

export async function updateRowStatus(
  rowIndex: number,
  status: ApplicationStatus,
  options?: { rejectedReason?: string; releasedAt?: string }
) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const colF = status;
  const colG = options?.rejectedReason ?? "";
  const colH = options?.releasedAt ?? "";
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!F${rowIndex}:H${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[colF, colG, colH]],
    },
  });
}

"use strict";

const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TEMPLATE_DIR = path.join(process.cwd(), "image_template");
const FRONT_FILENAME = "FRONT (clear).png";
const BACK_FILENAME = "BACK.png";

async function run() {
  const frontFileId = process.env.EID_TEMPLATE_FRONT_FILE_ID;
  const backFileId = process.env.EID_TEMPLATE_BACK_FILE_ID;
  const isVercel = process.env.VERCEL === "1" || process.env.CI === "true";

  if (!frontFileId || !backFileId) {
    if (isVercel) {
      console.error(
        "Missing EID_TEMPLATE_FRONT_FILE_ID or EID_TEMPLATE_BACK_FILE_ID. " +
          "Set both in Vercel Environment Variables for Production (and Preview if needed)."
      );
      process.exit(1);
    }
    process.exit(0);
  }

  const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!jsonEnv) {
    console.error(
      "Missing GOOGLE_SERVICE_ACCOUNT_JSON. Required when EID template file IDs are set."
    );
    process.exit(1);
  }

  let credentials;
  try {
    const normalized = jsonEnv.replace(/\r\n/g, "").replace(/\n/g, "").trim();
    credentials = JSON.parse(normalized);
  } catch (e) {
    console.error(
      "Invalid GOOGLE_SERVICE_ACCOUNT_JSON:",
      e instanceof Error ? e.message : String(e)
    );
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [DRIVE_SCOPE],
  });

  const drive = google.drive({ version: "v3", auth });

  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  }

  const [frontRes, backRes] = await Promise.all([
    drive.files.get(
      { fileId: frontFileId, alt: "media" },
      { responseType: "arraybuffer" }
    ),
    drive.files.get(
      { fileId: backFileId, alt: "media" },
      { responseType: "arraybuffer" }
    ),
  ]);

  const frontPath = path.join(TEMPLATE_DIR, FRONT_FILENAME);
  const backPath = path.join(TEMPLATE_DIR, BACK_FILENAME);

  fs.writeFileSync(frontPath, Buffer.from(frontRes.data), "binary");
  fs.writeFileSync(backPath, Buffer.from(backRes.data), "binary");

  console.log("E-ID templates downloaded to", TEMPLATE_DIR);
}

run().catch((err) => {
  console.error("Failed to download E-ID templates:", err.message || err);
  process.exit(1);
});

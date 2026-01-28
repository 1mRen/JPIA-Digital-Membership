"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const FONTS_DIR = path.join(process.cwd(), "fonts");

// Roboto from Google Fonts GitHub (Apache 2.0)
const FONT_URLS = [
  {
    url: "https://raw.githubusercontent.com/google/fonts/main/apache/Roboto/Static_TTF/Roboto-Regular.ttf",
    file: "Roboto-Regular.ttf",
  },
  {
    url: "https://raw.githubusercontent.com/google/fonts/main/apache/Roboto/Static_TTF/Roboto-Bold.ttf",
    file: "Roboto-Bold.ttf",
  },
];

function download(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      timeout: 30000,
      headers: { "User-Agent": "Node.js (JPIA e-ID build)" },
    };
    https
      .get(url, opts, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function run() {
  console.log("Fonts: ensuring fonts directory...");
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  for (const { url, file } of FONT_URLS) {
    const dest = path.join(FONTS_DIR, file);
    if (fs.existsSync(dest)) {
      console.log("Fonts: already have", file);
      continue;
    }
    try {
      console.log("Fonts: downloading", file, "from CDN...");
      const buf = await download(url);
      fs.writeFileSync(dest, buf);
      console.log("Fonts: saved", file);
    } catch (e) {
      console.warn("Fonts: failed to download", file, e.message || e);
      if (process.env.VERCEL === "1") {
        console.error("Fonts: on Vercel, e-ID text may not render without fonts.");
      }
    }
  }

  console.log("Fonts: done.");
}

run().catch((err) => {
  console.error("Fonts: error", err.message || err);
  process.exitCode = 1;
});

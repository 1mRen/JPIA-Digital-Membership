# JPIA Silakbo E-ID System

A **Next.js** web application designed to automate membership applications for the **JPIA Silakbo Federation**. It features a public registration form, a real-time officer dashboard, and an automated email system that generates and issues digital IDs.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Google Sheets (via `googleapis`)
- **Email Engine:** Nodemailer
- **Image Processing:** @napi-rs/canvas
- **Styling:** Tailwind CSS

## Key Features

- **Google Sheets Integration:** Uses Sheets as a zero-cost, collaborative database.
- **Dynamic Image Generation:** Programmatically renders names and OR numbers onto E-ID templates using `@napi-rs/canvas`.
- **Automated Workflows:** Sends emails via **Nodemailer** with generated E-ID attachments instantly upon approval.
- **Secure Admin Dashboard:** Simple password-protected interface for officers to review applications.

## Environment Setup

Copy `.env.example` to `.env.local` and configure your SMTP (Nodemailer) and Google settings:

```bash
# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PASSWORD=your_secure_password

# Google Sheets Config
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_PATH=./service-account.json

# Email Config (Nodemailer)
# Use a Gmail App Password if using Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
Installation
Bash
# 1. Install dependencies
npm install

# 2. Place your E-ID templates
# Ensure FRONT.png and BACK.png are in /image_template

# 3. Run development server
npm run dev
Usage Flow
Student: Submits the form at /. Status becomes Pending.

Officer: Logs in at /admin.

Review:

Confirm: System generates the ID image, sends it via Nodemailer, and marks status Released.

Reject: Officer inputs a reason, student gets a rejection email, and status updates to Rejected.

License
MIT © Marc Lawrence Magadan
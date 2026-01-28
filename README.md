# JPIA Digital Membership System

Next.js application for student membership applications: students submit via a form, data is stored in Google Sheets, and officers approve or reject from an admin dashboard. Approved applicants receive their e-ID by email.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `GOOGLE_SHEET_ID` (default is set for the project sheet)
   - Set `GOOGLE_SHEET_NAME` to your first sheet tab name (default `Sheet1`). If you renamed it to "Applications", set `GOOGLE_SHEET_NAME=Applications`
   - Ensure the service account JSON path is correct (`jpia-digital-membership-3c5e52b155bb.json` in project root, or set `GOOGLE_SERVICE_ACCOUNT_PATH`)
   - Set `ADMIN_PASSWORD` for the shared officer login
   - Set SMTP variables for email (Gmail App Password, SendGrid, etc.)

3. **Google Sheet**
   - Share the spreadsheet with the service account email (Editor): `jpia-serviceaccount@jpia-digital-membership.iam.gserviceaccount.com`
   - Ensure the first sheet has **row 1** as header: `Timestamp` | `OR Number` | `Full Name` | `Program & Year` | `Email` | `Status` | `Rejected Reason` | `Released At`
   - Data is appended from row 2; pending rows are those with `Status = Pending`

4. **E-ID template**
   - Place `FRONT.png` and `BACK.png` in the `image_template` folder (already present)
   - Adjust text positions in `src/lib/eid-config.ts` (x, y, fontSize) to match your template layout

## Run

- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Routes

- `/` – Public application form
- `/admin` – Officer login (password)
- `/admin/dashboard` – Pending applications list; Confirm/Release or Reject per row

## Flow

1. Student submits the form → row appended to Google Sheet with status `Pending`
2. Officer logs in at `/admin`, opens dashboard, sees pending list
3. Officer clicks **Confirm/Release** → e-ID images generated from templates, email sent with attachments, status set to `Released`
4. Officer clicks **Reject** → enters reason, rejection email sent, status set to `Rejected`

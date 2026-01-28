# JPIA Digital Membership System

Next.js application for student membership applications: students submit via a form, data is stored in Google Sheets, and officers approve or reject from an admin dashboard. Approved applicants receive their e-ID by email.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `GOOGLE_SHEET_ID` to your spreadsheet ID (from the sheet URL)
   - Set `GOOGLE_SHEET_NAME` to your first sheet tab name (default `Sheet1`). If you renamed it to "Applications", set `GOOGLE_SHEET_NAME=Applications`
   - Set `GOOGLE_SERVICE_ACCOUNT_PATH` to your service account JSON file (e.g. `ServiceAccount.json` in project root)
   - Set `ADMIN_PASSWORD` for the shared officer login
   - Set SMTP variables for email (Gmail App Password, SendGrid, etc.)

3. **Google Sheet**
   - Share the spreadsheet with the service account email from your JSON (Editor). Find it in the JSON as `client_email`.
   - Ensure the first sheet has **row 1** as header: `Timestamp` | `OR Number` | `Full Name` | `Program & Year` | `Email` | `Status` | `Rejected Reason` | `Released At`
   - Data is appended from row 2; pending rows are those with `Status = Pending`

4. **E-ID template**
   - Place `FRONT.png` and `BACK.png` in the `image_template` folder (already present)
   - Adjust text positions in `src/lib/eid-config.ts` (x, y, fontSize) to match your template layout

## Run

- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Production deployment

### Build & run (Node)

```bash
npm run build
NODE_ENV=production npm start
```

Runs on port **3000** by default. Use a process manager (e.g. PM2) and a reverse proxy (e.g. Nginx) for production.

### Deploy to Vercel (recommended)

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add **Environment Variables** in the Vercel dashboard (same names as in `.env.example`). Do **not** commit `.env.local`.
3. For Google Sheets: either paste the service account JSON as a single variable (e.g. `GOOGLE_SERVICE_ACCOUNT_JSON`) and adjust the app to read from it, or use Vercel’s file system and set `GOOGLE_SERVICE_ACCOUNT_PATH` to the path of the uploaded file.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://your-app.vercel.app`).
5. Deploy; Vercel will run `npm run build` and serve the app.

### Production checklist

- [ ] Use strong `ADMIN_PASSWORD` and keep it secret.
- [ ] Use HTTPS only (Vercel and most hosts provide it).
- [ ] Set `NEXT_PUBLIC_APP_URL` to the real production URL (used in emails/links).
- [ ] Restrict Google Sheet sharing to the service account only.
- [ ] Use a dedicated SMTP account or transactional email (e.g. SendGrid) with proper sending limits and domain verification.
- [ ] Do not commit `.env.local`, `.env`, or service account JSON; use host environment variables or secrets.

## Routes

- `/` – Public application form
- `/admin` – Officer login (password)
- `/admin/dashboard` – Pending applications list; Confirm/Release or Reject per row

## Flow

1. Student submits the form → row appended to Google Sheet with status `Pending`
2. Officer logs in at `/admin`, opens dashboard, sees pending list
3. Officer clicks **Confirm/Release** → e-ID images generated from templates, email sent with attachments, status set to `Released`
4. Officer clicks **Reject** → enters reason, rejection email sent, status set to `Rejected`

## License

MIT – see [LICENSE](LICENSE).

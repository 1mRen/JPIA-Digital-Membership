import nodemailer from "nodemailer";
import type { EidBuffers } from "./eid-generator";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM ?? "JPIA <noreply@jpia.org>";

export async function sendEidEmail(
  to: string,
  studentName: string,
  eidBuffers: EidBuffers
): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Your JPIA e-ID is ready",
    html: `
      <p>Dear ${studentName},</p>
      <p>Your JPIA Digital Membership e-ID has been approved and is attached to this email.</p>
      <p>You will find two images: the front and back of your e-ID. Please save them for your records.</p>
      <p>Best regards,<br/>JPIA</p>
    `,
    attachments: [
      { filename: "jpia-eid-front.png", content: eidBuffers.front },
      { filename: "jpia-eid-back.png", content: eidBuffers.back },
    ],
  });
}

export async function sendRejectionEmail(
  to: string,
  studentName: string,
  reason: string
): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "JPIA Membership Application – Update",
    html: `
      <p>Dear ${studentName},</p>
      <p>Thank you for your interest in JPIA membership. Unfortunately, your application could not be approved at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you believe this is an error or have questions, please contact a JPIA officer.</p>
      <p>Best regards,<br/>JPIA</p>
    `,
  });
}

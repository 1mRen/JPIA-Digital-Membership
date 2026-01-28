"use server";

import { cookies } from "next/headers";
import {
  formatTimestamp,
  getPendingRows,
  getRowByIndex,
  updateRowStatus,
} from "@/lib/google-sheets";
import { sendEidEmail, sendRejectionEmail } from "@/lib/email";
import type { SheetRow } from "@/types/application";

const ADMIN_COOKIE = "admin_session";
const ADMIN_COOKIE_VALUE = "verified";

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { success: false, error: "Admin not configured." };
  if (password !== expected) return { success: false, error: "Incorrect password." };
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return { success: true };
}

export async function getPendingApplications(): Promise<SheetRow[]> {
  return getPendingRows();
}

export type ConfirmResult = { success: boolean; error?: string };
export type RejectResult = { success: boolean; error?: string };

export async function confirmApplication(rowIndex: number): Promise<ConfirmResult> {
  try {
    const row = await getRowByIndex(rowIndex);
    if (!row) return { success: false, error: "Application not found." };
    if (row.status !== "Pending") return { success: false, error: "Application is no longer pending." };

    const { generateEidImages } = await import("@/lib/eid-generator");
    const eidBuffers = await generateEidImages(row);
    await sendEidEmail(row.email, row.fullName, eidBuffers);
    const releasedAt = formatTimestamp(new Date());
    await updateRowStatus(rowIndex, "Released", { releasedAt });
    return { success: true };
  } catch (e) {
    console.error("confirmApplication error:", e);
    const err = e as { code?: string; message?: string };
    if (err.code === "EAUTH" || (err.message && err.message.includes("Username and Password not accepted"))) {
      return {
        success: false,
        error: "Email login failed. For Gmail: use an App Password (not your normal password). Turn on 2-Step Verification, then create one at myaccount.google.com/apppasswords. Put it in .env.local as SMTP_PASS and restart the server.",
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to confirm and send e-ID.",
    };
  }
}

export async function rejectApplication(
  rowIndex: number,
  reason: string
): Promise<RejectResult> {
  try {
    const row = await getRowByIndex(rowIndex);
    if (!row) return { success: false, error: "Application not found." };
    if (row.status !== "Pending") return { success: false, error: "Application is no longer pending." };

    const trimmedReason = reason?.trim() || "No reason provided.";
    await sendRejectionEmail(row.email, row.fullName, trimmedReason);
    await updateRowStatus(rowIndex, "Rejected", { rejectedReason: trimmedReason });
    return { success: true };
  } catch (e) {
    console.error("rejectApplication error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to reject and send email.",
    };
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  return value === ADMIN_COOKIE_VALUE;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

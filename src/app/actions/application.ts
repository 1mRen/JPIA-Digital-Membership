"use server";

import { appendRow } from "@/lib/google-sheets";

export interface SubmitResult {
  success: boolean;
  error?: string;
}

export async function submitApplication(formData: FormData): Promise<SubmitResult> {
  try {
    const orNumber = (formData.get("orNumber") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const firstName = (formData.get("firstName") as string)?.trim();
    const middleInitial = (formData.get("middleInitial") as string)?.trim();
    const program = (formData.get("program") as string)?.trim();
    const yearLevel = (formData.get("yearLevel") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!orNumber || !lastName || !firstName || !program || !yearLevel || !email) {
      return { success: false, error: "All required fields must be filled." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Format as: "Last, First MI" (only one comma after last name)
    const fullName = `${lastName}, ${firstName}${middleInitial ? ` ${middleInitial}` : ""}`;
    const programAndYear = `${program} ${yearLevel}`;
    await appendRow({
      orNumber,
      fullName,
      programAndYear,
      email,
    });
    return { success: true };
  } catch (e) {
    console.error("submitApplication error:", e);
    const message = e instanceof Error ? e.message : "Failed to submit application.";
    // Surface common issues: permissions, sheet name, missing env
    const hint =
      message.includes("403") || message.includes("permission")
        ? " Check that the Google Sheet is shared with the service account (Editor)."
        : message.includes("Unable to parse range") || message.includes("Sheet1")
        ? " Check GOOGLE_SHEET_NAME in .env.local matches your sheet tab name (e.g. Sheet1 or Applications)."
        : "";
    return {
      success: false,
      error: message + hint,
    };
  }
}

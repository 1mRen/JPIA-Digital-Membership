export interface ApplicationFormData {
  orNumber: string;
  lastName: string;
  firstName: string;
  middleInitial: string;
  programAndYear: string;
  email: string;
}

export type ApplicationStatus = "Pending" | "Released" | "Rejected";

export interface SheetRow {
  rowIndex: number; // 1-based row number in sheet
  timestamp: string;
  orNumber: string;
  fullName: string;
  programAndYear: string;
  email: string;
  status: ApplicationStatus;
  rejectedReason: string;
  releasedAt: string;
}

export interface PendingRow extends SheetRow {
  status: "Pending";
}

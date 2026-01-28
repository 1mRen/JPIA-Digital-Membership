"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { confirmApplication, rejectApplication, getPendingApplications } from "@/app/actions/admin";
import type { SheetRow } from "@/types/application";

// CHANGE: Increased from 15,000 (15s) to 60,000 (1 minute) to save API quota
const POLL_INTERVAL_MS = 60_000; 

interface AdminDashboardProps {
  initialRows: SheetRow[];
}

export function AdminDashboard({ initialRows }: AdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState(initialRows);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rejectRowIndex, setRejectRowIndex] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionRowIndex, setActionRowIndex] = useState<number | null>(null);
  
  // State to track if we are currently fetching to prevent double-firing
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Separate the fetch logic into a reusable function
  const refreshData = useCallback(async () => {
    // If already loading, skip
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const next = await getPendingApplications();
      
      // Only update if the data is actually different (simple length check optimization)
      // or allows update every time. Here we just set it.
      setRows(next);
      
      // Optional: Log to console so you know it's working without spamming UI
      console.log("Auto-refreshed pending list at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Poll failed", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // 2. The Smart Polling Effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      // SMART CHECK: Only fetch if the user is actually looking at the page
      if (!document.hidden) {
        refreshData();
      }
    }, POLL_INTERVAL_MS);

    // Cleanup when component unmounts
    return () => clearInterval(intervalId);
  }, [refreshData]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleConfirm(rowIndex: number) {
    setActionRowIndex(rowIndex);
    setMessage(null);
    try {
      const result = await confirmApplication(rowIndex);
      if (result.success) {
        setRows((prev) => prev.filter((r) => r.rowIndex !== rowIndex));
        showMessage("success", "E-ID sent and status updated to Released.");
        startTransition(() => router.refresh());
      } else {
        showMessage("error", result.error ?? "Failed to confirm.");
      }
    } finally {
      setActionRowIndex(null);
    }
  }

  async function handleReject(rowIndex: number, reason: string) {
    setActionRowIndex(rowIndex);
    setMessage(null);
    try {
      const result = await rejectApplication(rowIndex, reason.trim() || "No reason provided.");
      if (result.success) {
        setRows((prev) => prev.filter((r) => r.rowIndex !== rowIndex));
        setRejectRowIndex(null);
        setRejectReason("");
        showMessage("success", "Rejection email sent and status updated.");
        startTransition(() => router.refresh());
      } else {
        showMessage("error", result.error ?? "Failed to reject.");
      }
    } finally {
      setActionRowIndex(null);
    }
  }

  // --- RENDER ---
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {rows.length > 0
            ? `Showing ${rows.length} pending application${rows.length !== 1 ? "s" : ""}`
            : "No pending applications at the moment."}
        </div>
        {/* Manual Refresh Button (Good for when you don't want to wait for the poll) */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Check for new"}
        </button>
      </div>

      {message && (
        <p
          className={`rounded py-2 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">OR Number</th>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Program & Year</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowIndex} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{row.timestamp}</td>
                  <td className="px-4 py-3">{row.orNumber}</td>
                  <td className="px-4 py-3">{row.fullName}</td>
                  <td className="px-4 py-3">{row.programAndYear}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 text-right">
                    {rejectRowIndex === row.rowIndex ? (
                      <div className="flex flex-col items-end gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-slate-800 sm:w-48"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReject(row.rowIndex, rejectReason)}
                            disabled={actionRowIndex === row.rowIndex}
                            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Submit Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectRowIndex(null);
                              setRejectReason("");
                            }}
                            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirm(row.rowIndex)}
                          disabled={actionRowIndex !== null}
                          className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionRowIndex === row.rowIndex ? "Processing…" : "Confirm / Release"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectRowIndex(row.rowIndex)}
                          disabled={actionRowIndex !== null}
                          className="rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/actions/admin";

export function AdminDashboardActions() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAdmin();
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleLogout}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Log out
      </button>
      <a
        href="/"
        className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        View public form
      </a>
    </div>
  );
}

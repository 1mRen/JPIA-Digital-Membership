import { redirect } from "next/navigation";
import { getPendingApplications, isAdminLoggedIn } from "@/app/actions/admin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminDashboardActions } from "@/components/AdminDashboardActions";

export default async function AdminDashboardPage() {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) {
    redirect("/admin");
  }
  const pending = await getPendingApplications();
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Pending Applications</h1>
          <AdminDashboardActions />
        </header>
        <AdminDashboard initialRows={pending} />
      </div>
    </main>
  );
}

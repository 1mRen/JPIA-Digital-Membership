import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-slate-800">
              JPIA Digital Membership
            </h1>
            <p className="text-slate-600">
              Submit your application below. You will receive your<br></br>e-ID by email after officer verification.
            </p>
          </div>
          <Link
            href="/admin"
            className="shrink-0 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Admin login
          </Link>
        </div>
        <div className="mb-8" />
        <ApplicationForm />
      </div>
    </main>
  );
}

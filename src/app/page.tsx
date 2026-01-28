import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              JPIA Digital Membership
            </h1>
            <p className="max-w-md text-sm text-slate-600 sm:text-base">
              Submit your application below. You will receive your e-ID by email after officer verification.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Admin login
          </Link>
        </div>
        <ApplicationForm />
      </div>
    </main>
  );
}

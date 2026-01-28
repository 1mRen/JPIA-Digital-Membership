"use client";

import { useState } from "react";
import { submitApplication } from "@/app/actions/application";

export function ApplicationForm() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await submitApplication(formData);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Application submitted. Please wait for officer verification.",
        });
        form.reset();
      } else {
        setMessage({ type: "error", text: result.error ?? "Submission failed." });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      id="application-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="orNumber" className="mb-1 block text-sm font-medium text-slate-700">
          OR Number *
        </label>
        <input
          id="orNumber"
          name="orNumber"
          type="text"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Official Receipt Number"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
            Last Name *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
            First Name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="middleInitial" className="mb-1 block text-sm font-medium text-slate-700">
            M.I.
          </label>
          <input
            id="middleInitial"
            name="middleInitial"
            type="text"
            maxLength={2}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="program" className="mb-1 block text-sm font-medium text-slate-700">
            Program *
          </label>
          <select
            id="program"
            name="program"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select program</option>
            <option value="BS Accountancy">BS Accountancy</option>
            <option value="BS Management Accounting">BS Management Accounting</option>
          </select>
        </div>
        <div>
          <label htmlFor="yearLevel" className="mb-1 block text-sm font-medium text-slate-700">
            Year Level *
          </label>
          <select
            id="yearLevel"
            name="yearLevel"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>
      {message && (
        <p
          className={`rounded py-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}

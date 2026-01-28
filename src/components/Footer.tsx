export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/80 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm text-slate-600">
          <span className="font-medium text-slate-700">Developed by Marc Lawrence Magadan.</span>{" "}
          Open for web development projects and commissions.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm text-slate-600">
          <a
            href="mailto:mmarclawrence@gmail.com"
            className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            mmarclawrence@gmail.com
          </a>
          <span className="text-slate-400" aria-hidden>•</span>
          <a
            href="https://marclawrencemagadan.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            Portfolio
          </a>
        </p>
      </div>
    </footer>
  );
}

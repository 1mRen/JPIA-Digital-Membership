export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm text-slate-600">
          <span className="font-medium text-slate-700">Developed by Marc Lawrence Magadan.</span>{" "}
          Open for web development projects and commissions.
        </p>
        <p className="mt-1 text-center text-sm text-slate-600">
          <a href="mailto:mmarclawrence@gmail.com" className="text-blue-600 hover:underline">
            mmarclawrence@gmail.com
          </a>
          {" \u2022 "}
          <a
            href="https://marclawrencemagadan.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Portfolio
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function BeforeAfterToggle({ view, onChange }) {
  return (
    <div
      role="group"
      aria-label="Toggle before and after view"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
    >
      {["before", "after"].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          className={[
            "rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-all",
            view === v
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800",
          ].join(" ")}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

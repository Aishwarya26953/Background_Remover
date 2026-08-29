export default function BeforeAfterToggle({ view, onChange }) {
  return (
    <div
      role="group"
      aria-label="Toggle before and after view"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5"
    >
      {[
        { id: "before", label: "Before" },
        { id: "after", label: "After" },
      ].map((item) => {
        const isActive = view === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-pressed={isActive}
            className={[
              "rounded-md px-5 py-1.5 text-xs font-bold transition-all duration-150",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

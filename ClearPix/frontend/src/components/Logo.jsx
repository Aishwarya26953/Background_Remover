import { Zap } from "lucide-react";

export default function Logo({ onClick, dark = false }) {
  const content = (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
        <Zap size={14} className="text-white" fill="white" />
      </div>
      <span className={["text-[16px] font-bold tracking-tight", dark ? "text-white" : "text-slate-900"].join(" ")}>
        Clear<span className="text-blue-500">Pix</span>
      </span>
    </div>
  );

  if (!onClick) return <div className="inline-flex items-center">{content}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-lg transition hover:opacity-85 focus-visible:outline-blue-600"
      aria-label="ClearPix home"
    >
      {content}
    </button>
  );
}

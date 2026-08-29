import { Eraser, Paintbrush, RotateCcw, RotateCw } from "lucide-react";

const RETOUCH_TOOLS = [
  { id: "erase", label: "Erase", Icon: Eraser },
  { id: "restore", label: "Restore", Icon: Paintbrush },
];

export default function RetouchTools({
  activeTool,
  onSelectTool,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Erase / Restore */}
      <div className="grid grid-cols-2 gap-1.5">
        {RETOUCH_TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectTool(activeTool === id ? null : id)}
            className={[
              "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition",
              activeTool === id
                ? "border-blue-500/40 bg-blue-600/20 text-blue-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
              "disabled:opacity-40",
            ].join(" ")}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Brush size */}
      {(activeTool === "erase" || activeTool === "restore") && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Brush size</span>
            <span className="text-[11px] font-bold text-slate-300">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="200"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      )}

      {/* Undo / Redo */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={!canUndo || disabled}
          onClick={onUndo}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <RotateCcw size={13} />
          Undo
        </button>
        <button
          type="button"
          disabled={!canRedo || disabled}
          onClick={onRedo}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <RotateCw size={13} />
          Redo
        </button>
      </div>
    </div>
  );
}

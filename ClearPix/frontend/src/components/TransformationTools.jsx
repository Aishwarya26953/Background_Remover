import { useState, useEffect } from "react";
import {
  Crop, Maximize2, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Lock, Check, X, Loader2, AlertCircle,
} from "lucide-react";
import { getImageDimensions } from "../services/imageTransform";

const CROP_RATIOS = [
  { id: "free", label: "Free" },
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "16:9", label: "16:9" },
];

export default function TransformationTools({
  currentImage,
  activeTool,
  onSelectTool,
  cropRatio,
  onCropRatioChange,
  onApplyCrop,
  onCancelCrop,
  onResize,
  onRotate,
  onFlip,
  isApplying,
  error,
}) {
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");

  useEffect(() => {
    if (!currentImage) return;
    getImageDimensions(currentImage)
      .then((dims) => {
        setNaturalDimensions(dims);
        setResizeWidth(dims.width.toString());
        setResizeHeight(dims.height.toString());
      })
      .catch((err) => console.error("Error reading image dimensions:", err));
  }, [currentImage]);

  const handleWidthChange = (val) => {
    const num = parseInt(val, 10);
    setResizeWidth(val);
    if (!isNaN(num) && naturalDimensions.width > 0) {
      setResizeHeight(Math.round(num * (naturalDimensions.height / naturalDimensions.width)).toString());
    }
  };

  const handleHeightChange = (val) => {
    const num = parseInt(val, 10);
    setResizeHeight(val);
    if (!isNaN(num) && naturalDimensions.height > 0) {
      setResizeWidth(Math.round(num * (naturalDimensions.width / naturalDimensions.height)).toString());
    }
  };

  const handleApplyResize = () => {
    const w = parseInt(resizeWidth, 10);
    const h = parseInt(resizeHeight, 10);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
    onResize(w, h);
  };

  const handleCancelResize = () => {
    setResizeWidth(naturalDimensions.width.toString());
    setResizeHeight(naturalDimensions.height.toString());
    onSelectTool(null);
  };

  const tools = [
    { id: "crop", label: "Crop", icon: Crop },
    { id: "resize", label: "Resize", icon: Maximize2 },
    { id: "rotate", label: "Rotate", icon: RotateCw },
    { id: "flip", label: "Flip", icon: FlipHorizontal },
  ];

  // Shared input class for dark sidebar
  const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-200 focus-visible:outline-blue-500";
  // Shared sub-panel wrapper
  const subPanel = "mt-3 rounded-xl border border-white/10 bg-white/5 p-3 space-y-3";

  return (
    <div className="flex flex-col gap-3">
      {/* Tool tabs */}
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onSelectTool(isActive ? null : t.id)}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition-all",
                isActive
                  ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              ].join(" ")}
            >
              <t.icon size={14} strokeWidth={2} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Crop sub-panel */}
      {activeTool === "crop" && (
        <div className={subPanel}>
          <p className="text-[11px] font-bold text-slate-300">Aspect ratio</p>
          <div className="grid grid-cols-4 gap-1">
            {CROP_RATIOS.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => onCropRatioChange(r.id)}
                className={[
                  "rounded-lg py-1.5 text-[11px] font-bold transition",
                  cropRatio === r.id
                    ? "bg-blue-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">Drag handles on the image to adjust.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onApplyCrop}
              disabled={isApplying}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {isApplying ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
              Apply
            </button>
            <button
              type="button"
              onClick={onCancelCrop}
              disabled={isApplying}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resize sub-panel */}
      {activeTool === "resize" && (
        <div className={subPanel}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-300">Dimensions (px)</p>
            <span className="font-mono text-[10px] text-slate-500">
              {naturalDimensions.width} × {naturalDimensions.height}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-500">Width</label>
              <input type="number" min="1" max="8000" value={resizeWidth} onChange={(e) => handleWidthChange(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-500">Height</label>
              <input type="number" min="1" max="8000" value={resizeHeight} onChange={(e) => handleHeightChange(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Lock size={11} className="text-blue-400" />
            Aspect ratio locked
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyResize}
              disabled={isApplying}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {isApplying ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
              Apply
            </button>
            <button
              type="button"
              onClick={handleCancelResize}
              disabled={isApplying}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rotate sub-panel */}
      {activeTool === "rotate" && (
        <div className={subPanel}>
          <p className="text-[11px] font-bold text-slate-300">Rotate 90°</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onRotate(-90)}
              disabled={isApplying}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <RotateCcw size={13} />
              Left
            </button>
            <button
              type="button"
              onClick={() => onRotate(90)}
              disabled={isApplying}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <RotateCw size={13} />
              Right
            </button>
          </div>
        </div>
      )}

      {/* Flip sub-panel */}
      {activeTool === "flip" && (
        <div className={subPanel}>
          <p className="text-[11px] font-bold text-slate-300">Flip image</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onFlip("horizontal")}
              disabled={isApplying}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <FlipHorizontal size={13} />
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => onFlip("vertical")}
              disabled={isApplying}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <FlipVertical size={13} />
              Vertical
            </button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

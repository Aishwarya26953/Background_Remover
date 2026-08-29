import { useRef, useState } from "react";
import { ImagePlus, X, AlertCircle, Check } from "lucide-react";
import { ALLOWED_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "../constants";

const CHECKERBOARD = {
  backgroundColor: "#1e2530",
  backgroundImage:
    "linear-gradient(45deg,#2d3748 25%,transparent 25%)," +
    "linear-gradient(-45deg,#2d3748 25%,transparent 25%)," +
    "linear-gradient(45deg,transparent 75%,#2d3748 75%)," +
    "linear-gradient(-45deg,transparent 75%,#2d3748 75%)",
  backgroundSize: "10px 10px",
  backgroundPosition: "0 0,0 5px,5px -5px,-5px 0",
};

export default function BackgroundControls({
  background,
  customColor,
  backgroundImage,
  onBackgroundChange,
  onColorChange,
  onBackgroundImageChange,
  onRemoveBackgroundImage,
  onToolClear,
}) {
  const colorRef = useRef(null);
  const imageRef = useRef(null);
  const [bgError, setBgError] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setBgError("Use JPG, PNG, or WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setBgError(`Max ${MAX_FILE_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }
    setBgError("");
    onBackgroundImageChange(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSelectOption = (optId) => {
    // Clear any active transform/retouch tool when switching background
    onToolClear?.();
    if (optId === "color") {
      onBackgroundChange("color");
      colorRef.current?.click();
    } else if (optId === "image") {
      imageRef.current?.click();
    } else {
      onBackgroundChange(optId);
    }
  };

  const options = [
    {
      id: "transparent",
      label: "Transparent",
      swatch: <div className="h-full w-full rounded-md" style={CHECKERBOARD} />,
    },
    {
      id: "white",
      label: "White",
      swatch: <div className="h-full w-full rounded-md bg-white" />,
    },
    {
      id: "color",
      label: "Color",
      swatch: <div className="h-full w-full rounded-md" style={{ background: customColor }} />,
    },
    {
      id: "image",
      label: "Image",
      swatch: backgroundImage ? (
        <div className="h-full w-full rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-md bg-white/5">
          <ImagePlus size={12} className="text-slate-500" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const isActive = background === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelectOption(opt.id)}
            aria-pressed={isActive}
            className={[
              "flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all",
              isActive
                ? "border-blue-500/40 bg-blue-600/15 text-blue-300"
                : "border-white/8 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-lg border border-white/10">
              {opt.swatch}
            </div>
            <span className="flex-1 text-xs font-semibold">{opt.label}</span>
            {isActive && <Check size={13} className="shrink-0 text-blue-400" />}
          </button>
        );
      })}

      {/* Color picker row */}
      {background === "color" && (
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
          <div className="h-4 w-4 shrink-0 rounded border border-white/10" style={{ background: customColor }} />
          <span className="flex-1 font-mono text-[11px] font-bold text-slate-300">{customColor.toUpperCase()}</span>
          <button
            type="button"
            onClick={() => colorRef.current?.click()}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
          >
            Change
          </button>
        </div>
      )}

      {/* Image remove row */}
      {background === "image" && backgroundImage && (
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
          <span className="flex-1 text-[11px] font-medium text-slate-400">Custom background</span>
          <button
            type="button"
            onClick={onRemoveBackgroundImage}
            className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300"
          >
            <X size={11} strokeWidth={2.5} />
            Remove
          </button>
        </div>
      )}

      {bgError && (
        <div role="alert" className="flex items-start gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-[11px] text-red-400">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          {bgError}
        </div>
      )}

      <input ref={colorRef} type="color" value={customColor} onChange={(e) => onColorChange(e.target.value)} className="sr-only" aria-hidden="true" />
      <input ref={imageRef} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handleImageUpload} className="hidden" aria-hidden="true" />
    </div>
  );
}

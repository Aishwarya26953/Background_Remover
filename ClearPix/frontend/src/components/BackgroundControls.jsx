import { useRef, useState } from "react";
import { ImagePlus, X, AlertCircle, Check } from "lucide-react";

const CHECKERBOARD = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg,#e2e8f0 25%,transparent 25%)," +
    "linear-gradient(-45deg,#e2e8f0 25%,transparent 25%)," +
    "linear-gradient(45deg,transparent 75%,#e2e8f0 75%)," +
    "linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)",
  backgroundSize: "14px 14px",
  backgroundPosition: "0 0,0 7px,7px -7px,-7px 0",
};

export default function BackgroundControls({
  background,
  customColor,
  backgroundImage,
  onBackgroundChange,
  onColorChange,
  onBackgroundImageChange,
  onRemoveBackgroundImage,
}) {
  const colorRef = useRef(null);
  const imageRef = useRef(null);
  const [bgError, setBgError] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setBgError("Please upload a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBgError("Background image must be under 10MB.");
      e.target.value = "";
      return;
    }

    setBgError("");
    const url = URL.createObjectURL(file);
    onBackgroundImageChange(url);
    e.target.value = "";
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
      swatch: (
        <div className="h-full w-full rounded-md border border-slate-100 bg-white" />
      ),
    },
    {
      id: "color",
      label: "Color",
      swatch: (
        <div
          className="h-full w-full rounded-md"
          style={{ background: customColor }}
        />
      ),
      onClick: () => {
        onBackgroundChange("color");
        setTimeout(() => colorRef.current?.click(), 50);
      },
    },
    {
      id: "image",
      label: backgroundImage ? "Change image" : "Upload image",
      swatch: backgroundImage ? (
        <div
          className="h-full w-full rounded-md bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100">
          <ImagePlus size={13} className="text-slate-400" />
        </div>
      ),
      onClick: () => imageRef.current?.click(),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Background
      </p>

      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const isActive = background === opt.id;
          return (
            <button
              key={opt.id}
              onClick={opt.onClick ?? (() => onBackgroundChange(opt.id))}
              aria-pressed={isActive}
              aria-label={`Set background to ${opt.label}`}
              className={[
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                isActive
                  ? "border-blue-200 bg-blue-50"
                  : "border-transparent bg-slate-50 hover:bg-slate-100",
              ].join(" ")}
            >
              {/* Swatch */}
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-slate-200">
                {opt.swatch}
              </div>

              {/* Label */}
              <span
                className={[
                  "flex-1 text-sm font-medium",
                  isActive ? "text-blue-700" : "text-slate-700",
                ].join(" ")}
              >
                {opt.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <Check size={14} className="shrink-0 text-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Color hex display */}
      {background === "color" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div
            className="h-4 w-4 shrink-0 rounded border border-slate-200"
            style={{ background: customColor }}
          />
          <span className="flex-1 font-mono text-xs font-medium text-slate-600">
            {customColor.toUpperCase()}
          </span>
          <button
            onClick={() => colorRef.current?.click()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Change
          </button>
        </div>
      )}

      {/* Background image remove */}
      {background === "image" && backgroundImage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="flex-1 text-xs font-medium text-slate-600">
            Custom background applied
          </span>
          <button
            onClick={onRemoveBackgroundImage}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
            aria-label="Remove background image"
          >
            <X size={12} />
            Remove
          </button>
        </div>
      )}

      {/* Inline error */}
      {bgError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {bgError}
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={colorRef}
        type="color"
        value={customColor}
        onChange={(e) => {
          onColorChange(e.target.value);
          onBackgroundChange("color");
        }}
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      <input
        ref={imageRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}

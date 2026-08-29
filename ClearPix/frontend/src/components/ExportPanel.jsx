import { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { drawComposition, loadImage } from "../services/imageComposition";

const FORMATS = [
  { id: "png", label: "PNG" },
  { id: "jpg", label: "JPG" },
  { id: "webp", label: "WebP" },
];

export default function ExportPanel({
  resultPreview,
  background,
  customColor,
  backgroundImage,
  fileName = "result",
  format = "png",
  onFormatChange,
}) {
  const [exporting, setExporting] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const effectiveFormat = background === "transparent" && format === "jpg" ? "png" : format;
  const mimeType =
    effectiveFormat === "jpg" ? "image/jpeg" :
    effectiveFormat === "webp" ? "image/webp" : "image/png";

  const handleDownload = async () => {
    if (!resultPreview || exporting) return;
    setExporting(true);
    setDownloadError("");
    try {
      const foreground = await loadImage(resultPreview);
      const canvas = document.createElement("canvas");
      canvas.width = foreground.naturalWidth;
      canvas.height = foreground.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      await drawComposition(ctx, { foreground, background, customColor, backgroundImage });
      canvas.toBlob(
        (blob) => {
          if (!blob) { setDownloadError("Failed to generate file."); setExporting(false); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `clearpix-${fileName.replace(/\.[^/.]+$/, "")}.${effectiveFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExporting(false);
        },
        mimeType,
        0.95
      );
    } catch (error) {
      console.error("Export failed:", error);
      setDownloadError("Could not prepare the image.");
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Format selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400">Format</span>
        <div className="flex gap-1">
          {FORMATS.map((item) => {
            const isDisabled = item.id === "jpg" && background === "transparent";
            const isActive = format === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => !isDisabled && onFormatChange?.(item.id)}
                disabled={isDisabled}
                title={isDisabled ? "JPG doesn't support transparency" : undefined}
                className={[
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                  isActive && !isDisabled
                    ? "bg-white/15 text-white"
                    : isDisabled
                    ? "cursor-not-allowed text-slate-600"
                    : "text-slate-400 hover:bg-white/10 hover:text-slate-200",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {background === "transparent" && format === "jpg" && (
        <p className="text-[10px] text-slate-500">Transparent images export as PNG</p>
      )}

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={exporting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60"
      >
        {exporting ? (
          <><Loader2 size={14} className="animate-spin" />Preparing…</>
        ) : (
          <><Download size={14} strokeWidth={2.2} />Download {effectiveFormat.toUpperCase()}</>
        )}
      </button>

      {downloadError && (
        <div role="alert" className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[11px] text-red-400">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const FORMATS = [
  { id: "png", label: "PNG" },
  { id: "jpg", label: "JPG" },
  { id: "webp", label: "WebP" },
];

function drawCoverImage(ctx, image, width, height) {
  const ir = image.naturalWidth / image.naturalHeight;
  const cr = width / height;
  let dw, dh, x, y;
  if (ir > cr) {
    dh = height; dw = dh * ir;
    x = (width - dw) / 2; y = 0;
  } else {
    dw = width; dh = dw / ir;
    x = 0; y = (height - dh) / 2;
  }
  ctx.drawImage(image, x, y, dw, dh);
}

export default function ExportPanel({
  resultPreview,
  background,
  customColor,
  backgroundImage,
}) {
  const [format, setFormat] = useState("png");
  const [exporting, setExporting] = useState(false);

  // Transparent + JPG → force PNG
  const effectiveFormat =
    background === "transparent" && format === "jpg" ? "png" : format;

  const mimeType =
    effectiveFormat === "jpg" ? "image/jpeg"
    : effectiveFormat === "webp" ? "image/webp"
    : "image/png";

  const handleDownload = () => {
    if (!resultPreview || exporting) return;
    setExporting(true);

    const fg = new Image();
    fg.crossOrigin = "anonymous";

    fg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = fg.naturalWidth;
      canvas.height = fg.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setExporting(false); return; }

      const commit = () => {
        ctx.drawImage(fg, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { setExporting(false); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `clearpix-result.${effectiveFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setExporting(false);
          },
          mimeType,
          0.95
        );
      };

      if (background === "transparent") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commit();
      } else if (background === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        commit();
      } else if (background === "color") {
        ctx.fillStyle = customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        commit();
      } else if (background === "image" && backgroundImage) {
        const bg = new Image();
        bg.crossOrigin = "anonymous";
        bg.onload = () => { drawCoverImage(ctx, bg, canvas.width, canvas.height); commit(); };
        bg.onerror = () => setExporting(false);
        bg.src = backgroundImage;
      } else {
        commit();
      }
    };

    fg.onerror = () => setExporting(false);
    fg.src = resultPreview;
  };

  return (
    <div>
      {/* Primary download CTA */}
      <button
        onClick={handleDownload}
        disabled={exporting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
      >
        {exporting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <Download size={15} strokeWidth={2.2} />
            Download {effectiveFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Format selector — secondary */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-xs text-slate-400">Format:</span>
        <div className="flex gap-1">
          {FORMATS.map((f) => {
            const isDisabled = f.id === "jpg" && background === "transparent";
            const isActive = format === f.id;
            return (
              <button
                key={f.id}
                onClick={() => !isDisabled && setFormat(f.id)}
                disabled={isDisabled}
                title={
                  isDisabled
                    ? "JPG doesn't support transparency"
                    : undefined
                }
                className={[
                  "rounded px-2.5 py-1 text-xs font-semibold transition",
                  isActive && !isDisabled
                    ? "bg-slate-900 text-white"
                    : isDisabled
                    ? "cursor-not-allowed text-slate-300"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {background === "transparent" && format === "jpg" && (
        <p className="mt-1.5 text-xs text-slate-400">
          Transparent images export as PNG
        </p>
      )}
    </div>
  );
}

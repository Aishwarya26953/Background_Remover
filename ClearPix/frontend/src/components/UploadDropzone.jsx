import { useRef } from "react";
import { Upload, ImagePlus, AlertCircle } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadDropzone({
  onFile,
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  error,
  dropzoneRef,
}) {
  const fileInputRef = useRef(null);

  const openPicker = () => fileInputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        ref={dropzoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload image dropzone"
        onClick={openPicker}
        onKeyDown={(e) => e.key === "Enter" && openPicker()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 sm:py-20",
          dragActive
            ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
            : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30",
        ].join(" ")}
      >
        {/* Icon */}
        <div
          className={[
            "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            dragActive ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm border border-slate-200",
          ].join(" ")}
        >
          {dragActive ? (
            <ImagePlus size={26} strokeWidth={1.5} />
          ) : (
            <Upload size={24} strokeWidth={1.5} />
          )}
        </div>

        {/* Text */}
        <p className="text-base font-semibold text-slate-800">
          {dragActive ? "Drop your image here" : "Drop your image here"}
        </p>
        <p className="mt-1.5 text-sm text-slate-500">
          or{" "}
          <span className="font-semibold text-blue-600 underline underline-offset-2">
            browse files
          </span>
        </p>

        {/* Format hint */}
        <p className="mt-5 text-xs text-slate-400">
          JPG, PNG, WEBP · Up to {MAX_SIZE_MB}MB
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}

export { ALLOWED_TYPES, MAX_SIZE_BYTES };

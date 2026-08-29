import { useRef } from "react";
import { UploadCloud, ImagePlus, AlertCircle } from "lucide-react";
import { ALLOWED_TYPES, MAX_FILE_SIZE_MB, MAX_BATCH_SIZE } from "../constants";

export default function MultiUploadDropzone({
  onFiles,
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  error,
  dropzoneRef,
  disabled = false,
}) {
  const fileInputId = "main-upload-input";
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Reset value immediately so the same file can be selected again
    e.target.value = "";
    if (files.length > 0) onFiles(files);
  };

  // Clicking the dropzone area (not the label/button) also opens the picker
  const handleAreaClick = (e) => {
    // Don't double-fire if the click originated from the label or the input
    if (disabled) return;
    if (e.target.closest("label") || e.target.tagName === "INPUT") return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input — id used by the label for native association */}
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Dropzone area */}
      <div
        ref={dropzoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload images — click or drag and drop"
        onClick={handleAreaClick}
        onKeyDown={handleKeyDown}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-150 sm:py-12",
          dragActive
            ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-500/10"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/60",
          disabled ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        {/* Icon */}
        <div
          className={[
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150",
            dragActive
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600",
          ].join(" ")}
        >
          {dragActive
            ? <ImagePlus size={24} strokeWidth={2} />
            : <UploadCloud size={24} strokeWidth={1.75} />}
        </div>

        <p className="text-base font-bold text-slate-900">
          {dragActive ? "Drop to upload" : "Drag & drop images here"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {dragActive ? "Release to add files" : "or"}
        </p>

        {/* Browse button — native label so it works on all browsers including iOS */}
        {!dragActive && (
          <label
            htmlFor={fileInputId}
            className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:border-blue-400 hover:text-blue-600 active:scale-[0.98]"
          >
            Browse files
          </label>
        )}

        <p className="mt-4 text-xs text-slate-400">
          JPG · PNG · WEBP &nbsp;·&nbsp; up to {MAX_FILE_SIZE_MB} MB each &nbsp;·&nbsp; up to {MAX_BATCH_SIZE} images
        </p>
      </div>

      {/* Inline error */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}

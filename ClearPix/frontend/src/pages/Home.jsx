import { useRef, useState } from "react";
import { Upload, Wand2, Download, ChevronDown, ArrowRight } from "lucide-react";
import MultiUploadDropzone from "../components/MultiUploadDropzone";
import SelectedImageGrid from "../components/SelectedImageGrid";
import { validateFiles } from "../constants";

const STEPS = [
  { icon: Upload, title: "Upload", desc: "1–10 JPG, PNG, or WEBP images up to 10 MB each." },
  { icon: Wand2, title: "Process", desc: "AI isolates the subject with clean, precise edges." },
  { icon: Download, title: "Download", desc: "Export transparent PNGs or add a custom background." },
];

const FAQ_ITEMS = [
  {
    q: "How many images can I process at once?",
    a: "Up to 10 images per batch (JPG, PNG, or WEBP, max 10 MB each).",
  },
  {
    q: "Is ClearPix free?",
    a: "Yes — no watermark, no account, no subscription.",
  },
  {
    q: "Are my photos stored?",
    a: "No. Images are processed and never permanently stored on our servers.",
  },
  {
    q: "Can I add a custom background?",
    a: "Yes. Open any result in the editor to apply transparent, white, a hex color, or a custom image background.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <ChevronDown
          size={15}
          className={[
            "shrink-0 text-slate-400 transition-transform duration-200",
            open ? "rotate-180 text-blue-600" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-slate-500">{a}</p>
      )}
    </div>
  );
}

export default function Home({
  selectedFiles = [],
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  onStartBatch,
  uploadRef,
  initialError = "",
  clearSignal = 0,
}) {
  const dropzoneRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  // Store the error alongside the clearSignal value at the time it was set.
  // If clearSignal has advanced, the error is stale and should not be shown.
  const [localError, setLocalError] = useState({ msg: "", signal: 0 });

  const activeError =
    (localError.signal === clearSignal ? localError.msg : "") || initialError;

  const handleIncomingFiles = (incomingList) => {
    const { valid, errors } = validateFiles(incomingList, selectedFiles);
    setLocalError({ msg: errors.length > 0 ? errors[0] : "", signal: clearSignal });
    if (valid.length > 0) onAddFiles(valid);
  };

  // Clear local error when user explicitly clears all files
  const handleClearAll = () => {
    setLocalError({ msg: "", signal: clearSignal });
    onClearFiles();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) handleIncomingFiles(files);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current && !dropzoneRef.current.contains(e.relatedTarget)) setDragActive(false);
  };

  const hasSelected = selectedFiles.length > 0;

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="upload" className="px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Headline */}
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Remove backgrounds{" "}
              <span className="text-blue-600">instantly.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Upload up to 10 images — AI removes the background in seconds.
            </p>
          </div>

          {/* Upload area */}
          <div ref={uploadRef}>
            <MultiUploadDropzone
              onFiles={handleIncomingFiles}
              dragActive={dragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              error={activeError}
              dropzoneRef={dropzoneRef}
            />

            {hasSelected && (
              <SelectedImageGrid
                selectedFiles={selectedFiles}
                onRemove={onRemoveFile}
                onAddMore={handleIncomingFiles}
                onClearAll={handleClearAll}
              />
            )}

            {hasSelected && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={onStartBatch}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
                >
                  <Wand2 size={16} />
                  Remove backgrounds · {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200/70 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            How it works
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <item.icon size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-5 text-center text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-5">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

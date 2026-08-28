import { useRef, useState } from "react";
import {
  Upload,
  Wand2,
  Download,
  Layers,
  ImageOff,
  Palette,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import UploadDropzone, {
  ALLOWED_TYPES,
  MAX_SIZE_BYTES,
} from "../components/UploadDropzone";

// ─── FAQ ────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What image formats are supported?",
    a: "ClearPix supports JPG, JPEG, PNG, and WEBP images up to 10MB.",
  },
  {
    q: "How does ClearPix remove backgrounds?",
    a: "ClearPix uses a deep-learning AI model (U2Net) that detects the subject in your image and separates it from the background with high accuracy.",
  },
  {
    q: "Is ClearPix free?",
    a: "Yes. ClearPix is completely free to use. No account or credit card required.",
  },
  {
    q: "Will my image quality be reduced?",
    a: "No. ClearPix returns a full-quality transparent PNG. The result preserves your original image detail.",
  },
  {
    q: "Can I add a new background?",
    a: "Yes. After removing the background you can apply a transparent, white, custom color, or your own background image — then download the final result.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = q.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <ChevronDown
          size={18}
          className={[
            "shrink-0 text-slate-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <p id={id} className="pb-5 text-sm leading-6 text-slate-500">
          {a}
        </p>
      )}
    </div>
  );
}

// ─── USE CASES ───────────────────────────────────────────────────────────────

const USE_CASES = [
  { label: "Product Photos", desc: "Clean white or transparent backgrounds for e-commerce listings." },
  { label: "Profile Pictures", desc: "Professional headshots with any background you choose." },
  { label: "Marketing Graphics", desc: "Isolate subjects for ads, banners, and social content." },
  { label: "E-commerce", desc: "Consistent product imagery that converts." },
  { label: "Social Media", desc: "Eye-catching visuals for every platform." },
];

// ─── FEATURES ────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Wand2, label: "AI Background Removal", desc: "Accurate subject detection powered by deep learning." },
  { icon: ImageOff, label: "Transparent PNG", desc: "Full-quality transparent output ready for any use." },
  { icon: Palette, label: "Custom Backgrounds", desc: "Apply colors, gradients, or your own background image." },
  { icon: Sparkles, label: "High-quality Results", desc: "Clean edges and preserved fine detail." },
  { icon: ShieldCheck, label: "No Signup Required", desc: "Upload and download without creating an account." },
  { icon: Layers, label: "Multiple Formats", desc: "Export as PNG, JPG, or WebP." },
];

// ─── HOME ────────────────────────────────────────────────────────────────────

export default function Home({ onFile, uploadRef }) {
  const dropzoneRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 10MB.");
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (validate(file)) onFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current && !dropzoneRef.current.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  };

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="upload"
        className="relative overflow-hidden bg-white px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8"
      >
        {/* Subtle background tint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-50/60 to-transparent"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            AI Image Background Remover
          </p>

          {/* Headline */}
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Remove image backgrounds.
            <br />
            <span className="text-blue-600">Keep what matters.</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            Create clean, transparent images in seconds with AI-powered
            background removal.
          </p>

          {/* Trust pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["No signup required", "Fast processing", "Transparent PNG"].map(
              (t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
                >
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  {t}
                </span>
              )
            )}
          </div>

          {/* Upload dropzone */}
          <div ref={uploadRef} className="mt-10">
            <UploadDropzone
              onFile={handleFile}
              dragActive={dragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              error={error}
              dropzoneRef={dropzoneRef}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-y border-slate-100 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Three steps. That's it.
            </h2>
          </div>

          <div className="grid gap-0 sm:grid-cols-3">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Upload",
                desc: "Choose any JPG, PNG, or WEBP image from your device.",
              },
              {
                icon: Wand2,
                step: "02",
                title: "AI removes the background",
                desc: "Our model detects your subject and removes the background automatically.",
              },
              {
                icon: Download,
                step: "03",
                title: "Download your image",
                desc: "Preview the result, customize the background, and export.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center px-6 text-center">
                {/* Connector line */}
                {i < 2 && (
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-7 hidden h-px w-1/2 bg-slate-200 sm:block"
                  />
                )}
                {i > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-7 hidden h-px w-1/2 bg-slate-200 sm:block"
                  />
                )}

                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-blue-600">
                  <item.icon size={22} strokeWidth={1.75} />
                </div>

                <p className="mt-1 text-xs font-bold text-slate-300">{item.step}</p>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Use cases
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built for every workflow.
            </h2>
          </div>

          <div className="grid gap-px bg-slate-100 overflow-hidden rounded-2xl border border-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <div
                key={uc.label}
                className="bg-white px-6 py-7 transition hover:bg-slate-50"
              >
                <h3 className="text-sm font-bold text-slate-900">{uc.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="border-t border-slate-100 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Everything you need. Nothing you don't.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex gap-4">
                <div className="mt-0.5 shrink-0 text-blue-600">
                  <f.icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{f.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="border-t border-slate-100 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              FAQ
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Common questions
            </h2>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to remove your background?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Upload an image and see the result in seconds.
          </p>
          <button
            onClick={() =>
              uploadRef?.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95"
          >
            Upload Image
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

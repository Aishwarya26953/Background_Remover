import { useState } from "react";
import { Zap, RotateCcw, Download } from "lucide-react";
import ImageCanvas from "../components/ImageCanvas";
import BeforeAfterToggle from "../components/BeforeAfterToggle";
import BackgroundControls from "../components/BackgroundControls";
import ExportPanel from "../components/ExportPanel";

export default function Editor({ originalPreview, resultPreview, onReset }) {
  const [view, setView] = useState("after");
  const [background, setBackground] = useState("transparent");
  const [customColor, setCustomColor] = useState("#e8f0ff");
  const [backgroundImage, setBackgroundImage] = useState(null);

  const currentImage = view === "before" ? originalPreview : resultPreview;

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackground("transparent");
  };

  // Shared export props — passed to both the sidebar panel and the
  // mobile sticky download button via ExportPanel
  const exportProps = {
    resultPreview,
    background,
    customColor,
    backgroundImage,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9]">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <button
            onClick={onReset}
            className="flex items-center gap-2 focus-visible:outline-none"
            aria-label="Go back to home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-slate-900">
              Clear<span className="text-blue-600">Pix</span>
            </span>
          </button>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">New image</span>
            </button>

            {/* Mobile-only download shortcut */}
            <div className="sm:hidden">
              <ExportPanel {...exportProps} />
            </div>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE ──────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col lg:flex-row lg:items-start">

        {/* ── LEFT: IMAGE AREA ─────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:py-8 min-w-0">

          {/* Before / After + label row */}
          <div className="flex items-center justify-between">
            <BeforeAfterToggle view={view} onChange={setView} />
            <span className="text-xs text-slate-400 select-none">
              {view === "before" ? "Original" : "Background removed"}
            </span>
          </div>

          {/* Image canvas */}
          <ImageCanvas
            view={view}
            currentImage={currentImage}
            background={background}
            customColor={customColor}
            backgroundImage={backgroundImage}
          />
        </div>

        {/* ── RIGHT: CONTROLS SIDEBAR ──────────────────────────────────── */}
        <aside className="w-full shrink-0 border-t border-slate-200 bg-white lg:w-[280px] lg:border-l lg:border-t-0 xl:w-[300px]">
          <div className="flex flex-col gap-0 divide-y divide-slate-100">

            {/* Background section */}
            <div className="px-5 py-5">
              {view === "after" ? (
                <BackgroundControls
                  background={background}
                  customColor={customColor}
                  backgroundImage={backgroundImage}
                  onBackgroundChange={setBackground}
                  onColorChange={setCustomColor}
                  onBackgroundImageChange={(url) => {
                    setBackgroundImage(url);
                    setBackground("image");
                  }}
                  onRemoveBackgroundImage={handleRemoveBackgroundImage}
                />
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Background
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Switch to After to customize the background.
                  </p>
                </div>
              )}
            </div>

            {/* Export section — desktop only (mobile has header shortcut) */}
            <div className="hidden px-5 py-5 sm:block">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Export
              </p>
              <ExportPanel {...exportProps} />
            </div>

            {/* New image — desktop */}
            <div className="hidden px-5 py-4 sm:block">
              <button
                onClick={onReset}
                className="w-full text-center text-sm font-medium text-slate-400 underline underline-offset-4 transition hover:text-slate-700"
              >
                Remove another image
              </button>
            </div>

          </div>
        </aside>
      </div>

      {/* ── MOBILE STICKY FOOTER ─────────────────────────────────────── */}
      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
        <ExportPanel {...exportProps} />
      </div>

    </div>
  );
}

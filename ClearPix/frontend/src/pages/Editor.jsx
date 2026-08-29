import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Logo from "../components/Logo";
import ImageCanvas from "../components/ImageCanvas";
import BeforeAfterToggle from "../components/BeforeAfterToggle";
import BackgroundControls from "../components/BackgroundControls";
import ExportPanel from "../components/ExportPanel";
import TransformationTools from "../components/TransformationTools";
import RetouchTools from "../components/RetouchTools";
import CropOverlay from "../components/CropOverlay";
import BrushOverlay from "../components/BrushOverlay";
import {
  applyProjectTransformations,
  applyRetouchStrokes,
  getImageDimensions,
} from "../services/imageTransform";

const HISTORY_LIMIT = 50;

// Collapsible sidebar section
function SideSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-800/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        {open ? (
          <ChevronUp size={13} className="text-slate-500" />
        ) : (
          <ChevronDown size={13} className="text-slate-500" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function Editor({
  originalPreview,
  resultPreview,
  projectTransforms: initialTransforms = [],
  retouchStrokes: initialStrokes = [],
  initialBackground = "transparent",
  initialCustomColor = "#e8f0ff",
  initialBackgroundImage = null,
  onEditorStateChange,
  onReset,
  onBack,
  fileName = "result",
}) {
  const [view, setView] = useState("after");
  const [activeTool, setActiveTool] = useState(null);
  const [cropRatio, setCropRatio] = useState("free");
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [brushSize, setBrushSize] = useState(40);
  const [format, setFormat] = useState("png");

  const [projectTransforms, setProjectTransforms] = useState(initialTransforms);
  const [retouchStrokes, setRetouchStrokes] = useState(initialStrokes);
  const [background, setBackground] = useState(initialBackground);
  const [customColor, setCustomColor] = useState(initialCustomColor);
  const [backgroundImage, setBackgroundImage] = useState(initialBackgroundImage);

  const [beforePreview, setBeforePreview] = useState(originalPreview);
  const [afterPreview, setAfterPreview] = useState(resultPreview);
  const [isRendering, setIsRendering] = useState(false);
  const [editError, setEditError] = useState("");

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const imageRef = useRef(null);
  const beforeUrlRef = useRef(null);
  const afterUrlRef = useRef(null);

  // ── Snapshot / history ────────────────────────────────────────────────────

  const snapshot = useCallback(
    () => ({ projectTransforms, retouchStrokes, background, customColor, backgroundImage }),
    [projectTransforms, retouchStrokes, background, customColor, backgroundImage]
  );

  const persist = useCallback(
    (next) => {
      onEditorStateChange?.({
        projectTransforms: next.projectTransforms,
        retouchStrokes: next.retouchStrokes,
        background: next.background,
        customColor: next.customColor,
        backgroundImage: next.backgroundImage,
      });
    },
    [onEditorStateChange]
  );

  const applySnapshot = useCallback(
    (next) => {
      setProjectTransforms(next.projectTransforms);
      setRetouchStrokes(next.retouchStrokes);
      setBackground(next.background);
      setCustomColor(next.customColor);
      setBackgroundImage(next.backgroundImage);
      persist(next);
    },
    [persist]
  );

  const commit = useCallback(
    (next) => {
      setHistory((items) => [...items, snapshot()].slice(-HISTORY_LIMIT));
      setFuture([]);
      applySnapshot(next);
    },
    [snapshot, applySnapshot]
  );

  const undo = useCallback(() => {
    if (!history.length || isRendering) return;
    const previous = history[history.length - 1];
    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [snapshot(), ...items].slice(0, HISTORY_LIMIT));
    applySnapshot(previous);
  }, [history, isRendering, snapshot, applySnapshot]);

  const redo = useCallback(() => {
    if (!future.length || isRendering) return;
    const next = future[0];
    setFuture((items) => items.slice(1));
    setHistory((items) => [...items, snapshot()].slice(-HISTORY_LIMIT));
    applySnapshot(next);
  }, [future, isRendering, snapshot, applySnapshot]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.target.matches("input, textarea, select")) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  // ── URL cleanup ───────────────────────────────────────────────────────────

  useEffect(
    () => () => {
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current);
      if (afterUrlRef.current) URL.revokeObjectURL(afterUrlRef.current);
    },
    []
  );

  useEffect(
    () => () => {
      if (backgroundImage?.startsWith("blob:")) URL.revokeObjectURL(backgroundImage);
    },
    [backgroundImage]
  );

  // ── Render effect ─────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setIsRendering(true);
      setEditError("");
      try {
        const base = await getImageDimensions(resultPreview);
        const [beforeBlob, transformedCutoutBlob] = await Promise.all([
          applyProjectTransformations(originalPreview, base, projectTransforms),
          applyProjectTransformations(resultPreview, base, projectTransforms),
        ]);
        const beforeUrl = URL.createObjectURL(beforeBlob);
        const cutoutUrl = URL.createObjectURL(transformedCutoutBlob);
        const afterBlob = await applyRetouchStrokes(cutoutUrl, beforeUrl, retouchStrokes);
        URL.revokeObjectURL(cutoutUrl);
        const afterUrl = URL.createObjectURL(afterBlob);
        if (cancelled) { URL.revokeObjectURL(beforeUrl); URL.revokeObjectURL(afterUrl); return; }
        const oldBefore = beforeUrlRef.current;
        const oldAfter = afterUrlRef.current;
        beforeUrlRef.current = beforeUrl;
        afterUrlRef.current = afterUrl;
        setBeforePreview(beforeUrl);
        setAfterPreview(afterUrl);
        if (oldBefore) URL.revokeObjectURL(oldBefore);
        if (oldAfter) URL.revokeObjectURL(oldAfter);
      } catch (error) {
        if (!cancelled) { console.error("Editor render failed:", error); setEditError("Could not apply the edit. Please try again."); }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [originalPreview, resultPreview, projectTransforms, retouchStrokes]);

  // ── Transform helpers ─────────────────────────────────────────────────────

  const addTransform = useCallback(
    (operation) => commit({ ...snapshot(), projectTransforms: [...projectTransforms, operation] }),
    [commit, snapshot, projectTransforms]
  );

  const changeBackground = useCallback(
    (next) => commit({ ...snapshot(), background: next }),
    [commit, snapshot]
  );

  const changeColor = useCallback(
    (next) => commit({ ...snapshot(), customColor: next, background: "color" }),
    [commit, snapshot]
  );

  const replaceBackgroundImage = useCallback(
    (url) => {
      if (backgroundImage?.startsWith("blob:")) URL.revokeObjectURL(backgroundImage);
      commit({ ...snapshot(), backgroundImage: url, background: "image" });
    },
    [commit, snapshot, backgroundImage]
  );

  const removeBackgroundImage = useCallback(() => {
    if (backgroundImage?.startsWith("blob:")) URL.revokeObjectURL(backgroundImage);
    commit({ ...snapshot(), backgroundImage: null, background: "transparent" });
  }, [commit, snapshot, backgroundImage]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentImage = view === "before" ? beforePreview : afterPreview;

  const exportProps = {
    resultPreview: afterPreview,
    background,
    customColor,
    backgroundImage,
    fileName,
    format,
    onFormatChange: setFormat,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1a1f2e]">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#141820] px-4 sm:px-5">
        <Logo onClick={onReset} dark />
        <button
          type="button"
          onClick={onBack || onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={13} />
          {onBack ? "Gallery" : "New image"}
        </button>
      </header>

      {/* ── WORKSPACE ──────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* ── IMAGE AREA ───────────────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-hidden px-4 py-4 sm:px-6 lg:py-5">
          <BeforeAfterToggle view={view} onChange={setView} />
          <div className="flex min-h-0 w-full flex-1">
            <ImageCanvas
              view={view}
              currentImage={currentImage}
              background={background}
              customColor={customColor}
              backgroundImage={backgroundImage}
              imageRef={imageRef}
              cropOverlay={
                view === "after" && activeTool === "crop" ? (
                  <CropOverlay
                    imageRef={imageRef}
                    aspectRatio={cropRatio}
                    cropBox={cropBox}
                    onCropBoxChange={setCropBox}
                  />
                ) : null
              }
              retouchOverlay={
                view === "after" && (activeTool === "erase" || activeTool === "restore") ? (
                  <BrushOverlay
                    imageRef={imageRef}
                    mode={activeTool}
                    size={brushSize}
                    onStrokeComplete={(stroke) =>
                      commit({ ...snapshot(), retouchStrokes: [...retouchStrokes, stroke] })
                    }
                  />
                ) : null
              }
            />
          </div>
        </div>

        {/* ── SIDEBAR (desktop) ─────────────────────────────────────────── */}
        <aside className="hidden w-[272px] shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#141820] lg:flex xl:w-[288px]">
          {view === "before" ? (
            <div className="px-4 py-6 text-xs text-slate-500">
              Switch to <strong className="text-slate-300">After</strong> to edit.
            </div>
          ) : (
            <>
              <SideSection title="Image">
                <TransformationTools
                  currentImage={afterPreview}
                  activeTool={activeTool}
                  onSelectTool={(tool) => {
                    setActiveTool(tool);
                    if (tool === "crop") { setCropBox({ x: 0, y: 0, w: 1, h: 1 }); setCropRatio("free"); }
                  }}
                  cropRatio={cropRatio}
                  onCropRatioChange={setCropRatio}
                  onApplyCrop={() => {
                    addTransform({ type: "crop", x: cropBox.x, y: cropBox.y, width: cropBox.w, height: cropBox.h });
                    setActiveTool(null);
                  }}
                  onCancelCrop={() => setActiveTool(null)}
                  onResize={(width, height) => { addTransform({ type: "resize", width, height }); setActiveTool(null); }}
                  onRotate={(degrees) => addTransform({ type: "rotate", degrees })}
                  onFlip={(axis) => addTransform({ type: "flip", axis })}
                  isApplying={isRendering}
                  error={editError}
                />
              </SideSection>

              <SideSection title="Retouch">
                <RetouchTools
                  activeTool={activeTool}
                  onSelectTool={setActiveTool}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={history.length > 0}
                  canRedo={future.length > 0}
                  disabled={isRendering}
                />
              </SideSection>

              <SideSection title="Background">
                <BackgroundControls
                  background={background}
                  customColor={customColor}
                  backgroundImage={backgroundImage}
                  onBackgroundChange={changeBackground}
                  onColorChange={changeColor}
                  onBackgroundImageChange={replaceBackgroundImage}
                  onRemoveBackgroundImage={removeBackgroundImage}
                  onToolClear={() => setActiveTool(null)}
                />
              </SideSection>

              <SideSection title="Export">
                <ExportPanel {...exportProps} />
              </SideSection>
            </>
          )}
        </aside>

        {/* ── MOBILE CONTROLS ───────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-white/10 bg-[#141820] lg:hidden">
          {view === "before" ? (
            <p className="px-4 py-3 text-xs text-slate-500">
              Switch to <strong className="text-slate-300">After</strong> to edit.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-0 divide-x divide-white/10">
                {/* Tools */}
                <div className="w-64 shrink-0 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Image</p>
                  <TransformationTools
                    currentImage={afterPreview}
                    activeTool={activeTool}
                    onSelectTool={(tool) => {
                      setActiveTool(tool);
                      if (tool === "crop") { setCropBox({ x: 0, y: 0, w: 1, h: 1 }); setCropRatio("free"); }
                    }}
                    cropRatio={cropRatio}
                    onCropRatioChange={setCropRatio}
                    onApplyCrop={() => {
                      addTransform({ type: "crop", x: cropBox.x, y: cropBox.y, width: cropBox.w, height: cropBox.h });
                      setActiveTool(null);
                    }}
                    onCancelCrop={() => setActiveTool(null)}
                    onResize={(width, height) => { addTransform({ type: "resize", width, height }); setActiveTool(null); }}
                    onRotate={(degrees) => addTransform({ type: "rotate", degrees })}
                    onFlip={(axis) => addTransform({ type: "flip", axis })}
                    isApplying={isRendering}
                    error={editError}
                  />
                </div>
                {/* Retouch */}
                <div className="w-52 shrink-0 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Retouch</p>
                  <RetouchTools
                    activeTool={activeTool}
                    onSelectTool={setActiveTool}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={history.length > 0}
                    canRedo={future.length > 0}
                    disabled={isRendering}
                  />
                </div>
                {/* Background */}
                <div className="w-56 shrink-0 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Background</p>
                  <BackgroundControls
                    background={background}
                    customColor={customColor}
                    backgroundImage={backgroundImage}
                    onBackgroundChange={changeBackground}
                    onColorChange={changeColor}
                    onBackgroundImageChange={replaceBackgroundImage}
                    onRemoveBackgroundImage={removeBackgroundImage}
                    onToolClear={() => setActiveTool(null)}
                  />
                </div>
                {/* Export */}
                <div className="w-48 shrink-0 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Export</p>
                  <ExportPanel {...exportProps} />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

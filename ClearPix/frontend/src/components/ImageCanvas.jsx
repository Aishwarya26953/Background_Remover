import { useCallback, useEffect, useRef, useState } from "react";
import { drawComposition, loadImage } from "../services/imageComposition";

export default function ImageCanvas({
  view,
  currentImage,
  background,
  customColor,
  backgroundImage,
  imageRef,
  cropOverlay = null,
  retouchOverlay = null,
}) {
  const viewportRef = useRef(null);
  const renderCanvasRef = useRef(null);
  const [sourceSize, setSourceSize] = useState(null);
  const [displaySize, setDisplaySize] = useState(null);
  const isCheckerboard = view === "after" && background === "transparent";

  const updateDisplaySize = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !sourceSize) return;

    const vw = Math.max(1, viewport.clientWidth - 24);
    const vh = Math.max(1, viewport.clientHeight - 24);
    const scale = Math.min(vw / sourceSize.width, vh / sourceSize.height, 1);

    setDisplaySize({
      width: Math.max(1, Math.round(sourceSize.width * scale)),
      height: Math.max(1, Math.round(sourceSize.height * scale)),
    });
  }, [sourceSize]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    updateDisplaySize();
    const observer = new ResizeObserver(updateDisplaySize);
    observer.observe(viewport);
    window.addEventListener("resize", updateDisplaySize);
    return () => { observer.disconnect(); window.removeEventListener("resize", updateDisplaySize); };
  }, [updateDisplaySize]);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const foreground = await loadImage(currentImage);
        if (cancelled || !renderCanvasRef.current) return;
        imageRef.current = foreground;
        setSourceSize({ width: foreground.naturalWidth, height: foreground.naturalHeight });

        const compositionCanvas = document.createElement("canvas");
        compositionCanvas.width = foreground.naturalWidth;
        compositionCanvas.height = foreground.naturalHeight;
        const ctx = compositionCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        await drawComposition(ctx, {
          foreground,
          background: view === "after" ? background : "transparent",
          customColor,
          backgroundImage,
        });

        if (cancelled || !renderCanvasRef.current) return;
        const canvas = renderCanvasRef.current;
        canvas.width = compositionCanvas.width;
        canvas.height = compositionCanvas.height;
        canvas.getContext("2d")?.drawImage(compositionCanvas, 0, 0);
      } catch (error) {
        if (!cancelled) console.error("Preview composition failed:", error);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [background, backgroundImage, currentImage, customColor, imageRef, view]);

  return (
    <div
      ref={viewportRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0"
        style={displaySize ? { width: displaySize.width, height: displaySize.height } : undefined}
      >
        <canvas
          ref={renderCanvasRef}
          aria-label={view === "before" ? "Original image" : "Edited image preview"}
          className={[
            "block h-full w-full shadow-2xl",
            isCheckerboard ? "bg-checkerboard" : "",
          ].join(" ")}
        />
        {cropOverlay}
        {retouchOverlay}
      </div>
    </div>
  );
}

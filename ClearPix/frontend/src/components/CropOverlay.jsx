import { useRef, useEffect, useCallback } from "react";

export default function CropOverlay({
  imageRef,
  aspectRatio = "free", // "free" | "1:1" | "4:5" | "16:9"
  cropBox, // { x: 0..1, y: 0..1, w: 0..1, h: 0..1 } normalized 0 to 1
  onCropBoxChange,
}) {
  const containerRef = useRef(null);
  const dragActionRef = useRef(null); // { type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w', startX, startY, initialBox }
  const cropBoxRef = useRef(cropBox);
  const onCropBoxChangeRef = useRef(onCropBoxChange);

  useEffect(() => {
    cropBoxRef.current = cropBox;
  }, [cropBox]);

  useEffect(() => {
    onCropBoxChangeRef.current = onCropBoxChange;
  }, [onCropBoxChange]);

  // Target aspect ratio float value or null
  const getTargetRatio = useCallback(() => {
    if (aspectRatio === "1:1") return 1;
    if (aspectRatio === "4:5") return 4 / 5;
    if (aspectRatio === "16:9") return 16 / 9;
    return null;
  }, [aspectRatio]);

  // Adjust crop box whenever aspectRatio changes
  useEffect(() => {
    if (!imageRef?.current) return;
    const img = imageRef.current;
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = getTargetRatio();

    if (!targetRatio) return; // Free mode, keep current

    // Adjust crop box dimensions in normalized coordinate space
    // normalized w/h ratio in actual pixels is: (w * imgW) / (h * imgH) = targetRatio
    // so w / h = targetRatio / naturalRatio
    const normalizedDesiredRatio = targetRatio / naturalRatio;

    const currentBox = cropBoxRef.current;
    let newW = currentBox.w;
    let newH = newW / normalizedDesiredRatio;

    if (newH > 1) {
      newH = 1;
      newW = newH * normalizedDesiredRatio;
    }
    if (newW > 1) {
      newW = 1;
      newH = newW / normalizedDesiredRatio;
    }

    const newX = Math.max(0, Math.min(1 - newW, currentBox.x));
    const newY = Math.max(0, Math.min(1 - newH, currentBox.y));

    onCropBoxChangeRef.current({ x: newX, y: newY, w: newW, h: newH });
  }, [aspectRatio, getTargetRatio, imageRef]);

  const handlePointerMove = useCallback((e) => {
    if (!dragActionRef.current || !containerRef.current || !imageRef.current) return;
    if (e.cancelable && e.touches) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaX = (clientX - dragActionRef.current.startX) / rect.width;
    const deltaY = (clientY - dragActionRef.current.startY) / rect.height;

    const { type, initialBox } = dragActionRef.current;
    let { x, y, w, h } = initialBox;

    const img = imageRef.current;
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = getTargetRatio();
    const normalizedDesiredRatio = targetRatio ? targetRatio / naturalRatio : null;

    if (type === "move") {
      x = Math.max(0, Math.min(1 - w, initialBox.x + deltaX));
      y = Math.max(0, Math.min(1 - h, initialBox.y + deltaY));
    } else {
      // Resize with optional ratio lock
      const minSize = 0.08;

      if (type.includes("e")) {
        w = Math.max(minSize, Math.min(1 - x, initialBox.w + deltaX));
        if (normalizedDesiredRatio) h = w / normalizedDesiredRatio;
      }
      if (type.includes("w")) {
        const potentialW = Math.max(minSize, initialBox.w - deltaX);
        const shiftX = initialBox.w - potentialW;
        if (initialBox.x + shiftX >= 0) {
          x = initialBox.x + shiftX;
          w = potentialW;
          if (normalizedDesiredRatio) h = w / normalizedDesiredRatio;
        }
      }
      if (type.includes("s")) {
        h = Math.max(minSize, Math.min(1 - y, initialBox.h + deltaY));
        if (normalizedDesiredRatio) w = h * normalizedDesiredRatio;
      }
      if (type.includes("n")) {
        const potentialH = Math.max(minSize, initialBox.h - deltaY);
        const shiftY = initialBox.h - potentialH;
        if (initialBox.y + shiftY >= 0) {
          y = initialBox.y + shiftY;
          h = potentialH;
          if (normalizedDesiredRatio) w = h * normalizedDesiredRatio;
        }
      }

      // Bound clamping
      if (x + w > 1) w = 1 - x;
      if (y + h > 1) h = 1 - y;
      if (normalizedDesiredRatio) {
        if (w / h > normalizedDesiredRatio) w = h * normalizedDesiredRatio;
        else h = w / normalizedDesiredRatio;
      }
    }

    onCropBoxChangeRef.current({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      w: Math.max(0.05, Math.min(1 - x, w)),
      h: Math.max(0.05, Math.min(1 - y, h)),
    });
  }, [getTargetRatio, imageRef]);

  const handlePointerUp = useCallback(function handlePointerUp() {
    dragActionRef.current = null;
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
    window.removeEventListener("touchmove", handlePointerMove);
    window.removeEventListener("touchend", handlePointerUp);
  }, [handlePointerMove]);

  // Handle Drag Move & Resize
  const handlePointerDown = (e, handleType) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragActionRef.current = {
      type: handleType,
      startX: clientX,
      startY: clientY,
      initialBox: { ...cropBoxRef.current },
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const leftPct = `${cropBox.x * 100}%`;
  const topPct = `${cropBox.y * 100}%`;
  const widthPct = `${cropBox.w * 100}%`;
  const heightPct = `${cropBox.h * 100}%`;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 select-none touch-none overflow-hidden"
      style={{ pointerEvents: "auto" }}
    >
      {/* 4 Dimmed mask overlays surrounding crop box */}
      <div
        className="absolute left-0 top-0 w-full bg-black/50"
        style={{ height: topPct }}
      />
      <div
        className="absolute left-0 bottom-0 w-full bg-black/50"
        style={{ height: `${(1 - (cropBox.y + cropBox.h)) * 100}%` }}
      />
      <div
        className="absolute left-0 bg-black/50"
        style={{ top: topPct, height: heightPct, width: leftPct }}
      />
      <div
        className="absolute right-0 bg-black/50"
        style={{
          top: topPct,
          height: heightPct,
          width: `${(1 - (cropBox.x + cropBox.w)) * 100}%`,
        }}
      />

      {/* The Active Crop Box */}
      <div
        className="absolute border-2 border-white shadow-2xl cursor-move"
        style={{
          left: leftPct,
          top: topPct,
          width: widthPct,
          height: heightPct,
        }}
        onMouseDown={(e) => handlePointerDown(e, "move")}
        onTouchStart={(e) => handlePointerDown(e, "move")}
      >
        {/* Rule of Thirds Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/30">
          <div className="border-r border-b border-white/25" />
          <div className="border-r border-b border-white/25" />
          <div className="border-b border-white/25" />
          <div className="border-r border-b border-white/25" />
          <div className="border-r border-b border-white/25" />
          <div className="border-b border-white/25" />
          <div className="border-r border-white/25" />
          <div className="border-r border-white/25" />
          <div />
        </div>

        {/* 8 Drag Handles */}
        {/* Corner NW */}
        <div
          className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 bg-white border border-slate-900/30 rounded-xs cursor-nwse-resize"
          onMouseDown={(e) => handlePointerDown(e, "nw")}
          onTouchStart={(e) => handlePointerDown(e, "nw")}
        />
        {/* Edge N */}
        <div
          className="absolute left-1/2 -top-1.5 -translate-x-1/2 h-2.5 w-6 bg-white border border-slate-900/30 rounded-xs cursor-ns-resize"
          onMouseDown={(e) => handlePointerDown(e, "n")}
          onTouchStart={(e) => handlePointerDown(e, "n")}
        />
        {/* Corner NE */}
        <div
          className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 bg-white border border-slate-900/30 rounded-xs cursor-nesw-resize"
          onMouseDown={(e) => handlePointerDown(e, "ne")}
          onTouchStart={(e) => handlePointerDown(e, "ne")}
        />
        {/* Edge E */}
        <div
          className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-6 w-2.5 bg-white border border-slate-900/30 rounded-xs cursor-ew-resize"
          onMouseDown={(e) => handlePointerDown(e, "e")}
          onTouchStart={(e) => handlePointerDown(e, "e")}
        />
        {/* Corner SE */}
        <div
          className="absolute -right-1.5 -bottom-1.5 h-3.5 w-3.5 bg-white border border-slate-900/30 rounded-xs cursor-nwse-resize"
          onMouseDown={(e) => handlePointerDown(e, "se")}
          onTouchStart={(e) => handlePointerDown(e, "se")}
        />
        {/* Edge S */}
        <div
          className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 h-2.5 w-6 bg-white border border-slate-900/30 rounded-xs cursor-ns-resize"
          onMouseDown={(e) => handlePointerDown(e, "s")}
          onTouchStart={(e) => handlePointerDown(e, "s")}
        />
        {/* Corner SW */}
        <div
          className="absolute -left-1.5 -bottom-1.5 h-3.5 w-3.5 bg-white border border-slate-900/30 rounded-xs cursor-nesw-resize"
          onMouseDown={(e) => handlePointerDown(e, "sw")}
          onTouchStart={(e) => handlePointerDown(e, "sw")}
        />
        {/* Edge W */}
        <div
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-6 w-2.5 bg-white border border-slate-900/30 rounded-xs cursor-ew-resize"
          onMouseDown={(e) => handlePointerDown(e, "w")}
          onTouchStart={(e) => handlePointerDown(e, "w")}
        />
      </div>
    </div>
  );
}

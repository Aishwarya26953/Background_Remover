import { useRef, useState } from "react";

/**
 * BrushOverlay
 *
 * Coordinate model
 * ─────────────────
 * Pointer events arrive in screen pixels relative to the overlay element,
 * which is positioned absolute inset-0 over the displayed canvas.
 *
 * Stroke points are stored as { x, y } in normalised 0-1 space so that
 * applyRetouchStrokes can replay them at full natural resolution regardless
 * of how the canvas is displayed.
 *
 * Cursor sizing
 * ─────────────
 * `size` is the brush diameter in natural-image pixels (the same unit used
 * when replaying strokes on the full-res canvas).
 *
 * To show a cursor that visually matches the painted area we convert `size`
 * from natural pixels to display pixels:
 *
 *   displayDiameter = size * (displayWidth / naturalWidth)
 *
 * We read displayWidth from the overlay's own bounding rect on every
 * pointerdown so it stays accurate after window resizes.
 * naturalWidth comes from imageRef.current.naturalWidth.
 */
export default function BrushOverlay({ imageRef, mode, size, onStrokeComplete }) {
  const overlayRef = useRef(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef([]);

  // cursor: normalised position { x, y } for rendering the circle
  const [cursor, setCursor] = useState(null);
  // cursorDiameterPct: diameter as a percentage of the overlay width
  const [cursorDiameterPct, setCursorDiameterPct] = useState(0);

  // Compute normalised point from a pointer event.
  const pointFor = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  };

  // Compute cursor diameter as a percentage of the overlay's display width.
  // Called once on pointerdown so we have fresh layout dimensions.
  const computeCursorDiameterPct = () => {
    const overlay = overlayRef.current;
    const img = imageRef.current;
    if (!overlay || !img) return 0;

    const displayWidth = overlay.getBoundingClientRect().width;
    const naturalWidth = img.naturalWidth;
    if (!naturalWidth || !displayWidth) return 0;

    // size is in natural pixels; convert to display pixels then to %
    const displayDiameter = size * (displayWidth / naturalWidth);
    return (displayDiameter / displayWidth) * 100;
  };

  const finish = () => {
    if (drawingRef.current && pointsRef.current.length) {
      onStrokeComplete({ mode, size, points: pointsRef.current });
    }
    drawingRef.current = false;
    pointsRef.current = [];
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 touch-none"
      style={{ cursor: "none" }}
      onPointerDown={(event) => {
        if (!imageRef.current) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();

        const point = pointFor(event);
        drawingRef.current = true;
        pointsRef.current = [point];
        setCursor(point);
        setCursorDiameterPct(computeCursorDiameterPct());
      }}
      onPointerMove={(event) => {
        const point = pointFor(event);
        setCursor(point);
        if (drawingRef.current) {
          pointsRef.current.push(point);
        }
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {cursor && cursorDiameterPct > 0 && (
        <span
          className="pointer-events-none absolute rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,.7)]"
          style={{
            left: `${cursor.x * 100}%`,
            top: `${cursor.y * 100}%`,
            width: `${cursorDiameterPct}%`,
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
}

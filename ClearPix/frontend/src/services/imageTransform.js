/**
 * Image Transformation Utilities for ClearPix Editor v2
 * Pure client-side Canvas transformations preserving high quality.
 */

export function getImageDimensions(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("Failed to load image for dimensions"));
    img.src = imageSource;
  });
}

/**
 * Rotate image by 90 degrees (+90 for clockwise/right, -90 for counter-clockwise/left)
 */
export function rotateImage(imageSource, degrees) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const isPerpendicular = Math.abs(degrees) % 180 === 90;
      
      canvas.width = isPerpendicular ? img.naturalHeight : img.naturalWidth;
      canvas.height = isPerpendicular ? img.naturalWidth : img.naturalHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create rotated image blob"));
        resolve(blob);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image for rotation"));
    img.src = imageSource;
  });
}

/**
 * Flip image horizontally or vertically
 */
export function flipImage(imageSource, axis = "horizontal") {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (axis === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create flipped image blob"));
        resolve(blob);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image for flipping"));
    img.src = imageSource;
  });
}

/**
 * Resize the actual image canvas while preserving its aspect ratio. The
 * editor keeps width and height locked, so this produces an image at the
 * requested scale without adding transparent padding.
 */
export function resizeImage(imageSource, targetWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const finalW = Math.max(1, Math.round(targetWidth));
      const finalH = Math.max(
        1,
        Math.round((finalW * img.naturalHeight) / img.naturalWidth)
      );

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0, finalW, finalH);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create resized image blob"));
        resolve(blob);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = imageSource;
  });
}

/**
 * Crop image with bounding box { x, y, width, height } in natural image coordinates
 */
export function cropImage(imageSource, cropRect) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Clamping within natural bounds
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const safeX = Math.max(0, Math.min(naturalW - 1, Math.round(cropRect.x)));
      const safeY = Math.max(0, Math.min(naturalH - 1, Math.round(cropRect.y)));
      const safeW = Math.max(1, Math.min(naturalW - safeX, Math.round(cropRect.width)));
      const safeH = Math.max(1, Math.min(naturalH - safeY, Math.round(cropRect.height)));

      const canvas = document.createElement("canvas");
      canvas.width = safeW;
      canvas.height = safeH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create cropped image blob"));
        resolve(blob);
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = imageSource;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create transformed image blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

async function loadTransformImage(imageSource) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for transformation"));
    image.src = imageSource;
  });
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

// Replays project geometry from a source image. Both Before and After use the
// same operation list and canonical base dimensions, keeping them aligned.
export async function applyProjectTransformations(
  imageSource,
  baseDimensions,
  operations = []
) {
  const source = await loadTransformImage(imageSource);
  let { canvas, ctx } = createCanvas(baseDimensions.width, baseDimensions.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  for (const operation of operations) {
    const previous = canvas;
    if (operation.type === "crop") {
      const x = Math.max(0, Math.min(1, operation.x));
      const y = Math.max(0, Math.min(1, operation.y));
      const width = Math.max(0.01, Math.min(1 - x, operation.width));
      const height = Math.max(0.01, Math.min(1 - y, operation.height));
      const sourceX = Math.round(x * previous.width);
      const sourceY = Math.round(y * previous.height);
      const sourceWidth = Math.max(1, Math.round(width * previous.width));
      const sourceHeight = Math.max(1, Math.round(height * previous.height));
      ({ canvas, ctx } = createCanvas(sourceWidth, sourceHeight));
      ctx.drawImage(
        previous,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );
    } else if (operation.type === "resize") {
      ({ canvas, ctx } = createCanvas(operation.width, operation.height));
      ctx.drawImage(previous, 0, 0, canvas.width, canvas.height);
    } else if (operation.type === "rotate") {
      ({ canvas, ctx } = createCanvas(previous.height, previous.width));
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((operation.degrees * Math.PI) / 180);
      ctx.drawImage(previous, -previous.width / 2, -previous.height / 2);
    } else if (operation.type === "flip") {
      ({ canvas, ctx } = createCanvas(previous.width, previous.height));
      if (operation.axis === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(previous, 0, 0);
    }
  }

  return canvasToBlob(canvas);
}

export async function applyRetouchStrokes(processedSource, originalSource, strokes = []) {
  const [processed, original] = await Promise.all([
    loadTransformImage(processedSource),
    loadTransformImage(originalSource),
  ]);
  const { canvas, ctx } = createCanvas(processed.naturalWidth, processed.naturalHeight);
  ctx.drawImage(processed, 0, 0);

  for (const stroke of strokes) {
    if (!stroke.points?.length) continue;
    const drawSegment = (from, to) => {
      const x1 = from.x * canvas.width;
      const y1 = from.y * canvas.height;
      const x2 = to.x * canvas.width;
      const y2 = to.y * canvas.height;
      const size = stroke.size;
      if (stroke.mode === "erase") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Each segment gets its own isolated save/restore so clipping paths
        // never accumulate across segments. Two separate arcs are drawn as a
        // pill shape (convex hull of the two circles) by using a single
        // beginPath per segment.
        ctx.save();
        ctx.beginPath();
        // Draw a pill covering the segment: circle at from, circle at to.
        // Using two separate arcs in one path gives the union clip region.
        ctx.arc(x1, y1, size / 2, 0, Math.PI * 2);
        ctx.moveTo(x2 + size / 2, y2);
        ctx.arc(x2, y2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    };

    const first = stroke.points[0];
    drawSegment(first, first);
    for (let index = 1; index < stroke.points.length; index += 1) {
      drawSegment(stroke.points[index - 1], stroke.points[index]);
    }
  }

  return canvasToBlob(canvas);
}

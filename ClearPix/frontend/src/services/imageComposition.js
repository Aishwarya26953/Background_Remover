export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for composition"));
    image.src = source;
  });
}

export function drawCoverImage(ctx, image, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;
  let drawWidth;
  let drawHeight;
  let x;
  let y;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = drawHeight * imageRatio;
    x = (width - drawWidth) / 2;
    y = 0;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / imageRatio;
    x = 0;
    y = (height - drawHeight) / 2;
  }

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

// The cutout always defines the output canvas. Backgrounds are painted into
// that same rectangle and never become part of the editable cutout source.
export async function drawComposition(ctx, {
  foreground,
  background = "transparent",
  customColor,
  backgroundImage,
}) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  if (background === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else if (background === "color") {
    ctx.fillStyle = customColor || "#000000";
    ctx.fillRect(0, 0, width, height);
  } else if (background === "image" && backgroundImage) {
    const backgroundLayer = await loadImage(backgroundImage);
    drawCoverImage(ctx, backgroundLayer, width, height);
  }

  ctx.drawImage(foreground, 0, 0, width, height);
}

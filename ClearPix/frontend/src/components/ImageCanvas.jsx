const CHECKERBOARD = {
  backgroundColor: "#f8f8f8",
  backgroundImage:
    "linear-gradient(45deg,#e2e8f0 25%,transparent 25%)," +
    "linear-gradient(-45deg,#e2e8f0 25%,transparent 25%)," +
    "linear-gradient(45deg,transparent 75%,#e2e8f0 75%)," +
    "linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
};

function getCanvasStyle(view, background, customColor, backgroundImage) {
  // Before view — plain neutral surface
  if (view === "before") return { background: "#f1f5f9" };

  if (background === "white") return { background: "#ffffff" };
  if (background === "color") return { background: customColor };
  if (background === "image" && backgroundImage) {
    return {
      backgroundImage: `url(${backgroundImage})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }
  return CHECKERBOARD;
}

export default function ImageCanvas({
  view,
  currentImage,
  background,
  customColor,
  backgroundImage,
}) {
  const canvasStyle = getCanvasStyle(
    view,
    background,
    customColor,
    backgroundImage
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-slate-200"
      style={canvasStyle}
    >
      {/* The image drives the container height via its natural aspect ratio */}
      <img
        src={currentImage}
        alt={
          view === "before"
            ? "Original uploaded image"
            : "Image with background removed"
        }
        className="block w-full object-contain"
        style={{ maxHeight: "75vh" }}
        draggable="false"
      />
    </div>
  );
}

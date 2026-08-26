import { useRef, useState } from "react";
import { removeBackground } from "./services/api";

function App() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [resultPreview, setResultPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSelectedFile(file);
    setResultPreview(null);

    // Show original image
    const originalUrl = URL.createObjectURL(file);
    setOriginalPreview(originalUrl);

    // Start AI processing
    try {
      setLoading(true);

      const resultBlob = await removeBackground(file);

      const resultUrl = URL.createObjectURL(resultBlob);

      setResultPreview(resultUrl);
    } catch (err) {
      console.error(err);

      setError(
        "Background removal failed. Please make sure the ClearPix backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultPreview) {
      return;
    }

    const link = document.createElement("a");

    link.href = resultPreview;
    link.download = "clearpix-result.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalPreview(null);
    setResultPreview(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Clear<span className="text-blue-600">Pix</span>
          </h1>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-gray-900">
              How it works
            </a>

            <a href="#pricing" className="hover:text-gray-900">
              Pricing
            </a>
          </div>

          <button
            onClick={handleUploadClick}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 text-center md:pt-28">
          <div className="mx-auto mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
            ✨ AI-powered background removal
          </div>

          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl">
            Remove backgrounds.
            <br />
            <span className="text-blue-600">Keep what matters.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Remove image backgrounds in seconds with ClearPix.
            Fast, simple, and powered by AI.
          </p>

          {/* Upload Area */}
          {!resultPreview && (
            <div
              onClick={handleUploadClick}
              className="mx-auto mt-12 max-w-2xl cursor-pointer rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 transition hover:border-blue-400 hover:bg-blue-50/30"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                📤
              </div>

              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {loading ? "Removing background..." : "Upload your image"}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {loading
                  ? "ClearPix AI is processing your image"
                  : "Drag & drop your image here or choose a file"}
              </p>

              {!loading && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUploadClick();
                  }}
                  className="mt-6 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Upload Image
                </button>
              )}

              {loading && (
                <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              )}

              <p className="mt-4 text-xs text-gray-400">
                JPG, JPEG, PNG or WEBP • Max 10MB
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Result */}
          {resultPreview && (
            <div className="mx-auto mt-12 max-w-5xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Original */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Original
                  </h3>

                  <div className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={originalPreview}
                      alt="Original"
                      className="max-h-[450px] max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Background Removed
                  </h3>

                  <div
                    className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                      backgroundSize: "24px 24px",
                      backgroundPosition:
                        "0 0, 0 12px, 12px -12px, -12px 0px",
                    }}
                  >
                    <img
                      src={resultPreview}
                      alt="Background removed"
                      className="max-h-[450px] max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  ⬇ Download PNG
                </button>

                <button
                  onClick={handleReset}
                  className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  ↻ Remove Another
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Features */}
        <section id="features" className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Why ClearPix
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Everything you need for cleaner images
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="text-3xl">⚡</div>

                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  Fast Processing
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  Remove image backgrounds quickly using AI-powered
                  processing.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="text-3xl">🎯</div>

                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  Precise Results
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  Get clean edges and transparent backgrounds for your images.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-7">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  Simple & Secure
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  Upload an image, remove its background, and download the
                  result.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Three simple steps
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  1
                </div>

                <h3 className="mt-5 text-lg font-semibold">Upload</h3>

                <p className="mt-2 text-gray-600">
                  Choose the image you want to edit.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  2
                </div>

                <h3 className="mt-5 text-lg font-semibold">Remove</h3>

                <p className="mt-2 text-gray-600">
                  ClearPix AI removes the background.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  3
                </div>

                <h3 className="mt-5 text-lg font-semibold">Download</h3>

                <p className="mt-2 text-gray-600">
                  Download your transparent PNG.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-gray-500">
          © 2026 ClearPix. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
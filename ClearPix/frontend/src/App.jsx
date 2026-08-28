import { useRef, useState } from "react";
import { removeBackground } from "./services/api";
import { ALLOWED_TYPES, MAX_SIZE_BYTES } from "./components/UploadDropzone";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProcessingView from "./components/ProcessingView";
import Editor from "./pages/Editor";

// App-level view states
const VIEW = {
  HOME: "home",
  PROCESSING: "processing",
  EDITOR: "editor",
};

export default function App() {
  const [view, setView] = useState(VIEW.HOME);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [resultPreview, setResultPreview] = useState(null);
  const [uploadError, setUploadError] = useState("");

  // Ref passed to Home so the header CTA can scroll to the dropzone
  const uploadSectionRef = useRef(null);

  const handleFile = async (file) => {
    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError("Image must be under 10MB.");
      return;
    }

    setUploadError("");

    // Show original preview immediately
    const originalUrl = URL.createObjectURL(file);
    setOriginalPreview(originalUrl);
    setView(VIEW.PROCESSING);

    try {
      const blob = await removeBackground(file);
      const resultUrl = URL.createObjectURL(blob);
      setResultPreview(resultUrl);
      setView(VIEW.EDITOR);
    } catch (err) {
      console.error("Background removal error:", err);
      setUploadError(
        "Background removal failed. Please make sure the ClearPix backend is running on port 8000."
      );
      setView(VIEW.HOME);
    }
  };

  const handleReset = () => {
    // Revoke object URLs to free memory
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultPreview) URL.revokeObjectURL(resultPreview);

    setOriginalPreview(null);
    setResultPreview(null);
    setUploadError("");
    setView(VIEW.HOME);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isEditor = view === VIEW.EDITOR;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header — shown on home and processing, hidden in editor (editor has its own) */}
      {!isEditor && (
        <Header
          onUploadClick={scrollToUpload}
          onLogoClick={handleReset}
        />
      )}

      {/* Home */}
      {view === VIEW.HOME && (
        <>
          <Home
            onFile={handleFile}
            uploadRef={uploadSectionRef}
            initialError={uploadError}
          />
          <Footer />
        </>
      )}

      {/* Processing */}
      {view === VIEW.PROCESSING && (
        <ProcessingView originalPreview={originalPreview} />
      )}

      {/* Editor */}
      {view === VIEW.EDITOR && originalPreview && resultPreview && (
        <Editor
          originalPreview={originalPreview}
          resultPreview={resultPreview}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

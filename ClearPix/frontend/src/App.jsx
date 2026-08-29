import { useRef, useState, useCallback } from "react";
import { removeBackground } from "./services/api";
import { fileId } from "./constants";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BatchProcessingView from "./components/BatchProcessingView";
import BatchResults from "./components/BatchResults";
import Editor from "./pages/Editor";

const VIEW = {
  HOME: "home",
  BATCH_PROCESSING: "processing",
  BATCH_RESULTS: "results",
  EDITOR: "editor",
};

export default function App() {
  const [view, setView] = useState(VIEW.HOME);

  // Selected files on Home screen: array of { id, file, previewUrl }
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Batch queue items also retain project-level editor geometry so an item
  // reopens with aligned Before and After previews.
  const [batchItems, setBatchItems] = useState([]);

  // Active item ID being edited in Editor
  const [currentEditorItemId, setCurrentEditorItemId] = useState(null);

  const [uploadError, setUploadError] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  // Incremented whenever App wants Home to clear its local error state
  const [clearSignal, setClearSignal] = useState(0);

  const uploadSectionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cancelRequestedRef = useRef(false);

  // ─── File Selection Handlers ────────────────────────────────────────────────

  const handleAddFiles = (filesToAdd) => {
    setUploadError("");
    const newItems = filesToAdd.map((file) => ({
      id: fileId(file),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.previewUrl) {
        // Defer revocation so the img element is unmounted before the URL is freed.
        setTimeout(() => URL.revokeObjectURL(itemToRemove.previewUrl), 0);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearFiles = () => {
    const urlsToRevoke = selectedFiles.map((item) => item.previewUrl).filter(Boolean);
    setSelectedFiles([]);
    setUploadError("");
    setClearSignal((n) => n + 1);
    // Defer so SelectedImageGrid unmounts its img elements first.
    setTimeout(() => urlsToRevoke.forEach((url) => URL.revokeObjectURL(url)), 0);
  };

  // ─── Batch Processing Queue Loop ────────────────────────────────────────────

  const runBatchQueue = useCallback(async (initialItems) => {
    setIsCancelled(false);
    cancelRequestedRef.current = false;

    let currentQueue = [...initialItems];

    for (let i = 0; i < currentQueue.length; i++) {
      // Check cancellation before starting next image
      if (cancelRequestedRef.current) {
        break;
      }

      const item = currentQueue[i];

      // Only process items that are pending (waiting)
      if (item.status !== "waiting") {
        continue;
      }

      // Mark current item as processing
      currentQueue = currentQueue.map((it, idx) =>
        idx === i ? { ...it, status: "processing" } : it
      );
      setBatchItems([...currentQueue]);

      abortControllerRef.current = new AbortController();

      try {
        const blob = await removeBackground(
          item.file,
          abortControllerRef.current.signal
        );
        const resultUrl = URL.createObjectURL(blob);

        currentQueue = currentQueue.map((it, idx) =>
          idx === i ? { ...it, status: "completed", resultUrl, error: null } : it
        );
        setBatchItems([...currentQueue]);
      } catch (err) {
        if (cancelRequestedRef.current || err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          // Revert cancelled item back to waiting
          currentQueue = currentQueue.map((it, idx) =>
            idx === i ? { ...it, status: "waiting" } : it
          );
          setBatchItems([...currentQueue]);
          break;
        } else {
          console.error(`Error processing ${item.file.name}:`, err);
          const friendlyError =
            err.response?.status === 400
              ? "Image format not supported"
              : "Background removal failed";

          currentQueue = currentQueue.map((it, idx) =>
            idx === i
              ? { ...it, status: "failed", error: friendlyError }
              : it
          );
          setBatchItems([...currentQueue]);
        }
      }
    }

    // Finished or cancelled -> go to results gallery
    setView(VIEW.BATCH_RESULTS);
  }, []);

  const handleStartBatch = () => {
    if (selectedFiles.length === 0) return;

    // Convert selected files to batch items (ownership of previewUrl transferred to batchItems)
    const initialBatch = selectedFiles.map((sf) => ({
      id: sf.id,
      file: sf.file,
      previewUrl: sf.previewUrl,
      status: "waiting",
      resultUrl: null,
      error: null,
      // Editor state — persisted so reopening the editor restores all edits
      projectTransforms: [],
      retouchStrokes: [],
      background: "transparent",
      customColor: "#e8f0ff",
      backgroundImage: null,
    }));

    setBatchItems(initialBatch);
    setSelectedFiles([]); // Clear selection array without revoking previewUrls
    setView(VIEW.BATCH_PROCESSING);

    // Start processing
    runBatchQueue(initialBatch);
  };

  const handleCancelBatch = () => {
    cancelRequestedRef.current = true;
    setIsCancelled(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetryItem = (targetItem) => {
    const updatedQueue = batchItems.map((item) =>
      item.id === targetItem.id
        ? { ...item, status: "waiting", error: null }
        : item
    );

    setBatchItems(updatedQueue);
    setView(VIEW.BATCH_PROCESSING);
    runBatchQueue(updatedQueue);
  };

  // ─── Navigation & Reset ─────────────────────────────────────────────────────

  const handleEditItem = (item) => {
    setCurrentEditorItemId(item.id);
    setView(VIEW.EDITOR);
  };

  const handleBackFromEditor = () => {
    setCurrentEditorItemId(null);
    setView(VIEW.BATCH_RESULTS);
  };

  const handleEditorStateChange = (itemId, editorState) => {
    setBatchItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, ...editorState } : item
      )
    );
  };

  const handleFullReset = () => {
    // Collect all blob URLs that need revoking BEFORE clearing state.
    // We defer the actual revocation until after React has unmounted the
    // components that are still rendering these URLs, so images don't
    // flash broken during the transition.
    const urlsToRevoke = [];
    selectedFiles.forEach((sf) => {
      if (sf.previewUrl) urlsToRevoke.push(sf.previewUrl);
    });
    batchItems.forEach((bi) => {
      if (bi.previewUrl) urlsToRevoke.push(bi.previewUrl);
      if (bi.resultUrl) urlsToRevoke.push(bi.resultUrl);
      if (bi.backgroundImage?.startsWith("blob:")) urlsToRevoke.push(bi.backgroundImage);
    });

    // Reset all state and navigate to Home first.
    setSelectedFiles([]);
    setBatchItems([]);
    setCurrentEditorItemId(null);
    setUploadError("");
    setIsCancelled(false);
    setClearSignal((n) => n + 1);
    setView(VIEW.HOME);

    // Revoke after React has painted the new view (no more references to these URLs).
    setTimeout(() => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    }, 0);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isEditor = view === VIEW.EDITOR;
  const currentEditorItem = batchItems.find((i) => i.id === currentEditorItemId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header — shown on all views except editor */}
      {!isEditor && (
        <Header
          onUploadClick={scrollToUpload}
          onLogoClick={handleFullReset}
        />
      )}

      {/* 1. Home View */}
      {view === VIEW.HOME && (
        <>
          <Home
            selectedFiles={selectedFiles}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            onStartBatch={handleStartBatch}
            uploadRef={uploadSectionRef}
            initialError={uploadError}
            clearSignal={clearSignal}
          />
          <Footer />
        </>
      )}

      {/* 2. Batch Processing View */}
      {view === VIEW.BATCH_PROCESSING && (
        <BatchProcessingView
          batchItems={batchItems}
          onCancel={handleCancelBatch}
          isCancelled={isCancelled}
        />
      )}

      {/* 3. Batch Results View */}
      {view === VIEW.BATCH_RESULTS && (
        <>
          <BatchResults
            batchItems={batchItems}
            onEdit={handleEditItem}
            onRetry={handleRetryItem}
            onNewBatch={handleFullReset}
          />
          <Footer />
        </>
      )}

      {/* 4. Single-Item Editor View */}
      {view === VIEW.EDITOR && currentEditorItem && (
        <Editor
          originalPreview={currentEditorItem.previewUrl}
          resultPreview={currentEditorItem.resultUrl}
          projectTransforms={currentEditorItem.projectTransforms || []}
          retouchStrokes={currentEditorItem.retouchStrokes || []}
          initialBackground={currentEditorItem.background ?? "transparent"}
          initialCustomColor={currentEditorItem.customColor ?? "#e8f0ff"}
          initialBackgroundImage={currentEditorItem.backgroundImage ?? null}
          fileName={currentEditorItem.file.name}
          onReset={handleFullReset}
          onBack={handleBackFromEditor}
          onEditorStateChange={(editorState) =>
            handleEditorStateChange(currentEditorItem.id, editorState)
          }
        />
      )}
    </div>
  );
}

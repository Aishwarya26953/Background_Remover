import { useState } from "react";
import { Download, Edit3, RotateCcw, CheckCircle2, AlertCircle, Plus, Loader2, ImagePlus } from "lucide-react";

export default function BatchResults({ batchItems, onEdit, onRetry, onNewBatch }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const completedItems = batchItems.filter((i) => i.status === "completed");
  const failedItems = batchItems.filter((i) => i.status === "failed");
  const waitingItems = batchItems.filter((i) => i.status === "waiting");

  const handleQuickDownload = async (item) => {
    if (!item.resultUrl || downloadingId) return;
    setDownloadingId(item.id);
    try {
      const a = document.createElement("a");
      a.href = item.resultUrl;
      a.download = `clearpix-${item.file.name.replace(/\.[^/.]+$/, "")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Your images are ready
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {completedItems.length} of {batchItems.length} processed
              {failedItems.length > 0 && ` · ${failedItems.length} failed`}
              {waitingItems.length > 0 && ` · ${waitingItems.length} skipped`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {completedItems.length > 1 && (
              <span className="text-xs text-slate-400">
                Download individually below
              </span>
            )}
            <button
              type="button"
              onClick={onNewBatch}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={2} />
              New images
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
          {batchItems.map((item) => {
            const isCompleted = item.status === "completed";
            const isFailed = item.status === "failed";
            const isWaiting = item.status === "waiting";
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md"
              >
                {/* Image preview */}
                <div
                  className={[
                    "relative flex aspect-square w-full items-center justify-center overflow-hidden",
                    isCompleted ? "bg-checkerboard-sm" : "bg-slate-100",
                  ].join(" ")}
                >
                  <img
                    src={isCompleted ? item.resultUrl : item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-[1.02]"
                    draggable={false}
                  />

                  {/* Status badge */}
                  <div className="absolute left-2 top-2">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <CheckCircle2 size={9} />
                        Done
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <AlertCircle size={9} />
                        Failed
                      </span>
                    )}
                    {isWaiting && (
                      <span className="rounded-md bg-slate-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    {isFailed && (
                      <p className="mt-1.5 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                        {item.error || "Background removal failed"}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    {isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                          aria-label={`Edit ${item.file.name}`}
                        >
                          <Edit3 size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDownload(item)}
                          disabled={isDownloading}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                          aria-label={`Download ${item.file.name}`}
                        >
                          {isDownloading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Download size={12} strokeWidth={2.2} />
                          )}
                          Save
                        </button>
                      </>
                    )}
                    {(isFailed || isWaiting) && (
                      <button
                        type="button"
                        onClick={() => onRetry(item)}
                        className="flex w-full items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
                      >
                        <RotateCcw size={12} />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add more card */}
          <button
            type="button"
            onClick={onNewBatch}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-400 transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600"
            aria-label="Process new images"
          >
            <ImagePlus size={22} strokeWidth={1.75} />
            <span className="text-xs font-semibold">New images</span>
          </button>
        </div>
      </div>
    </div>
  );
}

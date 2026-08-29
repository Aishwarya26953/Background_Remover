import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default function BatchProcessingView({ batchItems, onCancel, isCancelled }) {
  const total = batchItems.length;
  const completedCount = batchItems.filter((i) => i.status === "completed").length;
  const failedCount = batchItems.filter((i) => i.status === "failed").length;
  const currentItem = batchItems.find((i) => i.status === "processing");
  const currentIndex = currentItem ? batchItems.indexOf(currentItem) + 1 : completedCount + failedCount;

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Current image preview */}
        {currentItem && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-100">
              <img
                src={currentItem.previewUrl}
                alt={currentItem.file.name}
                className="h-full w-full object-contain p-4"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-md">
                  <Loader2 size={15} className="animate-spin text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Removing background…</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5">
              <p className="truncate text-xs font-semibold text-slate-700">{currentItem.file.name}</p>
            </div>
          </div>
        )}

        {/* Status header */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isCancelled ? "Cancelling…" : `Processing ${Math.min(currentIndex, total)} of ${total}`}
          </h2>
          <p className="mt-1 text-xs text-slate-500" aria-live="polite">
            {isCancelled
              ? "Stopping. Completed results will be saved."
              : `${completedCount} done${failedCount > 0 ? ` · ${failedCount} failed` : ""} · ${total - completedCount - failedCount} remaining`}
          </p>
        </div>

        {/* Queue list */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="max-h-[40vh] divide-y divide-slate-100 overflow-y-auto">
            {batchItems.map((item, idx) => {
              const isDone = item.status === "completed";
              const isProcessing = item.status === "processing";
              const isFailed = item.status === "failed";
              const isWaiting = item.status === "waiting";

              return (
                <div
                  key={item.id}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 transition-colors",
                    isProcessing ? "bg-blue-50/60" : "",
                  ].join(" ")}
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-contain p-0.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{item.file.name}</p>
                    {isFailed ? (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                        <AlertCircle size={10} className="shrink-0" />
                        {item.error || "Failed"}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">#{idx + 1}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {isProcessing && <Loader2 size={16} className="animate-spin text-blue-500" />}
                    {isFailed && <XCircle size={16} className="text-red-500" />}
                    {isWaiting && <Clock size={16} className="text-slate-300" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelled}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-50"
          >
            {isCancelled ? "Cancelling…" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

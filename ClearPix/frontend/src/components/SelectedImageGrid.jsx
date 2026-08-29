import { X, Plus, Trash2 } from "lucide-react";
import { ALLOWED_TYPES, MAX_BATCH_SIZE } from "../constants";

export default function SelectedImageGrid({
  selectedFiles,
  onRemove,
  onAddMore,
  onClearAll,
}) {
  const addMoreInputId = "add-more-input";

  const handleAddMoreChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Reset before processing so the same file can be re-selected
    e.target.value = "";
    if (files.length > 0) onAddMore(files);
  };

  const isMaxReached = selectedFiles.length >= MAX_BATCH_SIZE;

  return (
    <div className="mt-6 w-full">
      {/* Hidden input for Add more — id used by label */}
      <input
        id={addMoreInputId}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleAddMoreChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">Selected images</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {selectedFiles.length} / {MAX_BATCH_SIZE}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-600"
          aria-label="Clear all selected images"
        >
          <Trash2 size={12} />
          Clear all
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
        {selectedFiles.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-full w-full object-contain p-1"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove ${item.file.name}`}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
            <div className="px-1.5 py-1.5">
              <p className="truncate text-[11px] font-semibold text-slate-700" title={item.file.name}>
                {item.file.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(item.file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
        ))}

        {/* Add more — native label for cross-browser/iOS compatibility */}
        {!isMaxReached && (
          <label
            htmlFor={addMoreInputId}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600"
            aria-label="Add more images"
          >
            <Plus size={18} strokeWidth={2} />
            <span className="text-[11px] font-semibold">Add more</span>
          </label>
        )}
      </div>
    </div>
  );
}

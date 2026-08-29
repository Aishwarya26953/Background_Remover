import Logo from "./Logo";

export default function Header({ onUploadClick, onLogoClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo onClick={onLogoClick} />

        <div className="flex items-center gap-5">
          <a
            href="#how-it-works"
            className="hidden text-xs font-semibold text-slate-500 transition hover:text-slate-900 sm:block"
          >
            How it works
          </a>
          {onUploadClick && (
            <button
              type="button"
              onClick={onUploadClick}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Upload
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

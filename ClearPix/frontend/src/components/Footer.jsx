export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <span className="text-sm font-bold tracking-tight text-slate-900">
          Clear<span className="text-blue-600">Pix</span>
        </span>
        <div className="flex items-center gap-5 text-xs text-slate-400">
          <span>Images are never stored</span>
          <span>© {new Date().getFullYear()} ClearPix</span>
        </div>
      </div>
    </footer>
  );
}

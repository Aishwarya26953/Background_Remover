import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

function Logo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 focus-visible:outline-none"
      aria-label="ClearPix home"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
        <Zap size={16} className="text-white" fill="white" />
      </div>
      <span className="text-[17px] font-bold tracking-tight text-slate-900">
        Clear<span className="text-blue-600">Pix</span>
      </span>
    </button>
  );
}

export default function Header({ onUploadClick, onLogoClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Background Remover", href: "#upload" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo onClick={onLogoClick} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onUploadClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Upload Image
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                onUploadClick();
              }}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Upload Image
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

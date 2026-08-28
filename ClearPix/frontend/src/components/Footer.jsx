import { Zap } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Background Remover", href: "#upload" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-slate-900">
                Clear<span className="text-blue-600">Pix</span>
              </span>
            </div>
            <p className="mt-3 max-w-[200px] text-sm leading-6 text-slate-500">
              AI-powered background removal for everyone.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group}
              </p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            © {year} ClearPix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

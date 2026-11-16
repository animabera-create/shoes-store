import {useState} from 'react';
import {Menu, ShoppingBag, X} from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenBag: () => void;
  onOpenOrders: () => void;
}

export function Header({cartCount, onOpenBag, onOpenOrders}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {label: 'Drops', href: '#drops'},
    {label: 'Viral Trends', href: '#drops'},
    {label: 'Lookbook', href: '#lookbook'},
    {label: 'Crypto Pay', href: '#crypto'},
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F6F5F2]/95 backdrop-blur-sm border-b border-black/[0.08]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#"
          className="font-display text-xl font-extrabold tracking-tight text-[#141416] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
        >
          KICKHAUS
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5C64]" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-[#141416] hover:underline underline-offset-4 decoration-[#2563EB] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenOrders}
            className="hover:text-[#141416] hover:underline underline-offset-4 decoration-[#2563EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
          >
            Orders
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-black/[0.1] text-[#141416] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141416] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Responsive mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.08] bg-[#F6F5F2] px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 text-sm font-medium text-[#141416] hover:bg-black/[0.04] rounded-md"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrders();
              }}
              className="py-2.5 px-2 text-left text-sm font-medium text-[#141416] hover:bg-black/[0.04] rounded-md cursor-pointer"
            >
              Orders
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

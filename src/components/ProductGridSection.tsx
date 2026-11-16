import {Heart, Search, Wallet} from 'lucide-react';
import {CryptoRates, DisplayCurrency, ShoeCategory, ShoeProduct, WalletState} from '../types';
import {formatPrice, shortenAddress} from '../utils/crypto';
import {ResilientImage} from './ResilientImage';

export type SortOption = 'viral' | 'price-asc' | 'price-desc';

interface ProductGridSectionProps {
  products: ShoeProduct[];
  selectedCategory: ShoeCategory;
  onSelectCategory: (cat: ShoeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  currency: DisplayCurrency;
  onCurrencyChange: (currency: DisplayCurrency) => void;
  rates: CryptoRates;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onInspectProduct: (product: ShoeProduct) => void;
  onQuickAdd: (product: ShoeProduct) => void;
  wallet: WalletState;
  onConnectWallet: () => void;
}

const CATEGORIES: ShoeCategory[] = ['All', 'Y2K Mesh', 'Gorpcore', 'Skate', 'Court & Tech', 'Saved'];
const CURRENCIES: DisplayCurrency[] = ['USD', 'USDC', 'ETH', 'SOL'];

export function ProductGridSection({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  currency,
  onCurrencyChange,
  rates,
  wishlistIds,
  onToggleWishlist,
  onInspectProduct,
  onQuickAdd,
  wallet,
  onConnectWallet,
}: ProductGridSectionProps) {
  return (
    <section id="drops" className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16 border-t border-black/[0.08]">
      {/* Section Header + Wallet / Currency Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#5C5C64]">
            Curated Footwear · Live Viral Velocity
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141416] mt-1">
            Featured Drops & Viral Silhouettes
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div
            className="inline-flex items-center p-1 rounded-lg bg-[#ECEAE4] border border-black/[0.06]"
            role="group"
            aria-label="Display currency"
          >
            {CURRENCIES.map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onCurrencyChange(curr)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currency === curr
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-[#5C5C64] hover:text-[#141416]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Wallet Connect Button */}
          <button
            type="button"
            onClick={onConnectWallet}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
              wallet.connected
                ? 'bg-white border-black/[0.12] text-[#141416] hover:border-black/[0.28]'
                : 'bg-[#141416] border-[#141416] text-white hover:bg-[#2563EB] hover:border-[#2563EB]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {wallet.connected ? (
              <span className="font-mono tabular-nums">
                {shortenAddress(wallet.address)} · {wallet.network}
              </span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-black/[0.06]">
        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            const label = category === 'Saved' ? `Saved (${wishlistIds.length})` : category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#141416] text-white'
                    : 'bg-white/70 text-[#5C5C64] hover:text-[#141416] hover:bg-white border border-black/[0.06]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#5C5C64] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search silhouettes or #tags"
              aria-label="Search footwear catalog"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-black/[0.1] rounded-lg text-[#141416] placeholder:text-[#5C5C64]/70 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort footwear"
            className="px-3 py-2 text-xs font-medium bg-white border border-black/[0.1] rounded-lg text-[#141416] focus:outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="viral">Sort: Viral Velocity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-black/[0.08] mt-8 px-4">
          <p className="font-display text-lg font-semibold text-[#141416]">
            No footwear matches your current filter.
          </p>
          <p className="text-sm text-[#5C5C64] mt-1">
            Reset your search or switch back to all curated drops.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              onSearchChange('');
            }}
            className="mt-5 px-4 py-2 rounded-lg bg-[#141416] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-8">
          {products.map((product) => {
            const isSaved = wishlistIds.includes(product.id);
            return (
              <article
                key={product.id}
                className="group bg-white rounded-xl border border-black/[0.08] overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Uniform 4:3 Imagery taking ~70% of card visual presence */}
                <div className="relative aspect-[4/3] bg-[#ECEAE4] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onInspectProduct(product)}
                    className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#2563EB]"
                    aria-label={`Inspect ${product.name}`}
                  >
                    <ResilientImage
                      src={product.image}
                      alt={product.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      fallbackLabel={product.name}
                    />
                  </button>

                  {/* Top metadata line (text only, zero pills) + Save button */}
                  <div className="absolute top-3 left-4 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-medium tracking-wide text-[#141416]/80 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded-sm">
                      {product.availability === 'Limited Run'
                        ? 'Limited Run'
                        : `#${product.viralRank} Viral`}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      aria-label={isSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
                      className="pointer-events-auto w-9 h-9 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#141416] hover:bg-white transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${isSaved ? 'fill-[#2563EB] text-[#2563EB]' : 'text-[#141416]'}`}
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Body: Identical Field Order */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#5C5C64] tracking-wide uppercase">
                      {product.category}
                      <span aria-hidden="true"> · </span>
                      <span className="normal-case">{product.viralViews}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#2563EB] font-semibold tabular-nums">{product.trendDelta}</span>
                    </p>
                    <h3 className="font-display text-lg font-semibold text-[#141416] mt-1.5 leading-snug">
                      <button
                        type="button"
                        onClick={() => onInspectProduct(product)}
                        className="text-left hover:text-[#2563EB] transition-colors cursor-pointer"
                      >
                        {product.name}
                      </button>
                    </h3>
                  </div>

                  <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-[15px] font-semibold text-[#141416] tabular-nums">
                        {formatPrice(product.priceUsd, currency, rates)}
                      </span>
                      {currency !== 'USD' && (
                        <span className="ml-2 text-xs text-[#5C5C64] tabular-nums">
                          (${product.priceUsd})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onInspectProduct(product)}
                        className="px-3 py-1.5 text-xs font-medium text-[#5C5C64] hover:text-[#141416] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Sizes
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAdd(product)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#141416] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

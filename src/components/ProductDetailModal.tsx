import {useEffect, useState} from 'react';
import {Check, Heart, Share2, ShieldCheck, X} from 'lucide-react';
import {CryptoRates, DisplayCurrency, ShoeProduct} from '../types';
import {formatPrice, formatTokenAmount} from '../utils/crypto';
import {ResilientImage} from './ResilientImage';

interface ProductDetailModalProps {
  product: ShoeProduct | null;
  currency: DisplayCurrency;
  rates: CryptoRates;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onAddToBag: (product: ShoeProduct, size: string, colorway: string, openCheckout?: boolean) => void;
  onShareProduct: (product: ShoeProduct) => void;
}

export function ProductDetailModal({
  product,
  currency,
  rates,
  isSaved,
  onToggleSave,
  onClose,
  onAddToBag,
  onShareProduct,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColorway, setSelectedColorway] = useState<string>('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.sizes.find((s) => s.stock > 0)?.size || product.sizes[0].size;
    setSelectedSize(firstAvailable);
    setSelectedColorway(product.colorways[0]?.name || 'Default');
    setAddedFeedback(false);
  }, [product]);

  if (!product) return null;

  const activeSizeObj = product.sizes.find((s) => s.size === selectedSize);

  const handleAdd = (instantCheckout = false) => {
    if (!selectedSize) return;
    onAddToBag(product, selectedSize, selectedColorway, instantCheckout);
    if (!instantCheckout) {
      setAddedFeedback(true);
      window.setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div className="relative w-full max-w-4xl bg-[#F6F5F2] rounded-2xl border border-black/[0.1] shadow-2xl overflow-hidden my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-white/90 text-[#141416] flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Sticky Gallery + Social Proof */}
          <div className="md:col-span-6 bg-[#ECEAE4] flex flex-col justify-between">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <ResilientImage
                src={product.image}
                alt={product.alt}
                className="w-full h-full object-cover"
                fallbackLabel={product.name}
              />
            </div>

            <div className="p-6 border-t border-black/[0.06] bg-white/60">
              <p className="text-xs font-medium text-[#5C5C64] uppercase tracking-wide">
                Viral Momentum · {product.viralPlatform}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold text-[#141416]">
                  {product.viralViews} · {product.viralTag}
                </p>
                <span className="text-xs font-semibold text-[#2563EB] tabular-nums">
                  {product.trendDelta}
                </span>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-[#5C5C64]">
                {product.materials.map((mat) => (
                  <li key={mat}>· {mat}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between gap-3 pr-10">
                <p className="text-xs font-medium text-[#5C5C64] uppercase tracking-wide">
                  {product.category} · #{product.viralRank} Trending
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleSave(product.id)}
                    aria-label={isSaved ? 'Remove from saved' : 'Save pair'}
                    className="p-2 rounded-lg hover:bg-black/[0.04] text-[#141416] transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#2563EB] text-[#2563EB]' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShareProduct(product)}
                    aria-label="Share pair to social"
                    className="p-2 rounded-lg hover:bg-black/[0.04] text-[#141416] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 id="pdp-title" className="font-display text-2xl sm:text-3xl font-bold text-[#141416] mt-1">
                {product.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-2xl font-bold text-[#141416] tabular-nums">
                  {formatPrice(product.priceUsd, currency, rates)}
                </span>
                <span className="font-mono text-xs text-[#5C5C64] tabular-nums">
                  {formatTokenAmount(product.priceUsd, 'ETH', rates)} ·{' '}
                  {formatTokenAmount(product.priceUsd, 'SOL', rates)}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#5C5C64] leading-relaxed">{product.description}</p>

              {/* Colorway Selector */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#141416] mb-2">
                  Colorway: <span className="font-normal text-[#5C5C64]">{selectedColorway}</span>
                </p>
                <div className="flex items-center gap-2.5">
                  {product.colorways.map((cw) => {
                    const active = selectedColorway === cw.name;
                    return (
                      <button
                        key={cw.name}
                        type="button"
                        onClick={() => setSelectedColorway(cw.name)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-[#141416] bg-[#F6F5F2] text-[#141416]'
                            : 'border-black/[0.1] text-[#5C5C64] hover:border-black/[0.25]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                          style={{backgroundColor: cw.hex}}
                        />
                        <span>{cw.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Grid */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#141416]">Select Size</p>
                  {activeSizeObj && (
                    <p className="text-xs text-[#5C5C64] tabular-nums">
                      {activeSizeObj.stock <= 2
                        ? `Only ${activeSizeObj.stock} left in ${activeSizeObj.size}`
                        : `${activeSizeObj.stock} pairs ready to ship`}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((s) => {
                    const out = s.stock === 0;
                    const active = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedSize(s.size)}
                        className={`py-2.5 text-xs font-medium rounded-lg border transition-colors tabular-nums ${
                          out
                            ? 'border-black/[0.05] text-[#5C5C64]/40 bg-[#F6F5F2] line-through cursor-not-allowed'
                            : active
                              ? 'border-[#141416] bg-[#141416] text-white cursor-pointer'
                              : 'border-black/[0.12] text-[#141416] hover:border-[#141416] cursor-pointer'
                        }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-black/[0.08] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAdd(false)}
                  className="w-full py-3 px-4 rounded-lg bg-[#141416] text-white text-sm font-semibold hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <span>Add to Bag</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleAdd(true)}
                  className="w-full py-3 px-4 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  Pay with Crypto
                </button>
              </div>

              <p className="text-xs text-[#5C5C64] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>Authenticated stock · Free express shipping over $175 · USDC / ETH / SOL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

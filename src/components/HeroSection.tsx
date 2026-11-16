import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {HERO_CAMPAIGN} from '../data/storeData';
import {CryptoRates, DisplayCurrency, ShoeProduct} from '../types';
import {formatPrice} from '../utils/crypto';
import {ResilientImage} from './ResilientImage';

interface HeroSectionProps {
  featuredProduct: ShoeProduct;
  currency: DisplayCurrency;
  rates: CryptoRates;
  onInspectProduct: (product: ShoeProduct) => void;
}

export function HeroSection({
  featuredProduct,
  currency,
  rates,
  onInspectProduct,
}: HeroSectionProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left editorial column */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#5C5C64] mb-4">
              {HERO_CAMPAIGN.kicker}
            </p>
            <h1
              className="font-display font-bold text-[#141416] tracking-tight leading-[1.04] text-balance"
              style={{fontSize: 'clamp(2.25rem, 4vw, 3.65rem)'}}
            >
              {HERO_CAMPAIGN.headline}
            </h1>
            <p className="mt-5 text-[15px] sm:text-base text-[#5C5C64] leading-relaxed max-w-[48ch]">
              {HERO_CAMPAIGN.subcopy}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#drops"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <span>Shop Viral Drops</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#lookbook"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg border border-black/[0.12] bg-white text-[#141416] text-sm font-medium hover:border-black/[0.28] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <span>Worn on Feed</span>
                <ArrowUpRight className="w-4 h-4 text-[#5C5C64]" />
              </a>
            </div>
          </div>

          {/* Unboxed claim-adjacent proof row */}
          <div className="mt-10 pt-6 border-t border-black/[0.08] grid grid-cols-3 gap-4">
            <div>
              <p className="font-display text-xl font-bold text-[#141416] tabular-nums">5.4M+</p>
              <p className="text-xs text-[#5C5C64] mt-0.5">Weekly TikTok & Reels reach</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-[#141416] tabular-nums">4 Chains</p>
              <p className="text-xs text-[#5C5C64] mt-0.5">Base, ETH, SOL & Polygon</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-[#141416] tabular-nums">0% Fee</p>
              <p className="text-xs text-[#5C5C64] mt-0.5">Instant USDC settlement</p>
            </div>
          </div>
        </div>

        {/* Right campaign hero visual */}
        <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-black/[0.08] bg-[#ECEAE4] min-h-[300px] lg:min-h-[480px]">
          <ResilientImage
            src={HERO_CAMPAIGN.image}
            alt={HERO_CAMPAIGN.alt}
            className="w-full h-full object-cover aspect-[16/9] lg:aspect-auto lg:h-full"
            fallbackLabel={featuredProduct.name}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-xs text-white/80 tracking-wide">
                #1 Viral on {featuredProduct.viralPlatform} · {featuredProduct.viralViews}
              </p>
              <p className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-1">
                {featuredProduct.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onInspectProduct(featuredProduct)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#141416] text-sm font-semibold hover:bg-[#F6F5F2] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="tabular-nums">
                Inspect · {formatPrice(featuredProduct.priceUsd, currency, rates)}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

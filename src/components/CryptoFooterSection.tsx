import {ArrowUpRight, Check, Wallet} from 'lucide-react';
import {CryptoRates, WalletState} from '../types';
import {shortenAddress} from '../utils/crypto';

interface CryptoFooterSectionProps {
  rates: CryptoRates;
  wallet: WalletState;
  onConnectEvm: () => Promise<void>;
  onConnectSolana: () => Promise<void>;
  onOpenOrders: () => void;
}

export function CryptoFooterSection({
  rates,
  wallet,
  onConnectEvm,
  onConnectSolana,
  onOpenOrders,
}: CryptoFooterSectionProps) {
  return (
    <>
      {/* Section 4: Crypto Settlement Infrastructure */}
      <section
        id="crypto"
        className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16 border-t border-black/[0.08]"
      >
        <div className="bg-[#141416] text-white rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-white/65">
              Native Multi-Chain Checkout · {rates.source === 'live' ? 'Live Spot Feed' : 'Reference Spot Rates'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-balance">
              Zero-markup crypto settlement across Base, Ethereum, Solana, and Polygon.
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] text-white/75 leading-relaxed max-w-[54ch]">
              Connect MetaMask, Coinbase Wallet, or Phantom—or scan our dynamic payment QR from any
              mobile wallet. USDC settles with zero store surcharge and triggers instant dispatch.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onConnectEvm}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                {wallet.connected && wallet.network !== 'Solana' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="font-mono">{shortenAddress(wallet.address)}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect EVM Wallet</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onConnectSolana}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer"
              >
                {wallet.connected && wallet.network === 'Solana' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="font-mono">{shortenAddress(wallet.address)}</span>
                  </>
                ) : (
                  <>
                    <span>Connect Phantom (SOL)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <p className="text-xs text-white/60">ETH Spot</p>
              <p className="font-mono text-lg font-bold mt-1 tabular-nums">
                ${rates.ETH.toLocaleString()}
              </p>
              <p className="text-[11px] text-white/55 mt-1">Ethereum & Base</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <p className="text-xs text-white/60">SOL Spot</p>
              <p className="font-mono text-lg font-bold mt-1 tabular-nums">
                ${rates.SOL.toLocaleString()}
              </p>
              <p className="text-[11px] text-white/55 mt-1">Solana Pay Instant</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <p className="text-xs text-white/60">USDC Stable</p>
              <p className="font-mono text-lg font-bold mt-1 tabular-nums">$1.00</p>
              <p className="text-[11px] text-white/55 mt-1">1:1 Parity Settlement</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <p className="text-xs text-white/60">MATIC Spot</p>
              <p className="font-mono text-lg font-bold mt-1 tabular-nums">
                ${rates.MATIC.toFixed(2)}
              </p>
              <p className="text-[11px] text-white/55 mt-1">Polygon PoS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Site Footer */}
      <footer className="border-t border-black/[0.08] bg-[#F6F5F2]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5C5C64]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-display text-sm font-bold text-[#141416]">KICKHAUS</span>
            <span>Curated Viral Footwear · Tokyo / Los Angeles</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#drops" className="hover:text-[#141416] transition-colors">
              Drops
            </a>
            <a href="#lookbook" className="hover:text-[#141416] transition-colors">
              Worn on Feed
            </a>
            <a href="#crypto" className="hover:text-[#141416] transition-colors">
              Crypto Settlement
            </a>
            <button
              type="button"
              onClick={onOpenOrders}
              className="hover:text-[#141416] transition-colors cursor-pointer"
            >
              Order History
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

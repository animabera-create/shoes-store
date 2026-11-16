import {useMemo, useState} from 'react';
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  CartItem,
  CryptoNetwork,
  CryptoRates,
  CryptoToken,
  OrderRecord,
  WalletState,
} from '../types';
import {
  buildQrMatrix,
  formatTokenAmount,
  NETWORK_DEFAULT_TOKEN,
  shortenAddress,
  STORE_TREASURY_ADDRESSES,
  triggerNativeCryptoPayment,
} from '../utils/crypto';
import {ResilientImage} from './ResilientImage';

interface CartCheckoutDrawerProps {
  open: boolean;
  items: CartItem[];
  rates: CryptoRates;
  wallet: WalletState;
  onClose: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onConnectEvm: () => Promise<void>;
  onConnectSolana: () => Promise<void>;
  onCompleteOrder: (order: OrderRecord) => void;
}

const NETWORKS: CryptoNetwork[] = ['Base', 'Ethereum', 'Solana', 'Polygon'];
const TOKENS_BY_NETWORK: Record<CryptoNetwork, CryptoToken[]> = {
  Base: ['USDC', 'ETH'],
  Ethereum: ['ETH', 'USDC'],
  Solana: ['SOL', 'USDC'],
  Polygon: ['USDC', 'MATIC'],
};

export function CartCheckoutDrawer({
  open,
  items,
  rates,
  wallet,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onConnectEvm,
  onConnectSolana,
  onCompleteOrder,
}: CartCheckoutDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'receipt'>('bag');
  const [paymentMethod, setPaymentMethod] = useState<'Crypto' | 'Card'>('Crypto');
  const [network, setNetwork] = useState<CryptoNetwork>('Base');
  const [token, setToken] = useState<CryptoToken>('USDC');
  const [processing, setProcessing] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');
  const [formError, setFormError] = useState('');
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);

  const subtotalUsd = items.reduce((acc, item) => acc + item.priceUsd * item.quantity, 0);
  const freeShippingThreshold = 175;
  const shippingUsd = subtotalUsd === 0 || subtotalUsd >= freeShippingThreshold ? 0 : 12;
  const totalUsd = subtotalUsd + shippingUsd;

  const treasuryAddress = STORE_TREASURY_ADDRESSES[network];
  const cryptoAmountFormatted = formatTokenAmount(totalUsd, token, rates);

  const paymentUri = useMemo(() => {
    const scheme = network === 'Solana' ? 'solana' : 'ethereum';
    return `${scheme}:${treasuryAddress}?amount=${cryptoAmountFormatted.split(' ')[0]}&token=${token}&chain=${network}`;
  }, [network, treasuryAddress, cryptoAmountFormatted, token]);

  const qrMatrix = useMemo(() => buildQrMatrix(paymentUri), [paymentUri]);

  if (!open) return null;

  const handleNetworkChange = (nextNet: CryptoNetwork) => {
    setNetwork(nextNet);
    setToken(NETWORK_DEFAULT_TOKEN[nextNet]);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(treasuryAddress);
      setCopiedUri(true);
      window.setTimeout(() => setCopiedUri(false), 1800);
    } catch {
      // Clipboard blocked in restricted iframe fallback
    }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingPostal.trim()) {
      setFormError('Complete your delivery name, street address, city, and postal code.');
      return;
    }
    setFormError('');
    setProcessing(true);

    try {
      let txHash: string | undefined;
      if (paymentMethod === 'Crypto') {
        const result = await triggerNativeCryptoPayment(wallet, network, token, totalUsd, rates);
        txHash = result.txHash;
      } else {
        await new Promise((r) => window.setTimeout(r, 650));
      }

      const orderNumber = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdOrder: OrderRecord = {
        id: orderNumber,
        createdAt: new Date().toLocaleString(),
        items: [...items],
        subtotalUsd,
        shippingUsd,
        totalUsd,
        paymentMethod,
        cryptoToken: paymentMethod === 'Crypto' ? token : undefined,
        cryptoAmount: paymentMethod === 'Crypto' ? cryptoAmountFormatted : undefined,
        network: paymentMethod === 'Crypto' ? network : undefined,
        txHash,
        walletAddress: paymentMethod === 'Crypto' && wallet.connected ? wallet.address : undefined,
        shippingName: shippingName.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingPostal: shippingPostal.trim(),
        status:
          paymentMethod === 'Crypto'
            ? 'On-Chain Verified — Packing'
            : 'Confirmed — Preparing Shipment',
      };

      setLatestOrder(createdOrder);
      onCompleteOrder(createdOrder);
      setStep('receipt');
    } finally {
      setProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag and checkout"
    >
      <div className="w-full max-w-lg bg-[#F6F5F2] h-full flex flex-col border-l border-black/[0.1] shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-5 bg-white border-b border-black/[0.08] flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141416]">
              {step === 'bag' && `Your Bag (${items.reduce((a, b) => a + b.quantity, 0)})`}
              {step === 'checkout' && 'Checkout & Settlement'}
              {step === 'receipt' && 'Order Confirmed'}
            </h2>
            {step === 'bag' && subtotalUsd > 0 && (
              <p className="text-xs text-[#5C5C64] mt-0.5 tabular-nums">
                {subtotalUsd >= freeShippingThreshold
                  ? 'Free express courier shipping unlocked'
                  : `Add $${(freeShippingThreshold - subtotalUsd).toFixed(0)} more for free express shipping`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close bag drawer"
            className="w-9 h-9 rounded-lg hover:bg-black/[0.05] flex items-center justify-center text-[#141416] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'bag' && (
            <>
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="font-display text-lg font-semibold text-[#141416]">Your bag is empty.</p>
                  <p className="text-sm text-[#5C5C64] mt-1">
                    Select any viral silhouette from the drops grid to begin.
                  </p>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="mt-6 px-5 py-2.5 rounded-lg bg-[#141416] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
                  >
                    Browse Footwear
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.productId}-${item.size}-${item.colorway}`}
                      className="p-4 bg-white rounded-xl border border-black/[0.08] flex gap-4"
                    >
                      <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-[#ECEAE4] shrink-0">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display text-sm font-semibold text-[#141416] truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[#5C5C64] mt-0.5">
                              {item.colorway} · {item.size}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            aria-label={`Remove ${item.name}`}
                            className="p-1 text-[#5C5C64] hover:text-[#E11D48] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-black/[0.1] rounded-lg bg-[#F6F5F2]">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(idx, -1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#141416] hover:bg-black/[0.04] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(idx, 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#141416] hover:bg-black/[0.04] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-mono text-sm font-semibold text-[#141416] tabular-nums">
                            ${(item.priceUsd * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleSubmitCheckout} className="space-y-6">
              {/* Payment Method Segmented Switcher */}
              <div>
                <p className="text-xs font-semibold text-[#141416] mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#ECEAE4] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Crypto')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      paymentMethod === 'Crypto'
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-[#5C5C64] hover:text-[#141416]'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Crypto Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'bg-white text-[#141416] shadow-xs'
                        : 'text-[#5C5C64] hover:text-[#141416]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card / Express</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'Crypto' ? (
                <div className="p-4 bg-white rounded-xl border border-black/[0.08] space-y-4">
                  {/* Network + Token Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#5C5C64] mb-1">Network</label>
                      <select
                        value={network}
                        onChange={(e) => handleNetworkChange(e.target.value as CryptoNetwork)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      >
                        {NETWORKS.map((net) => (
                          <option key={net} value={net}>
                            {net}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#5C5C64] mb-1">Token</label>
                      <select
                        value={token}
                        onChange={(e) => setToken(e.target.value as CryptoToken)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      >
                        {TOKENS_BY_NETWORK[network].map((tok) => (
                          <option key={tok} value={tok}>
                            {tok}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connected Wallet or Connect Actions */}
                  <div className="pt-2 border-t border-black/[0.06]">
                    {wallet.connected ? (
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#141416]">{wallet.providerName}</p>
                          <p className="font-mono text-[#5C5C64] tabular-nums">
                            {shortenAddress(wallet.address)} · {wallet.balanceLabel}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#2563EB]">Ready</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={onConnectEvm}
                          className="py-2 px-3 rounded-lg border border-black/[0.12] text-xs font-semibold text-[#141416] hover:border-[#2563EB] transition-colors cursor-pointer"
                        >
                          Connect MetaMask / EVM
                        </button>
                        <button
                          type="button"
                          onClick={onConnectSolana}
                          className="py-2 px-3 rounded-lg border border-black/[0.12] text-xs font-semibold text-[#141416] hover:border-[#2563EB] transition-colors cursor-pointer"
                        >
                          Connect Phantom
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment QR & Address */}
                  <div className="pt-3 border-t border-black/[0.06] flex items-center gap-4">
                    <div className="p-2 bg-white border border-black/[0.1] rounded-lg shrink-0">
                      <svg
                        viewBox="0 0 21 21"
                        className="w-20 h-20"
                        role="img"
                        aria-label="Crypto payment QR code"
                      >
                        <rect width="21" height="21" fill="#FFFFFF" />
                        {qrMatrix.map((row, rIdx) =>
                          row.map((filled, cIdx) =>
                            filled ? (
                              <rect
                                key={`${rIdx}-${cIdx}`}
                                x={cIdx}
                                y={rIdx}
                                width="1"
                                height="1"
                                fill="#141416"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-xs text-[#5C5C64]">Amount Due ({network})</p>
                      <p className="font-mono text-base font-bold text-[#141416] tabular-nums">
                        {cryptoAmountFormatted}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2563EB] hover:underline cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedUri ? 'Address Copied' : shortenAddress(treasuryAddress)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-black/[0.08] space-y-3">
                  <p className="text-xs font-semibold text-[#141416]">Express Card Details</p>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    aria-label="Card number"
                    className="w-full px-3 py-2 text-sm font-mono bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      defaultValue="09/29"
                      aria-label="Expiry"
                      className="w-full px-3 py-2 text-sm font-mono bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                    />
                    <input
                      type="text"
                      defaultValue="842"
                      aria-label="CVC"
                      className="w-full px-3 py-2 text-sm font-mono bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              )}

              {/* Shipping Address Verification */}
              <div className="p-4 bg-white rounded-xl border border-black/[0.08] space-y-3">
                <p className="text-xs font-semibold text-[#141416]">Delivery Destination</p>
                <input
                  type="text"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street Address & Apt"
                  className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                  <input
                    type="text"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    placeholder="Postal Code"
                    className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                {formError && <p className="text-xs text-[#E11D48]">{formError}</p>}
              </div>
            </form>
          )}

          {step === 'receipt' && latestOrder && (
            <div className="p-6 bg-white rounded-xl border border-black/[0.08] space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-lg font-bold text-[#141416]">
                    Order #{latestOrder.id} Confirmed
                  </p>
                  <p className="text-xs text-[#5C5C64] mt-0.5">{latestOrder.status}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.06] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C5C64]">Settlement</span>
                  <span className="font-mono font-semibold text-[#141416]">
                    {latestOrder.paymentMethod === 'Crypto'
                      ? `${latestOrder.cryptoAmount} (${latestOrder.network})`
                      : `$${latestOrder.totalUsd.toFixed(2)} Card`}
                  </span>
                </div>
                {latestOrder.txHash && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#5C5C64]">Tx Hash</span>
                    <span className="font-mono text-[#2563EB] truncate max-w-[220px]">
                      {latestOrder.txHash}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#5C5C64]">Ship To</span>
                  <span className="font-medium text-[#141416] text-right">
                    {latestOrder.shippingName}, {latestOrder.shippingCity}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.06]">
                <p className="text-xs font-semibold text-[#141416] mb-2">Pairs Reserved</p>
                <ul className="space-y-1.5 text-xs text-[#5C5C64]">
                  {latestOrder.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between tabular-nums"
                    >
                      <span>
                        {item.quantity}x {item.name} ({item.size})
                      </span>
                      <span className="font-mono text-[#141416]">
                        ${(item.priceUsd * item.quantity).toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-white border-t border-black/[0.08] space-y-4">
          {step === 'bag' && items.length > 0 && (
            <>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#5C5C64]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${subtotalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5C5C64]">
                  <span>Express Shipping</span>
                  <span className="font-mono tabular-nums">
                    {shippingUsd === 0 ? 'Free' : `$${shippingUsd.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#141416] pt-2 border-t border-black/[0.06]">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">
                    ${totalUsd.toFixed(2)} · {formatTokenAmount(totalUsd, 'ETH', rates)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-4 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Continue to Checkout
              </button>
            </>
          )}

          {step === 'checkout' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm font-semibold text-[#141416]">
                <span>Total Due</span>
                <span className="font-mono tabular-nums">
                  {paymentMethod === 'Crypto' ? cryptoAmountFormatted : `$${totalUsd.toFixed(2)}`}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 py-3 rounded-lg border border-black/[0.12] text-xs font-semibold text-[#141416] hover:bg-black/[0.04] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={processing}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {processing
                    ? 'Confirming Settlement...'
                    : paymentMethod === 'Crypto'
                      ? `Pay ${cryptoAmountFormatted}`
                      : `Pay $${totalUsd.toFixed(2)}`}
                </button>
              </div>
              <p className="text-[11px] text-[#5C5C64] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Verified multi-chain checkout · Instant receipt</span>
              </p>
            </div>
          )}

          {step === 'receipt' && (
            <button
              type="button"
              onClick={resetAndClose}
              className="w-full py-3 px-4 rounded-lg bg-[#141416] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
            >
              Done & Return to Storefront
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

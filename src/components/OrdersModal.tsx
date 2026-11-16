import {useState} from 'react';
import {Check, Copy, Package, X} from 'lucide-react';
import {OrderRecord} from '../types';

interface OrdersModalProps {
  open: boolean;
  orders: OrderRecord[];
  onClose: () => void;
}

export function OrdersModal({open, orders, onClose}: OrdersModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!open) return null;

  const copyHash = async (id: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // ignore clipboard fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Order history and on-chain receipts"
    >
      <div className="w-full max-w-2xl bg-[#F6F5F2] rounded-2xl border border-black/[0.1] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 bg-white border-b border-black/[0.08] flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141416]">Order History</h2>
            <p className="text-xs text-[#5C5C64]">Confirmed drops & verified on-chain receipts</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order history"
            className="w-9 h-9 rounded-lg hover:bg-black/[0.05] flex items-center justify-center text-[#141416] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-black/[0.08]">
              <Package className="w-6 h-6 text-[#5C5C64] mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-display text-base font-semibold text-[#141416]">No orders placed yet</p>
              <p className="text-xs text-[#5C5C64] mt-1">
                Complete a bag checkout via Crypto Pay or Card to view your receipt here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-xl border border-black/[0.08] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold text-[#141416]">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-[#5C5C64]">{order.createdAt}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB]">{order.status}</span>
                </div>

                <ul className="pt-3 border-t border-black/[0.06] space-y-1.5 text-xs text-[#5C5C64]">
                  {order.items.map((item) => (
                    <li
                      key={`${order.id}-${item.productId}-${item.size}`}
                      className="flex justify-between tabular-nums"
                    >
                      <span>
                        {item.quantity}x {item.name} · {item.colorway} ({item.size})
                      </span>
                      <span className="font-mono text-[#141416]">
                        ${(item.priceUsd * item.quantity).toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#5C5C64]">
                    {order.paymentMethod === 'Crypto'
                      ? `Settled: ${order.cryptoAmount} on ${order.network}`
                      : `Settled: $${order.totalUsd.toFixed(2)} via Card`}
                  </span>

                  {order.txHash && (
                    <button
                      type="button"
                      onClick={() => copyHash(order.id, order.txHash!)}
                      className="inline-flex items-center gap-1 font-mono text-[#2563EB] hover:underline cursor-pointer"
                    >
                      {copiedId === order.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tx Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{order.txHash.slice(0, 12)}...</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

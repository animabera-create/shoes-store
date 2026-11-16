import {useState} from 'react';
import {Check, Copy, ExternalLink, X} from 'lucide-react';

export interface ShareTarget {
  title: string;
  caption: string;
  tag: string;
  url: string;
}

interface ShareModalProps {
  target: ShareTarget | null;
  onClose: () => void;
}

export function ShareModal({target, onClose}: ShareModalProps) {
  const [copiedType, setCopiedType] = useState<'link' | 'caption' | null>(null);

  if (!target) return null;

  const copyText = async (text: string, type: 'link' | 'caption') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      window.setTimeout(() => setCopiedType(null), 1800);
    } catch {
      // Clipboard blocked fallback
    }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${target.caption} ${target.tag}`
  )}&url=${encodeURIComponent(target.url)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Share to social media"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/[0.1] shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#5C5C64] uppercase tracking-wide">
              Share to Feed
            </p>
            <h3 className="font-display text-lg font-bold text-[#141416] mt-0.5">{target.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="w-8 h-8 rounded-lg hover:bg-black/[0.05] flex items-center justify-center text-[#141416] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F6F5F2] border border-black/[0.06] text-xs text-[#5C5C64] leading-relaxed">
          {target.caption} <span className="font-semibold text-[#2563EB]">{target.tag}</span>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => copyText(target.url, 'link')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#141416] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedType === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedType === 'link' ? 'Drop Link Copied' : 'Copy Shoppable Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => copyText(`${target.caption} ${target.tag}`, 'caption')}
            className="w-full py-2.5 px-4 rounded-lg border border-black/[0.12] text-[#141416] text-xs font-semibold hover:border-black/[0.3] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedType === 'caption' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>
              {copiedType === 'caption'
                ? 'TikTok / IG Caption Copied'
                : 'Copy Caption for TikTok / IG'}
            </span>
          </button>

          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-lg border border-black/[0.12] text-[#141416] text-xs font-semibold hover:border-black/[0.3] transition-colors flex items-center justify-center gap-2"
          >
            <span>Post to X</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

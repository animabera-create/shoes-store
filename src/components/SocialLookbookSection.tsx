import {useState} from 'react';
import {ArrowUpRight, Bookmark, Heart, Plus, Repeat2, Share2} from 'lucide-react';
import {ShoeProduct, SocialFitPost, SocialPlatform} from '../types';
import {ResilientImage} from './ResilientImage';

interface SocialLookbookSectionProps {
  posts: SocialFitPost[];
  products: ShoeProduct[];
  onToggleLike: (postId: string) => void;
  onToggleSavePost: (postId: string) => void;
  onSharePost: (post: SocialFitPost) => void;
  onShopProduct: (productId: string) => void;
  onAddPost: (newPost: {
    handle: string;
    authorName: string;
    platform: SocialPlatform;
    productId: string;
    caption: string;
  }) => void;
}

const PLATFORMS: Array<'All' | SocialPlatform> = ['All', 'TikTok', 'Instagram', 'X'];

export function SocialLookbookSection({
  posts,
  products,
  onToggleLike,
  onToggleSavePost,
  onSharePost,
  onShopProduct,
  onAddPost,
}: SocialLookbookSectionProps) {
  const [platformFilter, setPlatformFilter] = useState<'All' | SocialPlatform>('All');
  const [composerOpen, setComposerOpen] = useState(false);

  const [handle, setHandle] = useState('@');
  const [authorName, setAuthorName] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('TikTok');
  const [productId, setProductId] = useState(products[0]?.id || 'spektrum-04');
  const [caption, setCaption] = useState('');
  const [formError, setFormError] = useState('');

  const visiblePosts =
    platformFilter === 'All' ? posts : posts.filter((p) => p.platform === platformFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    if (cleanedHandle.length < 3 || !caption.trim()) {
      setFormError('Enter your social handle and a short fit note to publish.');
      return;
    }
    onAddPost({
      handle: cleanedHandle,
      authorName: authorName.trim() || cleanedHandle.replace('@', ''),
      platform,
      productId,
      caption: caption.trim(),
    });
    setHandle('@');
    setAuthorName('');
    setCaption('');
    setFormError('');
    setComposerOpen(false);
  };

  return (
    <section
      id="lookbook"
      className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16 border-t border-black/[0.08]"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#5C5C64]">
            Community Lookbook · Shoppable Creator Fits
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141416] mt-1">
            Worn on Feed
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Segmented Filter */}
          <div
            className="inline-flex items-center p-1 rounded-lg bg-[#ECEAE4] border border-black/[0.06]"
            role="group"
            aria-label="Filter lookbook by social platform"
          >
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatformFilter(plat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  platformFilter === plat
                    ? 'bg-white text-[#141416] shadow-xs'
                    : 'text-[#5C5C64] hover:text-[#141416]'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setComposerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141416] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{composerOpen ? 'Close Composer' : 'Post Your Fit'}</span>
          </button>
        </div>
      </div>

      {/* Inline Fit-Check Composer */}
      {composerOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border border-black/[0.1] grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#141416] mb-1.5">
              Social Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@yourhandle"
              className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#141416] mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
            >
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="X">X</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#141416] mb-1.5">
              Tagged Pair
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#141416] mb-1.5">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Alex Kim"
              className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="md:col-span-9">
            <label className="block text-xs font-semibold text-[#141416] mb-1.5">Fit Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="How did you style this silhouette? (e.g. Wide washed cargos + quick-lace toggle)"
              className="w-full px-3 py-2 text-sm bg-[#F6F5F2] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
            {formError && <p className="text-xs text-[#E11D48] mt-1.5">{formError}</p>}
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              Publish Fit Check
            </button>
          </div>
        </form>
      )}

      {/* Shoppable Lookbook Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visiblePosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-xl border border-black/[0.08] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[3/4] bg-[#ECEAE4] overflow-hidden">
                <ResilientImage
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-full object-cover"
                  fallbackLabel={post.productName}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                  <p className="text-xs font-medium text-white/80">
                    {post.platform} · {post.timestamp}
                  </p>
                  <p className="text-sm font-semibold tracking-tight mt-0.5">{post.handle}</p>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#5C5C64] leading-relaxed line-clamp-3">
                  {post.caption}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-black/[0.06] space-y-3">
              {/* Interactive Social Engagement Row */}
              <div className="flex items-center justify-between text-xs text-[#5C5C64]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleLike(post.id)}
                    aria-label={`Like fit by ${post.handle}`}
                    className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
                      post.likedByMe ? 'text-[#2563EB] font-semibold' : 'hover:text-[#141416]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-[#2563EB]' : ''}`} />
                    <span className="tabular-nums">{post.likes.toLocaleString()}</span>
                  </button>

                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>{post.reposts.toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleSavePost(post.id)}
                    aria-label={`Save fit by ${post.handle}`}
                    className={`p-1.5 rounded-md hover:bg-black/[0.04] transition-colors cursor-pointer ${
                      post.savedByMe ? 'text-[#2563EB]' : 'text-[#5C5C64]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${post.savedByMe ? 'fill-[#2563EB]' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSharePost(post)}
                    aria-label={`Share fit by ${post.handle}`}
                    className="p-1.5 rounded-md hover:bg-black/[0.04] text-[#5C5C64] hover:text-[#141416] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Direct Shop Trigger */}
              <button
                type="button"
                onClick={() => onShopProduct(post.productId)}
                className="w-full py-2 px-3 rounded-lg bg-[#F6F5F2] hover:bg-[#141416] hover:text-white text-[#141416] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="truncate">Shop {post.productName}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

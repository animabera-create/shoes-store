import {useEffect, useMemo, useState} from 'react';
import {CartCheckoutDrawer} from './components/CartCheckoutDrawer';
import {CryptoFooterSection} from './components/CryptoFooterSection';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {OrdersModal} from './components/OrdersModal';
import {ProductDetailModal} from './components/ProductDetailModal';
import {ProductGridSection, SortOption} from './components/ProductGridSection';
import {ShareModal, ShareTarget} from './components/ShareModal';
import {SocialLookbookSection} from './components/SocialLookbookSection';
import {HERO_CAMPAIGN, INITIAL_SOCIAL_POSTS, SHOE_PRODUCTS} from './data/storeData';
import {
  CartItem,
  CryptoRates,
  DisplayCurrency,
  OrderRecord,
  ShoeCategory,
  ShoeProduct,
  SocialFitPost,
  SocialPlatform,
  WalletState,
} from './types';
import {
  connectEvmWallet,
  connectSolanaWallet,
  DEFAULT_CRYPTO_RATES,
  fetchLiveCryptoRates,
  shortenAddress,
} from './utils/crypto';

const STORAGE_KEYS = {
  cart: 'kickhaus_cart_v1',
  wishlist: 'kickhaus_wishlist_v1',
  posts: 'kickhaus_posts_v1',
  orders: 'kickhaus_orders_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.cart, []));
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.wishlist, ['spektrum-04'])
  );
  const [socialPosts, setSocialPosts] = useState<SocialFitPost[]>(() =>
    readStorage(STORAGE_KEYS.posts, INITIAL_SOCIAL_POSTS)
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() => readStorage(STORAGE_KEYS.orders, []));

  const [selectedCategory, setSelectedCategory] = useState<ShoeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('viral');
  const [currency, setCurrency] = useState<DisplayCurrency>('USD');
  const [rates, setRates] = useState<CryptoRates>(DEFAULT_CRYPTO_RATES);

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    providerName: '',
    address: '',
    network: 'Base',
    balanceLabel: '',
    isInjected: false,
  });

  const [activeProduct, setActiveProduct] = useState<ShoeProduct | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(socialPosts));
  }, [socialPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    let active = true;
    fetchLiveCryptoRates().then((nextRates) => {
      if (active) setRates(nextRates);
    });

    const params = new URLSearchParams(window.location.search);
    const dropId = params.get('drop');
    if (dropId) {
      const matched = SHOE_PRODUCTS.find((p) => p.id === dropId);
      if (matched) setActiveProduct(matched);
    }

    return () => {
      active = false;
    };
  }, []);

  const featuredProduct = useMemo(
    () => SHOE_PRODUCTS.find((p) => p.id === HERO_CAMPAIGN.productId) || SHOE_PRODUCTS[0],
    []
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = SHOE_PRODUCTS.filter((item) => {
      if (selectedCategory === 'Saved') {
        if (!wishlistIds.includes(item.id)) return false;
      } else if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.viralTag.toLowerCase().includes(query) ||
        item.viralPlatform.toLowerCase().includes(query)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price-desc') return b.priceUsd - a.priceUsd;
      return a.viralRank - b.viralRank;
    });
  }, [selectedCategory, searchQuery, sortBy, wishlistIds]);

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from saved pairs' : 'Saved pair to your list');
      return next;
    });
  };

  const handleAddToBag = (
    product: ShoeProduct,
    size: string,
    colorway: string,
    openCheckout = false
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id && item.size === size && item.colorway === colorway
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {...updated[idx], quantity: updated[idx].quantity + 1};
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          priceUsd: product.priceUsd,
          size,
          colorway,
          quantity: 1,
        },
      ];
    });

    if (openCheckout) {
      setActiveProduct(null);
      setBagOpen(true);
    } else {
      showToast(`Added ${product.name} (${size}) to bag`);
    }
  };

  const handleQuickAdd = (product: ShoeProduct) => {
    const firstAvailable = product.sizes.find((s) => s.stock > 0)?.size || 'US 9';
    const defaultColorway = product.colorways[0]?.name || 'Default';
    handleAddToBag(product, firstAvailable, defaultColorway, false);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const next = [...prev];
      next[index] = {...target, quantity: nextQty};
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConnectEvm = async () => {
    const nextWallet = await connectEvmWallet();
    setWallet(nextWallet);
    showToast(`Wallet connected: ${shortenAddress(nextWallet.address)}`);
  };

  const handleConnectSolana = async () => {
    const nextWallet = await connectSolanaWallet();
    setWallet(nextWallet);
    showToast(`Phantom connected: ${shortenAddress(nextWallet.address)}`);
  };

  const handleCompleteOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    showToast(`Order #${order.id} confirmed`);
  };

  const handleTogglePostLike = (postId: string) => {
    setSocialPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const liked = !post.likedByMe;
        return {
          ...post,
          likedByMe: liked,
          likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      })
    );
  };

  const handleTogglePostSave = (postId: string) => {
    setSocialPosts((prev) =>
      prev.map((post) => (post.id === postId ? {...post, savedByMe: !post.savedByMe} : post))
    );
  };

  const handleAddSocialPost = (input: {
    handle: string;
    authorName: string;
    platform: SocialPlatform;
    productId: string;
    caption: string;
  }) => {
    const matchedShoe =
      SHOE_PRODUCTS.find((p) => p.id === input.productId) || SHOE_PRODUCTS[0];
    const newPost: SocialFitPost = {
      id: `fit-${Date.now()}`,
      handle: input.handle,
      authorName: input.authorName,
      platform: input.platform,
      caption: input.caption,
      image: matchedShoe.image,
      alt: `${matchedShoe.name} styled by ${input.handle}`,
      productId: matchedShoe.id,
      productName: matchedShoe.name,
      likes: 1,
      reposts: 0,
      timestamp: 'Just now',
      likedByMe: true,
    };
    setSocialPosts((prev) => [newPost, ...prev]);
    showToast('Fit check published to Worn on Feed');
  };

  const handleShareProduct = (product: ShoeProduct) => {
    const shareUrl = `${window.location.origin}?drop=${product.id}`;
    setShareTarget({
      title: product.name,
      caption: `Checking out the ${product.name} (${product.viralViews}) on KICKHAUS — settled in USDC/ETH.`,
      tag: product.viralTag,
      url: shareUrl,
    });
  };

  const handleSharePost = (post: SocialFitPost) => {
    const shareUrl = `${window.location.origin}?drop=${post.productId}`;
    setShareTarget({
      title: `Fit check by ${post.handle}`,
      caption: `${post.caption} — wearing ${post.productName}.`,
      tag: '#kickhausfit',
      url: shareUrl,
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#141416] flex flex-col">
      <Header
        cartCount={cartCount}
        onOpenBag={() => setBagOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          featuredProduct={featuredProduct}
          currency={currency}
          rates={rates}
          onInspectProduct={(p) => setActiveProduct(p)}
        />

        <ProductGridSection
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          currency={currency}
          onCurrencyChange={setCurrency}
          rates={rates}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onInspectProduct={(p) => setActiveProduct(p)}
          onQuickAdd={handleQuickAdd}
          wallet={wallet}
          onConnectWallet={handleConnectEvm}
        />

        <SocialLookbookSection
          posts={socialPosts}
          products={SHOE_PRODUCTS}
          onToggleLike={handleTogglePostLike}
          onToggleSavePost={handleTogglePostSave}
          onSharePost={handleSharePost}
          onShopProduct={(productId) => {
            const matched = SHOE_PRODUCTS.find((p) => p.id === productId);
            if (matched) setActiveProduct(matched);
          }}
          onAddPost={handleAddSocialPost}
        />

        <CryptoFooterSection
          rates={rates}
          wallet={wallet}
          onConnectEvm={handleConnectEvm}
          onConnectSolana={handleConnectSolana}
          onOpenOrders={() => setOrdersOpen(true)}
        />
      </main>

      <ProductDetailModal
        product={activeProduct}
        currency={currency}
        rates={rates}
        isSaved={activeProduct ? wishlistIds.includes(activeProduct.id) : false}
        onToggleSave={handleToggleWishlist}
        onClose={() => setActiveProduct(null)}
        onAddToBag={handleAddToBag}
        onShareProduct={handleShareProduct}
      />

      <CartCheckoutDrawer
        open={bagOpen}
        items={cart}
        rates={rates}
        wallet={wallet}
        onClose={() => setBagOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onConnectEvm={handleConnectEvm}
        onConnectSolana={handleConnectSolana}
        onCompleteOrder={handleCompleteOrder}
      />

      <OrdersModal
        open={ordersOpen}
        orders={orders}
        onClose={() => setOrdersOpen(false)}
      />

      <ShareModal target={shareTarget} onClose={() => setShareTarget(null)} />

      {/* Subtle transient feedback toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-[#141416] text-white text-xs font-medium shadow-lg border border-white/10"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

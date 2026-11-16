export type DisplayCurrency = 'USD' | 'USDC' | 'ETH' | 'SOL';

export type CryptoToken = 'USDC' | 'ETH' | 'SOL' | 'MATIC';

export type CryptoNetwork = 'Base' | 'Ethereum' | 'Solana' | 'Polygon';

export type ShoeCategory = 'All' | 'Y2K Mesh' | 'Gorpcore' | 'Skate' | 'Court & Tech' | 'Saved';

export type SocialPlatform = 'TikTok' | 'Instagram' | 'X';

export interface ShoeColorway {
  name: string;
  hex: string;
}

export interface ShoeSizeStock {
  size: string;
  stock: number;
}

export interface ShoeProduct {
  id: string;
  name: string;
  category: Exclude<ShoeCategory, 'All' | 'Saved'>;
  priceUsd: number;
  viralRank: number;
  viralPlatform: SocialPlatform;
  viralTag: string;
  viralViews: string;
  trendDelta: string;
  availability: 'In Stock' | 'Limited Run';
  image: string;
  alt: string;
  description: string;
  materials: string[];
  colorways: ShoeColorway[];
  sizes: ShoeSizeStock[];
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  priceUsd: number;
  size: string;
  colorway: string;
  quantity: number;
}

export interface SocialFitPost {
  id: string;
  handle: string;
  authorName: string;
  platform: SocialPlatform;
  caption: string;
  image: string;
  alt: string;
  productId: string;
  productName: string;
  likes: number;
  reposts: number;
  timestamp: string;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export interface CryptoRates {
  USD: number;
  USDC: number;
  ETH: number;
  SOL: number;
  MATIC: number;
  source: 'live' | 'cached';
  updatedAt: number;
}

export interface WalletState {
  connected: boolean;
  providerName: string;
  address: string;
  network: CryptoNetwork;
  balanceLabel: string;
  isInjected: boolean;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotalUsd: number;
  shippingUsd: number;
  totalUsd: number;
  paymentMethod: 'Crypto' | 'Card';
  cryptoToken?: CryptoToken;
  cryptoAmount?: string;
  network?: CryptoNetwork;
  txHash?: string;
  walletAddress?: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  status: 'Confirmed — Preparing Shipment' | 'On-Chain Verified — Packing';
}

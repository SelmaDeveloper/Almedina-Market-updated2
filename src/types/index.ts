export type UserRole = 'guest' | 'customer' | 'admin';

export type ViewTab = 'storefront' | 'admin_dashboard' | 'design_specs' | 'chapa_gateway_sim';

export type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  avatar: string;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  savedAddresses?: {
    id: string;
    label: string;
    addressText: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
  }[];
}

export type CategoryId =
  | 'dates_sweets'
  | 'dairy_juices'
  | 'rice_grains'
  | 'oils_cooking'
  | 'spices_seasoning'
  | 'canned_pantry'
  | 'beverages_coffee'
  | 'frozen_foods';

export interface Category {
  id: CategoryId;
  name: string;
  arabicName?: string;
  description: string;
  iconName: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  arabicName?: string;
  categoryId: CategoryId;
  priceETB: number;
  unit: string;
  image: string;
  stockCount: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  description: string;
  origin: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isImported: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAtPrice: number;
  isUnavailableInCart?: boolean;
}

export interface NamedShoppingList {
  id: string;
  name: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  createdAt: string;
}

export type FulfillmentType = 'delivery' | 'pickup';

export type PaymentMethod = 'cod' | 'cop' | 'telebirr' | 'cbe_birr';

export type PaymentStatus = 'unpaid' | 'payment_pending' | 'paid' | 'failed';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  priceETB: number;
  quantity: number;
  unit: string;
  subtotalETB: number;
}

export interface DeliveryLocation {
  addressText: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryLocation?: DeliveryLocation;
  subtotalETB: number;
  deliveryFeeETB: number;
  totalETB: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  chapaTxRef?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  notes?: string;
  cancellationReason?: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending_approval' | 'approved' | 'rejected';
}

export interface ReturnReport {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  reason: 'wrong_item' | 'damaged_item' | 'spoiled_item';
  photoUrl: string;
  notes: string;
  createdAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
  adminResolution?: 'refund' | 'replacement' | 'denied';
  adminResponseNotes?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'delivery' | 'payment' | 'products' | 'orders';
}

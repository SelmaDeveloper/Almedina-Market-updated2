import {
  Category,
  Product,
  Order,
  OrderItem,
  Review,
  ReturnReport,
  ContactSubmission,
  FAQItem,
} from '../types';

// ─── Row types from Supabase (snake_case) ───────────────────────────────────

interface CategoryRow {
  id: string;
  name: string;
  arabic_name: string | null;
  description: string;
  icon_name: string;
  image: string;
  sort_order: number;
}

interface ProductRow {
  id: string;
  name: string;
  arabic_name: string | null;
  category_id: string;
  price_etb: number;
  unit: string;
  image: string;
  stock_count: number;
  low_stock_threshold: number;
  is_available: boolean;
  description: string;
  origin: string;
  rating: number;
  review_count: number;
  is_popular: boolean;
  is_imported: boolean;
}

interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: 'delivery' | 'pickup';
  delivery_address_text: string | null;
  delivery_landmark: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_distance_km: number | null;
  subtotal_etb: number;
  delivery_fee_etb: number;
  total_etb: number;
  payment_method: 'cod' | 'cop' | 'telebirr' | 'cbe_birr';
  payment_status: 'unpaid' | 'payment_pending' | 'paid' | 'failed';
  order_status: 'pending' | 'confirmed' | 'out_for_delivery' | 'ready_for_pickup' | 'completed' | 'cancelled';
  chapa_tx_ref: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price_etb: number;
  quantity: number;
  unit: string;
  subtotal_etb: number;
}

interface ReviewRow {
  id: string;
  product_id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
}

interface ReturnReportRow {
  id: string;
  order_id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  reason: 'wrong_item' | 'damaged_item' | 'spoiled_item';
  photo_url: string;
  notes: string;
  status: 'pending_review' | 'approved' | 'rejected';
  admin_resolution: 'refund' | 'replacement' | 'denied' | null;
  admin_response_notes: string | null;
  created_at: string;
}

interface ContactSubmissionRow {
  id: string;
  name: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface FAQRow {
  id: string;
  question: string;
  answer: string;
  category: 'delivery' | 'payment' | 'products' | 'orders';
  sort_order: number;
}

// ─── Row → App object mappers ────────────────────────────────────────────────

export const mapCategory = (r: CategoryRow): Category => ({
  id: r.id as Category['id'],
  name: r.name,
  arabicName: r.arabic_name || undefined,
  description: r.description,
  iconName: r.icon_name,
  image: r.image,
});

export const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  arabicName: r.arabic_name || undefined,
  categoryId: r.category_id as Product['categoryId'],
  priceETB: Number(r.price_etb),
  unit: r.unit,
  image: r.image,
  stockCount: r.stock_count,
  lowStockThreshold: r.low_stock_threshold,
  isAvailable: r.is_available,
  description: r.description,
  origin: r.origin,
  rating: Number(r.rating),
  reviewCount: r.review_count,
  isPopular: r.is_popular,
  isImported: r.is_imported,
});

export const mapOrder = (r: OrderRow, items: OrderItemRow[]): Order => ({
  id: r.id,
  orderNumber: r.order_number,
  userId: r.user_id,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  fulfillmentType: r.fulfillment_type,
  deliveryLocation: r.delivery_address_text
    ? {
        addressText: r.delivery_address_text,
        landmark: r.delivery_landmark || undefined,
        latitude: r.delivery_latitude || 0,
        longitude: r.delivery_longitude || 0,
        distanceKm: r.delivery_distance_km || 0,
      }
    : undefined,
  subtotalETB: Number(r.subtotal_etb),
  deliveryFeeETB: Number(r.delivery_fee_etb),
  totalETB: Number(r.total_etb),
  paymentMethod: r.payment_method,
  paymentStatus: r.payment_status,
  orderStatus: r.order_status,
  chapaTxRef: r.chapa_tx_ref || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  items: items.map(mapOrderItem),
  notes: r.notes || undefined,
  cancellationReason: r.cancellation_reason || undefined,
});

export const mapOrderItem = (r: OrderItemRow): OrderItem => ({
  productId: r.product_id,
  productName: r.product_name,
  priceETB: Number(r.price_etb),
  quantity: r.quantity,
  unit: r.unit,
  subtotalETB: Number(r.subtotal_etb),
});

export const mapReview = (r: ReviewRow): Review => ({
  id: r.id,
  productId: r.product_id,
  orderId: r.order_id,
  userId: r.user_id,
  userName: r.user_name,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.created_at,
  status: r.status,
});

export const mapReturnReport = (r: ReturnReportRow): ReturnReport => ({
  id: r.id,
  orderId: r.order_id,
  orderNumber: r.order_number,
  userId: r.user_id,
  userName: r.user_name,
  userPhone: r.user_phone,
  reason: r.reason,
  photoUrl: r.photo_url,
  notes: r.notes,
  createdAt: r.created_at,
  status: r.status,
  adminResolution: r.admin_resolution || undefined,
  adminResponseNotes: r.admin_response_notes || undefined,
});

export const mapContactSubmission = (r: ContactSubmissionRow): ContactSubmission => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  message: r.message,
  createdAt: r.created_at,
  isRead: r.is_read,
});

export const mapFAQ = (r: FAQRow): FAQItem => ({
  id: r.id,
  question: r.question,
  answer: r.answer,
  category: r.category,
});

// ─── App object → row mappers (for inserts/updates) ──────────────────────────

export const toProductRow = (p: Product): Omit<ProductRow, 'created_at'> => ({
  id: p.id,
  name: p.name,
  arabic_name: p.arabicName || null,
  category_id: p.categoryId,
  price_etb: p.priceETB,
  unit: p.unit,
  image: p.image,
  stock_count: p.stockCount,
  low_stock_threshold: p.lowStockThreshold,
  is_available: p.isAvailable,
  description: p.description,
  origin: p.origin,
  rating: p.rating,
  review_count: p.reviewCount,
  is_popular: p.isPopular,
  is_imported: p.isImported,
});

export const toOrderRow = (o: Order): Omit<OrderRow, 'created_at' | 'updated_at'> => ({
  id: o.id,
  order_number: o.orderNumber,
  user_id: o.userId,
  customer_name: o.customerName,
  customer_phone: o.customerPhone,
  fulfillment_type: o.fulfillmentType,
  delivery_address_text: o.deliveryLocation?.addressText || null,
  delivery_landmark: o.deliveryLocation?.landmark || null,
  delivery_latitude: o.deliveryLocation?.latitude || null,
  delivery_longitude: o.deliveryLocation?.longitude || null,
  delivery_distance_km: o.deliveryLocation?.distanceKm || null,
  subtotal_etb: o.subtotalETB,
  delivery_fee_etb: o.deliveryFeeETB,
  total_etb: o.totalETB,
  payment_method: o.paymentMethod,
  payment_status: o.paymentStatus,
  order_status: o.orderStatus,
  chapa_tx_ref: o.chapaTxRef || null,
  notes: o.notes || null,
  cancellation_reason: o.cancellationReason || null,
});

export const toOrderItemRow = (orderId: string, i: OrderItem) => ({
  order_id: orderId,
  product_id: i.productId,
  product_name: i.productName,
  price_etb: i.priceETB,
  quantity: i.quantity,
  unit: i.unit,
  subtotal_etb: i.subtotalETB,
});

export const toReviewRow = (r: Review): Omit<ReviewRow, 'created_at'> => ({
  id: r.id,
  product_id: r.productId,
  order_id: r.orderId,
  user_id: r.userId,
  user_name: r.userName,
  rating: r.rating,
  comment: r.comment,
  status: r.status,
});

export const toReturnReportRow = (r: ReturnReport): Omit<ReturnReportRow, 'created_at'> => ({
  id: r.id,
  order_id: r.orderId,
  order_number: r.orderNumber,
  user_id: r.userId,
  user_name: r.userName,
  user_phone: r.userPhone,
  reason: r.reason,
  photo_url: r.photoUrl,
  notes: r.notes,
  status: r.status,
  admin_resolution: r.adminResolution || null,
  admin_response_notes: r.adminResponseNotes || null,
});

export const toContactSubmissionRow = (c: ContactSubmission): Omit<ContactSubmissionRow, 'created_at'> => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  message: c.message,
  is_read: c.isRead,
});

export const toFAQRow = (f: FAQItem) => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  category: f.category,
});

import { supabase } from './supabase';
import {
  mapCategory,
  mapProduct,
  mapOrder,
  mapOrderItem,
  mapReview,
  mapReturnReport,
  mapContactSubmission,
  mapFAQ,
} from './supabaseMappers';
import type { OrderItemRow } from './supabaseMappers';
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

export async function fetchAllData(): Promise<{
  categories: Category[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  returnReports: ReturnReport[];
  contactSubmissions: ContactSubmission[];
  faqs: FAQItem[];
}> {
  const [catRes, prodRes, ordRes, itemRes, revRes, retRes, cntRes, faqRes] =
    await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('return_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('faqs').select('*').order('sort_order'),
    ]);

  const categories = (catRes.data || []).map(mapCategory);
  const products = (prodRes.data || []).map(mapProduct);

  const itemsByOrder = (itemRes.data || [] as OrderItemRow[]).reduce<Record<string, OrderItemRow[]>>(
    (acc, row) => {
      (acc[row.order_id] ||= []).push(row);
      return acc;
    },
    {}
  );

  const orders = (ordRes.data || []).map((row) =>
    mapOrder(row, itemsByOrder[row.id] || [])
  );

  const reviews = (revRes.data || []).map(mapReview);
  const returnReports = (retRes.data || []).map(mapReturnReport);
  const contactSubmissions = (cntRes.data || []).map(mapContactSubmission);
  const faqs = (faqRes.data || []).map(mapFAQ);

  return { categories, products, orders, reviews, returnReports, contactSubmissions, faqs };
}

// ─── Single-table writes ─────────────────────────────────────────────────────

export async function insertProductToSupabase(product: Product): Promise<void> {
  const { error } = await supabase.from('products').insert({
    id: product.id,
    name: product.name,
    arabic_name: product.arabicName || null,
    category_id: product.categoryId,
    price_etb: product.priceETB,
    unit: product.unit,
    image: product.image,
    stock_count: product.stockCount,
    low_stock_threshold: product.lowStockThreshold,
    is_available: product.isAvailable,
    description: product.description,
    origin: product.origin,
    rating: product.rating,
    review_count: product.reviewCount,
    is_popular: product.isPopular,
    is_imported: product.isImported,
  });
  if (error) throw error;
}

export async function updateProductInSupabase(id: string, updates: Partial<Product>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.arabicName !== undefined) row.arabic_name = updates.arabicName || null;
  if (updates.categoryId !== undefined) row.category_id = updates.categoryId;
  if (updates.priceETB !== undefined) row.price_etb = updates.priceETB;
  if (updates.unit !== undefined) row.unit = updates.unit;
  if (updates.image !== undefined) row.image = updates.image;
  if (updates.stockCount !== undefined) {
    row.stock_count = updates.stockCount;
    row.is_available = updates.stockCount > 0;
  }
  if (updates.lowStockThreshold !== undefined) row.low_stock_threshold = updates.lowStockThreshold;
  if (updates.isAvailable !== undefined) row.is_available = updates.isAvailable;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.origin !== undefined) row.origin = updates.origin;
  if (updates.rating !== undefined) row.rating = updates.rating;
  if (updates.reviewCount !== undefined) row.review_count = updates.reviewCount;
  if (updates.isPopular !== undefined) row.is_popular = updates.isPopular;
  if (updates.isImported !== undefined) row.is_imported = updates.isImported;

  const { error } = await supabase.from('products').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteProductFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function insertOrderToSupabase(order: Order): Promise<void> {
  const { error: orderError } = await supabase.from('orders').insert({
    id: order.id,
    order_number: order.orderNumber,
    user_id: order.userId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    fulfillment_type: order.fulfillmentType,
    delivery_address_text: order.deliveryLocation?.addressText || null,
    delivery_landmark: order.deliveryLocation?.landmark || null,
    delivery_latitude: order.deliveryLocation?.latitude || null,
    delivery_longitude: order.deliveryLocation?.longitude || null,
    delivery_distance_km: order.deliveryLocation?.distanceKm || null,
    subtotal_etb: order.subtotalETB,
    delivery_fee_etb: order.deliveryFeeETB,
    total_etb: order.totalETB,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    chapa_tx_ref: order.chapaTxRef || null,
    notes: order.notes || null,
    cancellation_reason: order.cancellationReason || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  });
  if (orderError) throw orderError;

  if (order.items.length > 0) {
    const { error: itemError } = await supabase.from('order_items').insert(
      order.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: i.productName,
        price_etb: i.priceETB,
        quantity: i.quantity,
        unit: i.unit,
        subtotal_etb: i.subtotalETB,
      }))
    );
    if (itemError) throw itemError;
  }

  // Decrement stock for each ordered item
  for (const item of order.items) {
    const { error: stockError } = await supabase.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    });
    // Ignore RPC errors — the function may not exist yet
    if (stockError) console.warn('Stock decrement skipped:', stockError.message);
  }
}

export async function updateOrderInSupabase(id: string, updates: Partial<Order>): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.orderStatus !== undefined) row.order_status = updates.orderStatus;
  if (updates.paymentStatus !== undefined) row.payment_status = updates.paymentStatus;
  if (updates.cancellationReason !== undefined) row.cancellation_reason = updates.cancellationReason || null;
  if (updates.notes !== undefined) row.notes = updates.notes || null;

  const { error } = await supabase.from('orders').update(row).eq('id', id);
  if (error) throw error;
}

export async function updateOrderItemsInSupabase(orderId: string, items: Order['items']): Promise<void> {
  // Simple approach: delete existing items, re-insert
  await supabase.from('order_items').delete().eq('order_id', orderId);
  if (items.length > 0) {
    const { error } = await supabase.from('order_items').insert(
      items.map((i) => ({
        order_id: orderId,
        product_id: i.productId,
        product_name: i.productName,
        price_etb: i.priceETB,
        quantity: i.quantity,
        unit: i.unit,
        subtotal_etb: i.subtotalETB,
      }))
    );
    if (error) throw error;
  }

  // Update order totals
  const subtotal = items.reduce((s, i) => s + i.subtotalETB, 0);
  await supabase.from('orders').update({
    subtotal_etb: subtotal,
    updated_at: new Date().toISOString(),
  }).eq('id', orderId);
}

export async function insertReviewToSupabase(review: Review): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    id: review.id,
    product_id: review.productId,
    order_id: review.orderId,
    user_id: review.userId,
    user_name: review.userName,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    created_at: review.createdAt,
  });
  if (error) throw error;
}

export async function updateReviewInSupabase(id: string, status: Review['status']): Promise<void> {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function insertReturnReportToSupabase(report: ReturnReport): Promise<void> {
  const { error } = await supabase.from('return_reports').insert({
    id: report.id,
    order_id: report.orderId,
    order_number: report.orderNumber,
    user_id: report.userId,
    user_name: report.userName,
    user_phone: report.userPhone,
    reason: report.reason,
    photo_url: report.photoUrl,
    notes: report.notes,
    status: report.status,
    created_at: report.createdAt,
  });
  if (error) throw error;
}

export async function updateReturnReportInSupabase(
  id: string,
  status: ReturnReport['status'],
  resolution: ReturnReport['adminResolution'],
  notes?: string
): Promise<void> {
  const { error } = await supabase.from('return_reports').update({
    status,
    admin_resolution: resolution || null,
    admin_response_notes: notes || null,
  }).eq('id', id);
  if (error) throw error;
}

export async function insertContactToSupabase(contact: ContactSubmission): Promise<void> {
  const { error } = await supabase.from('contact_submissions').insert({
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    message: contact.message,
    is_read: contact.isRead,
    created_at: contact.createdAt,
  });
  if (error) throw error;
}

export async function markContactReadInSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function upsertFAQsToSupabase(faqs: FAQItem[]): Promise<void> {
  const { error } = await supabase.from('faqs').upsert(
    faqs.map((f, idx) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      sort_order: idx,
    }))
  );
  if (error) throw error;
}

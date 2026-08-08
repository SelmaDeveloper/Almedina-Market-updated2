import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PaymentStatus, Product } from '../../types';
import { formatETB, formatDate, isSameCalendarDay } from '../../utils/distance';
import { X, PackageCheck, Clock, CircleCheck as CheckCircle2, Circle as XCircle, PhoneCall, RotateCcw, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReturnReport: (order: Order) => void;
  onOpenReviewModal: (product: Product, order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  onOpenReturnReport,
  onOpenReviewModal,
}) => {
  const { orders, products, updateOrderQuantity, cancelOrder, currentUser, confirmOrderViaEmail } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const customerOrders = orders.filter((o) => o.userId === currentUser?.id);

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { label: 'Pending', style: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'confirmed': return { label: 'Confirmed', style: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'out_for_delivery': return { label: 'Out for Delivery', style: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'ready_for_pickup': return { label: 'Ready for Pickup', style: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'completed': return { label: 'Completed', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'cancelled': return { label: 'Cancelled', style: 'bg-rose-100 text-rose-900 border-rose-300' };
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'unpaid': return { label: 'Unpaid', style: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'payment_pending': return { label: 'Payment Pending', style: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'paid': return { label: 'PAID', style: 'bg-emerald-800 text-emerald-100 border-emerald-700 font-bold' };
      case 'failed': return { label: 'Payment Failed', style: 'bg-rose-100 text-rose-900 border-rose-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base">My Order History & Tracking</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {customerOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No orders placed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you place an order, you can track fulfillment timelines here.
              </p>
            </div>
          ) : (
            customerOrders.map((order) => {
              const statusBadge = getOrderStatusBadge(order.orderStatus);
              const payBadge = getPaymentStatusBadge(order.paymentStatus);
              const isExpanded = expandedOrderId === order.id;
              const isEditable = order.orderStatus === 'pending';
              const canReturnReport = order.orderStatus === 'completed' && isSameCalendarDay(order.createdAt);

              return (
                <div key={order.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-4 bg-white cursor-pointer hover:bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.style}`}>{statusBadge.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${payBadge.style}`}>{payBadge.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{formatDate(order.createdAt)} • {order.fulfillmentType.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-extrabold text-sm text-emerald-800">{formatETB(order.totalETB)}</p>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-slate-900 text-white text-xs border-b border-slate-800">
                    <p className="text-[11px] text-slate-400 font-semibold mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span>Fulfillment Status Timeline</span>
                      {order.orderStatus === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmOrderViaEmail(order.id);
                          }}
                          className="flex items-center gap-1 text-[10px] px-3 py-1 rounded border bg-blue-600 hover:bg-blue-700 text-white border-blue-800 shadow-sm"
                        >
                          Simulate Email Confirmation Link
                        </button>
                      )}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                      {[
                        { status: 'pending', label: '1. Pending' },
                        { status: 'confirmed', label: '2. Confirmed' },
                        { status: order.fulfillmentType === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup', label: order.fulfillmentType === 'delivery' ? '3. Out for Delivery' : '3. Ready for Pickup' },
                        { status: 'completed', label: '4. Completed' },
                      ].map((step) => (
                        <div key={step.label} className={`p-2 rounded-lg border ${order.orderStatus === step.status ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          {step.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-4 text-xs">
                      <div className="space-y-2">
                        <p className="font-bold text-slate-800">Purchased Items:</p>
                        {order.items.map((item) => {
                          const prod = products.find((p) => p.id === item.productId);
                          return (
                            <div key={item.productId} className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{item.productName}</p>
                                <p className="text-[11px] text-slate-500">{formatETB(item.priceETB)} per {item.unit}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isEditable ? (
                                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200">
                                    <button onClick={() => updateOrderQuantity(order.id, item.productId, item.quantity - 1)} className="px-1.5 py-0.5 bg-white rounded font-bold text-slate-700 border min-w-[24px]">-</button>
                                    <span className="px-2 font-bold text-slate-900">{item.quantity}</span>
                                    <button onClick={() => updateOrderQuantity(order.id, item.productId, item.quantity + 1)} className="px-1.5 py-0.5 bg-white rounded font-bold text-slate-700 border min-w-[24px]">+</button>
                                  </div>
                                ) : (
                                  <span className="font-bold text-slate-700">Qty: {item.quantity}</span>
                                )}
                                <p className="font-bold text-slate-900">{formatETB(item.subtotalETB)}</p>
                                {order.orderStatus === 'completed' && prod && (
                                  <button
                                    onClick={() => onOpenReviewModal(prod, order)}
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded font-semibold text-[11px] flex items-center gap-1 min-h-[32px]"
                                  >
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span>Review</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {order.deliveryLocation && (
                        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                          <p className="font-bold text-slate-900">Delivery Address:</p>
                          <p>{order.deliveryLocation.addressText}</p>
                          <p className="text-slate-500">Distance: {order.deliveryLocation.distanceKm} km • Fee: {formatETB(order.deliveryFeeETB)}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        {isEditable ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-amber-700 font-medium">You can edit quantities or cancel while Pending.</span>
                            <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs rounded-lg flex items-center gap-1 min-h-[36px]">
                              <XCircle className="w-3.5 h-3.5" />Cancel Order
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Order is confirmed/in fulfillment. Edits are locked.</p>
                        )}
                        {canReturnReport && (
                          <button onClick={() => onOpenReturnReport(order)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 min-h-[36px]">
                            <RotateCcw className="w-3.5 h-3.5" />File Same-Day Return
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

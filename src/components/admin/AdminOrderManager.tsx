import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PaymentStatus, FulfillmentType } from '../../types';
import { formatETB, formatDate } from '../../utils/distance';
import {
  Search,
  Filter,
  PhoneCall,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Truck,
  Store,
  Clock,
  Eye,
  XCircle,
  MapPin,
} from 'lucide-react';

export const AdminOrderManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    verifyChapaPayment,
    recordCashPaymentReceived,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | 'all'>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<FulfillmentType | 'all'>('all');

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    const matchesPayment = filterPayment === 'all' || o.paymentStatus === filterPayment;
    const matchesFulfillment = filterFulfillment === 'all' || o.fulfillmentType === filterFulfillment;

    return matchesSearch && matchesStatus && matchesPayment && matchesFulfillment;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Order Management & Call Confirmation</h2>
        <p className="text-xs text-slate-500">
          Manage orders, verify payments, conduct confirmation calls, and trigger fulfillment stages.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            {/* Fulfillment Filter */}
            <select
              value={filterFulfillment}
              onChange={(e) => setFilterFulfillment(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Fulfillment</option>
              <option value="delivery">Delivery Only</option>
              <option value="pickup">Pickup Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table / Cards View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Order # / Date</th>
                <th className="p-3.5">Customer / Phone</th>
                <th className="p-3.5">Type / Distance</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(order.createdAt)}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <a href={`tel:${order.customerPhone}`} className="text-emerald-700 font-semibold text-[11px] hover:underline">
                        {order.customerPhone}
                      </a>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold uppercase text-[11px] text-slate-800">
                        {order.fulfillmentType}
                      </span>
                      {order.deliveryLocation && (
                        <p className="text-[11px] text-slate-500">{order.deliveryLocation.distanceKm} km away</p>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {formatETB(order.totalETB)}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-800 text-emerald-100 border-emerald-700'
                            : order.paymentStatus === 'payment_pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {order.paymentStatus.toUpperCase()} ({order.paymentMethod.toUpperCase()})
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.orderStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : order.orderStatus === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                      >
                        Details
                      </button>

                      {order.paymentStatus === 'payment_pending' && (
                        <button
                          onClick={() => verifyChapaPayment(order.id)}
                          className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold text-[11px]"
                        >
                          Verify Chapa
                        </button>
                      )}

                      {order.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => recordCashPaymentReceived(order.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px]"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="font-mono font-bold text-slate-900 text-base">
                  {selectedOrderDetails.orderNumber}
                </p>
                <p className="text-[11px] text-slate-500">
                  Last Updated: {formatDate(selectedOrderDetails.updatedAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Customer Name</p>
                <p className="font-bold text-slate-900">{selectedOrderDetails.customerName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Phone Number</p>
                <a href={`tel:${selectedOrderDetails.customerPhone}`} className="font-bold text-emerald-700 hover:underline">
                  {selectedOrderDetails.customerPhone}
                </a>
              </div>
            </div>

            {selectedOrderDetails.deliveryLocation && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Delivery Location
                </p>
                <p>{selectedOrderDetails.deliveryLocation.addressText}</p>
                <p className="text-slate-500">
                  Landmark: {selectedOrderDetails.deliveryLocation.landmark || 'None'} • Distance:{' '}
                  {selectedOrderDetails.deliveryLocation.distanceKm} km
                </p>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Order Items:</p>
              {selectedOrderDetails.items.map((i) => (
                <div key={i.productId} className="flex justify-between border-b border-slate-100 pb-1">
                  <span>
                    {i.productName} ({i.quantity} x {i.unit})
                  </span>
                  <span className="font-bold">{formatETB(i.subtotalETB)}</span>
                </div>
              ))}
            </div>

            {/* Status Workflow Controls */}
            <div className="bg-slate-100 p-3 rounded-xl space-y-2">
              <p className="font-bold text-slate-800">Change Fulfillment Workflow Status:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrderDetails.id, 'confirmed')}
                  className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded text-[11px]"
                >
                  Confirmed
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrderDetails.id, 'out_for_delivery')}
                  className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded text-[11px]"
                >
                  Out for Delivery
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrderDetails.id, 'ready_for_pickup')}
                  className="px-2.5 py-1 bg-cyan-600 text-white font-bold rounded text-[11px]"
                >
                  Ready for Pickup
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrderDetails.id, 'completed')}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                >
                  Completed
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrderDetails.id, 'cancelled')}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded text-[11px]"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

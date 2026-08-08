import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatETB } from '../../utils/distance';
import { DollarSign, PhoneCall, CreditCard, TriangleAlert as AlertTriangle, MessageSquare, RotateCcw, ShoppingBag, CircleCheck as CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewProps {
  onNavigate: (tab: AdminTab) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const {
    orders,
    products,
    reviews,
    returnReports,
    verifyChapaPayment,
    markConfirmationCallCompleted,
    recordCashPaymentReceived,
  } = useApp();

  // Metrics
  const completedOrders = orders.filter((o) => o.orderStatus === 'completed');
  const dailySalesETB = completedOrders.reduce((sum, o) => sum + o.totalETB, 0);

  const pendingCalls = orders.filter((o) => o.confirmationCallRequired && !o.confirmationCallDone);
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'payment_pending');
  const lowStockProducts = products.filter((p) => p.stockCount <= p.lowStockThreshold);
  const pendingReviews = reviews.filter((r) => r.status === 'pending_approval');
  const pendingReturns = returnReports.filter((r) => r.status === 'pending_review');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Almedina Market Operations Dashboard</h2>
        <p className="text-xs text-slate-500">
          Store Owner Overview • Bethel, Addis Ababa
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Daily Sales Card */}
        <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200">Daily Completed Sales</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black">{formatETB(dailySalesETB)}</p>
          <p className="text-[11px] text-emerald-300">{completedOrders.length} Completed Orders Today</p>
        </div>

        {/* Confirmation Calls Card */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-amber-500 text-slate-950 p-5 rounded-2xl shadow-md cursor-pointer hover:bg-amber-400 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Confirmation Calls Needed</span>
            <PhoneCall className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black">{pendingCalls.length} Orders</p>
          <p className="text-[11px] font-medium text-slate-900">Active Call Window: 3:00 AM – 9:00 PM</p>
        </div>

        {/* Chapa Payment Pending Card */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-slate-900 text-white p-5 rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 transition-all space-y-2 border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">Chapa Payment Pending</span>
            <CreditCard className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black">{pendingPayments.length} Transactions</p>
          <p className="text-[11px] text-slate-400">Requires Server Verification</p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold text-slate-800">Low Stock Products</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{lowStockProducts.length} Items</p>
          <p className="text-[11px] text-slate-500">At or below threshold</p>
        </div>

        {/* Pending Reviews Moderation */}
        <div
          onClick={() => onNavigate('reviews')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold text-slate-800">Pending Reviews</span>
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingReviews.length} Submissions</p>
          <p className="text-[11px] text-slate-500">Awaiting owner approval</p>
        </div>

        {/* Return Reports */}
        <div
          onClick={() => onNavigate('returns')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold text-slate-800">Open Return Reports</span>
            <RotateCcw className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingReturns.length} Reports</p>
          <p className="text-[11px] text-slate-500">Photo evidence attached</p>
        </div>
      </div>

      {/* Immediate Next Actions Section for Non-Technical Owner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Urgent Action Queue for Today
          </h3>
          <span className="text-xs text-slate-500">Click button to complete task directly</span>
        </div>

        {pendingCalls.length === 0 && pendingPayments.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl">
            ✓ All customer calls and Chapa payments are up to date!
          </p>
        ) : (
          <div className="space-y-3">
            {/* Orders requiring phone call */}
            {pendingCalls.map((order) => (
              <div
                key={order.id}
                className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900">{order.orderNumber}</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                      Call Customer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Customer: <strong>{order.customerName}</strong> ({order.customerPhone}) •{' '}
                    {formatETB(order.totalETB)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>

                  <button
                    onClick={() => markConfirmationCallCompleted(order.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Confirmed</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Payments requiring manual Chapa verify or Cash record */}
            {pendingPayments.map((order) => (
              <div
                key={order.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900">{order.orderNumber}</span>
                    <span className="bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded font-bold">
                      Payment Pending ({order.paymentMethod.toUpperCase()})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Customer: {order.customerName} • Total: {formatETB(order.totalETB)}
                  </p>
                </div>

                <button
                  onClick={() => verifyChapaPayment(order.id)}
                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Verify Chapa Payment</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

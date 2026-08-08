import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatETB, formatDate } from '../../utils/distance';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminPaymentManager: React.FC = () => {
  const { orders, verifyChapaPayment } = useApp();

  const chapaOrders = orders.filter(
    (o) => o.paymentMethod === 'telebirr' || o.paymentMethod === 'cbe_birr'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Chapa Payment Transactions Log</h2>
        <p className="text-xs text-slate-500">
          Monitor online transactions via Telebirr & CBE Birr. Server-side verification enforces strict accuracy.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Order # / Ref</th>
                <th className="p-3.5">Customer / Phone</th>
                <th className="p-3.5">Gateway / Method</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Server Verification Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chapaOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No online Chapa transactions recorded yet.
                  </td>
                </tr>
              ) : (
                chapaOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                      <p className="text-[10px] font-mono text-emerald-800">{order.chapaTxRef || 'CHP-PENDING'}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-slate-500">{order.customerPhone}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 uppercase">
                        Chapa ({order.paymentMethod})
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {formatETB(order.totalETB)}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-800 text-emerald-100 border-emerald-700'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'SERVER VERIFIED (PAID)' : 'PAYMENT PENDING'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {order.paymentStatus !== 'paid' ? (
                        <button
                          onClick={() => verifyChapaPayment(order.id)}
                          className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg"
                        >
                          Trigger Chapa Verify
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

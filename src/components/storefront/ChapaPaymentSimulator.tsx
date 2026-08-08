import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatETB } from '../../utils/distance';
import { CreditCard, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, ArrowLeft, Lock } from 'lucide-react';
import { BRAND } from '../../constants/brand';

interface ChapaPaymentSimulatorProps {
  order?: Order | null;
}

export const ChapaPaymentSimulator: React.FC<ChapaPaymentSimulatorProps> = () => {
  const {
    pendingChapaOrder,
    simulateChapaPaymentSuccess,
    simulateChapaPaymentFailure,
    setViewTab,
  } = useApp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState<boolean | null>(null);

  if (!pendingChapaOrder) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="font-bold text-lg text-slate-800">No Pending Chapa Payment Session</h2>
        <p className="text-xs text-slate-500">
          Place an order selecting Telebirr or CBE Birr at checkout to launch the Chapa portal.
        </p>
        <button onClick={() => setViewTab('storefront')} className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]">
          Return to Storefront
        </button>
      </div>
    );
  }

  const handleSimulateSuccess = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
      simulateChapaPaymentSuccess(pendingChapaOrder.id);
      setTimeout(() => setViewTab('storefront'), 1500);
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(false);
      simulateChapaPaymentFailure(pendingChapaOrder.id);
      setTimeout(() => setViewTab('storefront'), 1500);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-6 relative animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 -mx-6 -mt-6 p-5 text-white rounded-t-2xl flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 text-xs">
            chapa
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight">Chapa Payment Gateway</h2>
            <p className="text-[10px] text-emerald-200">Simulated Telebirr & CBE Birr Checkout Portal</p>
          </div>
        </div>
        <button onClick={() => setViewTab('storefront')} className="p-1 rounded text-emerald-200 hover:text-white hover:bg-emerald-800">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Transaction Details */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Merchant Name</span>
          <span className="font-bold text-slate-900">{BRAND.name} (Bethel)</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Order Reference</span>
          <span className="font-mono font-bold text-emerald-800">{pendingChapaOrder.orderNumber}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Customer Phone</span>
          <span className="font-bold text-slate-900">{pendingChapaOrder.customerPhone}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Payment Method</span>
          <span className="font-bold text-slate-900 uppercase">{pendingChapaOrder.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-slate-900 text-sm font-extrabold pt-2 border-t border-slate-200">
          <span>Total Payment</span>
          <span className="text-emerald-700">{formatETB(pendingChapaOrder.totalETB)}</span>
        </div>
      </div>

      {isVerifying && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2 animate-pulse">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
          <p className="font-bold text-xs text-amber-900">Payment verification in progress...</p>
          <p className="text-[11px] text-amber-700">Contacting server webhook endpoint. Browser redirect alone is NOT treated as final proof.</p>
        </div>
      )}

      {verificationDone === true && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-sm text-emerald-900">Payment Verified (PAID)</p>
          <p className="text-xs text-emerald-700">Returning to storefront...</p>
        </div>
      )}

      {verificationDone === false && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-center space-y-1">
          <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-bold text-sm text-rose-900">Payment Verification Failed</p>
          <p className="text-xs text-rose-700">Returning to storefront...</p>
        </div>
      )}

      {!isVerifying && verificationDone === null && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500 font-medium text-center">Select callback outcome to test server verification workflow:</p>
          <button onClick={handleSimulateSuccess} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 min-h-[44px]">
            <CheckCircle2 className="w-4 h-4" /><span>Simulate Successful Payment (Server Verified)</span>
          </button>
          <button onClick={handleSimulateFailure} className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 min-h-[44px]">
            <XCircle className="w-4 h-4 text-rose-600" /><span>Simulate Payment Failure / Cancel</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
        <Lock className="w-3 h-3 text-emerald-600" />
        <span>Payment status stays "Pending" until server verification completes.</span>
      </div>
    </div>
  );
};

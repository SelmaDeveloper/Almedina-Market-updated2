import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, ReturnReport } from '../../types';
import { X, Camera, TriangleAlert as AlertTriangle, RotateCcw, CircleCheck as CheckCircle2, FileImage } from 'lucide-react';

interface ReturnReportModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

const SAMPLE_PHOTO_EVIDENCE = [
  {
    label: 'Damaged Seal / Bag Photo',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Expired or Wrong Item Photo',
    url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400',
  },
];

export const ReturnReportModal: React.FC<ReturnReportModalProps> = ({ isOpen, order, onClose }) => {
  const { submitReturnReport } = useApp();

  const [reason, setReason] = useState<ReturnReport['reason']>('damaged_item');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO_EVIDENCE[0].url);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = submitReturnReport({ orderId: order.id, reason, photoUrl, notes });
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in my-4">
        <div className="p-4 bg-amber-900 text-white flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-300" />
            <h2 className="font-bold text-sm">Same-Day Return / Refund Report</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-amber-300 hover:text-white hover:bg-amber-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
            <p className="font-bold text-slate-900">Reporting Order: {order.orderNumber}</p>
            <p className="text-[11px] text-slate-500">Same-day return policy applies to deliveries completed on today's calendar date.</p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">1. Select Return Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value as ReturnReport['reason'])} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="damaged_item">Damaged Item or Torn Packaging</option>
              <option value="wrong_item">Wrong Item Delivered</option>
              <option value="spoiled_item">Spoiled / Quality Defect</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1">
              <Camera className="w-4 h-4 text-emerald-600" />2. Mandatory Photo Evidence
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PHOTO_EVIDENCE.map((sample, idx) => (
                <button type="button" key={idx} onClick={() => setPhotoUrl(sample.url)}
                  className={`p-2 rounded-lg border text-left text-[11px] transition-all flex items-center gap-2 ${photoUrl === sample.url ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{sample.label}</span>
                </button>
              ))}
            </div>
            <input type="text" placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600" />
            {photoUrl && (
              <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img src={photoUrl} alt="Evidence Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-emerald-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">Photo Evidence Attached</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">3. Explanatory Notes</label>
            <textarea rows={3} placeholder="Provide additional details regarding the issue..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl min-h-[44px]">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 min-h-[44px]">
              <CheckCircle2 className="w-4 h-4" /><span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

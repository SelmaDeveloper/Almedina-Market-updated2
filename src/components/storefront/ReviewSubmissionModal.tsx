import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Order } from '../../types';
import { Star, MessageSquare, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, X } from 'lucide-react';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  product: Product | null;
  order?: Order | null;
  onClose: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  product,
  order,
  onClose,
}) => {
  const { orders, submitReview, currentUser } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(order?.id || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const eligibleOrders = orders.filter(
    (o) =>
      o.userId === currentUser?.id &&
      o.orderStatus === 'completed' &&
      o.items.some((i) => i.productId === product.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeOrderId = selectedOrderId || (eligibleOrders.length > 0 ? eligibleOrders[0].id : '');

    if (!activeOrderId) {
      setErrorMessage('Verified purchase required: You must have a completed order containing this product.');
      return;
    }
    if (!comment || comment.trim().length < 5) {
      setErrorMessage('Please write a review comment (minimum 5 characters).');
      return;
    }

    const result = submitReview(product.id, activeOrderId, rating, comment);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in my-4">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm">Submit Verified Purchase Review</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
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

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900 text-sm">{product.name}</p>
            <p className="text-[11px] text-slate-500">{product.unit} • {product.origin}</p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">Verified Completed Order</label>
            {eligibleOrders.length === 0 ? (
              <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px]">
                No completed orders found containing this product. Only verified buyers can submit reviews.
              </p>
            ) : (
              <select
                value={selectedOrderId || eligibleOrders[0].id}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {eligibleOrders.map((o) => (
                  <option key={o.id} value={o.id}>Order {o.orderNumber} (Completed)</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-125">
                  <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">Your Review</label>
            <textarea rows={3} placeholder="Share details regarding quality, freshness, and delivery..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Reviews remain "Pending Approval" until approved by store administration.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl min-h-[44px]">Cancel</button>
            <button
              type="submit"
              disabled={eligibleOrders.length === 0}
              className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 min-h-[44px] ${eligibleOrders.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'}`}
            >
              <CheckCircle2 className="w-4 h-4" /><span>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/distance';

export const AdminReviewModerator: React.FC = () => {
  const { reviews, moderateReview, products } = useApp();

  const pendingReviews = reviews.filter((r) => r.status === 'pending_approval');
  const moderatedReviews = reviews.filter((r) => r.status !== 'pending_approval');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Verified Review Moderation Queue</h2>
        <p className="text-xs text-slate-500">
          Approve or reject customer reviews. Only verified completed purchases are eligible for review submission.
        </p>
      </div>

      {/* Pending Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          Pending Approval Queue ({pendingReviews.length})
        </h3>

        {pendingReviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-50 rounded-xl">
            ✓ Moderation queue is empty. No pending customer reviews!
          </p>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map((rev) => {
              const prod = products.find((p) => p.id === rev.productId);

              return (
                <div
                  key={rev.id}
                  className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rev.userName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                        Verified Purchase ✓
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium">
                      Product: <strong>{prod?.name || rev.productId}</strong>
                    </p>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] text-slate-500 ml-2">
                        Submitted: {formatDate(rev.createdAt)}
                      </span>
                    </div>

                    <p className="text-slate-800 font-normal italic pt-1">"{rev.comment}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => moderateReview(rev.id, 'approved')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Review
                    </button>

                    <button
                      onClick={() => moderateReview(rev.id, 'rejected')}
                      className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previously Moderated Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Moderation History ({moderatedReviews.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
          {moderatedReviews.map((rev) => (
            <div key={rev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{rev.userName} • Rating: {rev.rating}/5</p>
                <p className="text-slate-600 text-[11px]">"{rev.comment}"</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {rev.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

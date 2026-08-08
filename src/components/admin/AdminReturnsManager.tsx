import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReturnReport } from '../../types';
import { formatDate } from '../../utils/distance';
import { RotateCcw, CheckCircle2, XCircle, FileImage, ShieldAlert } from 'lucide-react';

export const AdminReturnsManager: React.FC = () => {
  const { returnReports, resolveReturnReport } = useApp();

  const [inspectingReport, setInspectingReport] = useState<ReturnReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Same-Day Return & Refund Reports</h2>
        <p className="text-xs text-slate-500">
          Inspect photo evidence and grant replacement or refund resolutions for same-day delivery reports.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Report # / Date</th>
                <th className="p-3.5">Customer / Phone</th>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Photo Evidence</th>
                <th className="p-3.5">Resolution Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {returnReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No return or refund reports filed today.
                  </td>
                </tr>
              ) : (
                returnReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      {report.id}
                      <p className="text-[10px] text-slate-500 font-sans font-normal">
                        {formatDate(report.createdAt)}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{report.userName}</p>
                      <p className="text-slate-500">{report.userPhone}</p>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {report.orderNumber}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800 uppercase">
                      {report.reason.replace(/_/g, ' ')}
                    </td>

                    <td className="p-3.5">
                      {report.photoUrl ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <FileImage className="w-4 h-4 text-emerald-600" />
                          Attached ✓
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Missing</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          report.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : report.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {report.adminResolution
                          ? report.adminResolution.toUpperCase()
                          : 'PENDING REVIEW'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setInspectingReport(report);
                          setResolutionNotes('');
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                      >
                        Inspect Proof
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {inspectingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Inspect Photo Evidence & Resolve</h3>
              <button onClick={() => setInspectingReport(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-800">
                Customer: {inspectingReport.userName} ({inspectingReport.userPhone})
              </p>
              <p className="text-slate-600">Order #: {inspectingReport.orderNumber}</p>
              <p className="text-slate-600">Reason: {inspectingReport.reason.replace(/_/g, ' ')}</p>
              <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 italic">
                "{inspectingReport.notes}"
              </p>
            </div>

            {/* Photo Inspection Display */}
            {inspectingReport.photoUrl && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Uploaded Evidence Photo:</p>
                <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-300">
                  <img
                    src={inspectingReport.photoUrl}
                    alt="Uploaded Evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Resolution Notes</label>
              <textarea
                rows={2}
                placeholder="Optional explanation notes for customer..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
              />
            </div>

            {/* Resolution Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  resolveReturnReport(inspectingReport.id, 'refund', resolutionNotes);
                  setInspectingReport(null);
                }}
                className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
              >
                Approve Refund
              </button>

              <button
                onClick={() => {
                  resolveReturnReport(inspectingReport.id, 'replacement', resolutionNotes);
                  setInspectingReport(null);
                }}
                className="py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
              >
                Send Replacement
              </button>

              <button
                onClick={() => {
                  resolveReturnReport(inspectingReport.id, 'denied', resolutionNotes);
                  setInspectingReport(null);
                }}
                className="py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl"
              >
                Deny Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

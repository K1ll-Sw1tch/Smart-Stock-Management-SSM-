import React from 'react';
import { Product } from '../../types/inventory';
import { AlertTriangle, ShieldAlert, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ExpiryAlertModalProps {
  products: Product[];
  onClose: () => void;
  onNavigateToBatches: () => void;
}

export const ExpiryAlertModal: React.FC<ExpiryAlertModalProps> = ({
  products,
  onClose,
  onNavigateToBatches,
}) => {
  const expiredItems = products.filter((p) => p.expiryStatus === 'HAS EXPIRED STOCK');
  const criticalItems = products.filter((p) => p.expiryStatus === 'EXPIRING <30 DAYS');
  const warningItems = products.filter((p) => p.expiryStatus === 'EXPIRING <90 DAYS');

  const totalAlerts = expiredItems.length + criticalItems.length + warningItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-red-500/50 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-950/40 border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-200 font-mono tracking-tight">
                MACRO 5: WORKBOOK_OPEN EXPIRY ALERT
              </h2>
              <p className="text-xs text-red-300/80">Batch Expiry Risk Audit &amp; FEFO Priority Warning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs text-slate-200">
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-red-300">
            <strong>⚠️ Summary of Detected Expiry Risks:</strong>
            <div className="mt-1 flex gap-3 text-[11px]">
              <span className="font-bold text-red-400">• Expired: {expiredItems.length}</span>
              <span className="font-bold text-orange-400">• Critical (&lt;30d): {criticalItems.length}</span>
              <span className="font-bold text-amber-400">• Warning (&lt;90d): {warningItems.length}</span>
            </div>
          </div>

          {/* List of Affected Products */}
          <div className="space-y-2">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Affected Inventory SKUs &amp; Quarantines:
            </div>

            {expiredItems.map((p) => (
              <div
                key={p.sku}
                className="p-3 rounded bg-red-950/30 border border-red-900/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-red-300">
                    [EXPIRED] {p.sku} — {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Earliest Expiry: {p.earliestExpiryDate} ({p.daysToEarliestExpiry} days ago)
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                    Qty: {p.qtyExpiredStillInStock} {p.issueUnit}s
                  </span>
                </div>
              </div>
            ))}

            {criticalItems.map((p) => (
              <div
                key={p.sku}
                className="p-3 rounded bg-orange-950/30 border border-orange-900/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-orange-300">
                    [&lt;30 DAYS] {p.sku} — {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Earliest Expiry: {p.earliestExpiryDate} ({p.daysToEarliestExpiry} days left)
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">
                    Qty: {p.qtyExpiringWithin30Days} {p.issueUnit}s
                  </span>
                </div>
              </div>
            ))}

            {warningItems.map((p) => (
              <div
                key={p.sku}
                className="p-3 rounded bg-amber-950/20 border border-amber-900/40 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-300">
                    [&lt;90 DAYS] {p.sku} — {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Earliest Expiry: {p.earliestExpiryDate} ({p.daysToEarliestExpiry} days left)
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                    Warning
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300 font-sans text-xs">
            💡 <strong>Enforce FEFO issuing immediately:</strong> Dispatch older delivery batches first before newer arrivals to minimize physical losses and write-offs.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors font-mono cursor-pointer"
          >
            Acknowledge &amp; Dismiss
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToBatches();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors font-mono cursor-pointer"
          >
            <span>Review in Batch Tracker (Sheet 5)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

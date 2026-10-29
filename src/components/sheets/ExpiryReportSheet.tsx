import React from 'react';
import { BatchItem } from '../../types/inventory';
import { FileText, Printer, ArrowLeft, AlertTriangle } from 'lucide-react';

interface ExpiryReportSheetProps {
  batches: BatchItem[];
  onBackToBatches: () => void;
}

export const ExpiryReportSheet: React.FC<ExpiryReportSheetProps> = ({
  batches,
  onBackToBatches,
}) => {
  // Batches expiring within 90 days or expired, that still have remaining stock
  const urgentBatches = batches.filter(
    (b) =>
      b.qtyRemaining > 0 &&
      typeof b.daysToExpiry === 'number' &&
      b.daysToExpiry <= 90
  ).sort((a, b) => (a.daysToExpiry as number) - (b.daysToExpiry as number));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToBatches}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Batches</span>
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h1 className="text-sm font-bold text-slate-100 font-mono">
              EXPIRY RISK AUDIT REPORT (FEFO PRIORITY)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Macro 7 Generated
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Canvas */}
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Official Report Title Block */}
          <div className="border-b-2 border-cyan-800 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white print:text-black font-sans">
                  EXPIRY RISK AUDIT REPORT &amp; FEFO DISPATCH SCHEDULE
                </h2>
                <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-1">
                  Scope: Batches Expiring &le;90 Days or Expired with Positive Stock Balance
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600">
                <div>Generated: {new Date().toLocaleDateString()}</div>
                <div>Audit Status: <span className="text-amber-400 font-bold">ACTION REQUIRED</span></div>
              </div>
            </div>
          </div>

          {urgentBatches.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-sm">
              No batches currently found with expiry dates within 90 days.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse border border-slate-800 print:border-gray-400">
                <thead>
                  <tr className="bg-cyan-950/80 print:bg-gray-100 text-slate-300 print:text-black border-b border-slate-700">
                    <th className="p-2.5 text-left border-r border-slate-800 print:border-gray-400">SKU</th>
                    <th className="p-2.5 text-left border-r border-slate-800 print:border-gray-400 font-sans">Product Name</th>
                    <th className="p-2.5 text-left border-r border-slate-800 print:border-gray-400">Batch Number</th>
                    <th className="p-2.5 text-center border-r border-slate-800 print:border-gray-400">Expiry Date</th>
                    <th className="p-2.5 text-right border-r border-slate-800 print:border-gray-400">Days Left</th>
                    <th className="p-2.5 text-right border-r border-slate-800 print:border-gray-400">Qty Remaining</th>
                    <th className="p-2.5 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {urgentBatches.map((b) => {
                    const days = b.daysToExpiry as number;
                    let rowBg = 'bg-slate-900/40 print:bg-white';
                    let statusLabel = 'WARNING (<90d)';
                    let statusBadge = 'bg-amber-400 text-slate-950';

                    if (days < 0) {
                      rowBg = 'bg-red-950/30 print:bg-red-50';
                      statusLabel = 'EXPIRED (WRITE OFF)';
                      statusBadge = 'bg-red-600 text-white font-bold';
                    } else if (days <= 30) {
                      rowBg = 'bg-orange-950/30 print:bg-orange-50';
                      statusLabel = 'CRITICAL (<30d)';
                      statusBadge = 'bg-orange-500 text-white font-bold';
                    }

                    return (
                      <tr key={b.batchNumber} className={`${rowBg} transition-colors`}>
                        <td className="p-2.5 font-bold border-r border-slate-800 print:border-gray-300">{b.sku}</td>
                        <td className="p-2.5 font-sans border-r border-slate-800 print:border-gray-300">{b.productName}</td>
                        <td className="p-2.5 text-amber-300 print:text-black font-bold border-r border-slate-800 print:border-gray-300">
                          {b.batchNumber}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-800 print:border-gray-300">{b.expiryDate}</td>
                        <td className="p-2.5 text-right font-bold border-r border-slate-800 print:border-gray-300">
                          <span className={days < 0 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-amber-400'}>
                            {days}d
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-100 print:text-black border-r border-slate-800 print:border-gray-300">
                          {b.qtyRemaining} units
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${statusBadge}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Directives */}
          <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-800 print:border-gray-400 text-xs space-y-2">
            <div className="font-bold text-slate-200 print:text-black flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Warehouse Storekeeper Action Directives:</span>
            </div>
            <ul className="list-disc list-inside text-slate-400 print:text-gray-700 space-y-1 font-sans">
              <li>Expired items (<span className="text-red-400 font-semibold font-mono">Days &lt; 0</span>) must be quarantined immediately to prevent wrongful issuing and written off via Sheet 4 (Stock Adjustments).</li>
              <li>Batches with &lt;30 days remaining must be prioritized on all incoming department requisitions via <span className="text-emerald-400 font-semibold">Macro 6 AutoAssignFEFOBatch</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

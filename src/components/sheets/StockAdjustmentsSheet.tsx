import React, { useState } from 'react';
import { StockAdjustment } from '../../types/inventory';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface StockAdjustmentsSheetProps {
  adjustments: StockAdjustment[];
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenNewAdjustment: () => void;
  onEditAdjustment: (adj: StockAdjustment) => void;
  onDeleteAdjustment: (adjustmentNumber: string) => void;
}

export const StockAdjustmentsSheet: React.FC<StockAdjustmentsSheetProps> = ({
  adjustments,
  showFormulas,
  onSelectCell,
  onOpenNewAdjustment,
  onEditAdjustment,
  onDeleteAdjustment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteAdjNum, setConfirmDeleteAdjNum] = useState<string | null>(null);

  const filtered = adjustments.filter(
    (a) =>
      a.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.adjustmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.approvedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Adjustment #, SKU, Reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 font-mono text-xs"
            />
          </div>

          <button
            onClick={onOpenNewAdjustment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Physical Adjustment</span>
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {adjustments.length} Adjustments | Net Adjustments flow to Master List (Col N)
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[1400px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[140px]">A: Adjustment Number [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[100px]">B: Date</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[90px]">C: SKU</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[180px]">D: Product Name [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[140px]">E: Adjustment Type</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px]">F: System Qty [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px] text-sky-300 font-bold">
                G: Actual/Adjusted Qty
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] font-bold">
                H: Variance [fx = G-F]
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[200px]">I: Reason</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">J: Approved By</th>
              <th className="px-3 py-2 text-center min-w-[120px] sticky right-0 bg-slate-950 z-10 border-l border-slate-800">
                Row Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((a, idx) => {
              const rowNum = idx + 2;

              const formulaA = `="ADJ-"&TEXT(YEAR(B${rowNum}),"0000")&"-"&TEXT(${rowNum}-1,"0000")`;
              const formulaD = `=IFERROR(VLOOKUP(C${rowNum},'Master List'!A:B,2,FALSE),"")`;
              const formulaF = `=IFERROR(VLOOKUP(C${rowNum},'Master List'!A:O,15,FALSE),0)`;
              const formulaH = `=G${rowNum}-F${rowNum}`;

              const isNegative = a.variance < 0;
              const isPositive = a.variance > 0;

              return (
                <tr key={a.adjustmentNumber + idx} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    {rowNum}
                  </td>

                  {/* A: Adjustment Number [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Stock Adjustments', formulaA, a.adjustmentNumber, true)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-amber-400 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaA : a.adjustmentNumber}
                  </td>

                  {/* B: Date */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Stock Adjustments', '', a.date, false)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {a.date}
                  </td>

                  {/* C: SKU */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Stock Adjustments', '', a.sku, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {a.sku}
                  </td>

                  {/* D: Product Name [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Stock Adjustments', formulaD, a.productName, true)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaD : a.productName}
                  </td>

                  {/* E: Adjustment Type */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Stock Adjustments', '', a.adjustmentType, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                      {a.adjustmentType}
                    </span>
                  </td>

                  {/* F: System Qty [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`F${rowNum}`, 'Stock Adjustments', formulaF, String(a.systemQty), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaF : a.systemQty}
                  </td>

                  {/* G: Actual Qty */}
                  <td
                    onClick={() => onSelectCell(`G${rowNum}`, 'Stock Adjustments', '', String(a.actualQty), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-sky-300 font-bold cursor-pointer hover:bg-slate-700/50"
                  >
                    {a.actualQty}
                  </td>

                  {/* H: Variance [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`H${rowNum}`, 'Stock Adjustments', formulaH, String(a.variance), true)}
                    className={`px-3 py-2 border-r border-slate-800 text-right font-bold cursor-pointer hover:bg-slate-700/50 ${
                      isNegative ? 'text-red-400 bg-red-950/20' : isPositive ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-300'
                    }`}
                  >
                    {showFormulas ? formulaH : isPositive ? `+${a.variance}` : a.variance}
                  </td>

                  {/* I: Reason */}
                  <td
                    onClick={() => onSelectCell(`I${rowNum}`, 'Stock Adjustments', '', a.reason, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {a.reason}
                  </td>

                  {/* J: Approved By */}
                  <td
                    onClick={() => onSelectCell(`J${rowNum}`, 'Stock Adjustments', '', a.approvedBy, false)}
                    className="px-3 py-2 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50 border-r border-slate-800"
                  >
                    {a.approvedBy}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditAdjustment(a)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit Adjustment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteAdjNum === a.adjustmentNumber ? (
                        <div className="inline-flex items-center gap-1 bg-red-950 p-1 rounded border border-red-800 text-[10px]">
                          <span className="text-red-300 font-mono">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteAdjustment(a.adjustmentNumber);
                              setConfirmDeleteAdjNum(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteAdjNum(null)}
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteAdjNum(a.adjustmentNumber)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Adjustment Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StockReceipt } from '../../types/inventory';
import { Search, Lock, Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface StockReceivedSheetProps {
  receipts: StockReceipt[];
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenNewReceipt: () => void;
  onEditReceipt: (receipt: StockReceipt) => void;
  onDeleteReceipt: (grnNumber: string) => void;
  onOpenProductSpecs?: () => void;
  isAdmin?: boolean;
}

export const StockReceivedSheet: React.FC<StockReceivedSheetProps> = ({
  receipts,
  showFormulas,
  onSelectCell,
  onOpenNewReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onOpenProductSpecs,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteGrn, setConfirmDeleteGrn] = useState<string | null>(null);

  const filtered = receipts.filter(
    (r) =>
      r.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoicePoRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search GRN, Supplier, SKU, PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 font-mono text-xs"
            />
          </div>

          <button
            onClick={onOpenNewReceipt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Receive Bulk Goods (GRN)</span>
          </button>

          {onOpenProductSpecs && (
            <button
              onClick={onOpenProductSpecs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
              title="View and configure catalog reorder thresholds and packaging costs"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Product Specs &amp; Reorder Levels</span>
              {isAdmin && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Admin
                </span>
              )}
            </button>
          )}
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {receipts.length} Goods Received Notes (GRN) | Currency: <strong className="text-emerald-400">GH₵</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[2000px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">A: GRN Number [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[100px]">B: Date Received</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[160px]">C: Supplier</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[90px]">D: SKU</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[170px]">E: Product Name [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[110px]">F: Purchase Unit [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] bg-sky-950/20 text-sky-300 font-semibold">
                G: Qty Received (Bulk)
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[150px] bg-emerald-950/30 text-emerald-300 font-bold">
                H: Qty in Issue Units [fx - Conversion]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px]">I: Unit Cost (GH₵) [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] text-slate-200">J: Total Cost (GH₵) [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[110px]">K: Invoice/PO Ref</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[120px]">L: Received By</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[150px]">M: Remarks</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px] font-mono text-amber-300">
                N: Batch Number [fx]
              </th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[110px]">O: Expiry Date</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[100px]">P: Days to Expiry [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[150px]">Q: Batch Expiry Status [fx]</th>
              <th className="px-3 py-2 text-center min-w-[120px] sticky right-0 bg-slate-950 z-10 border-l border-slate-800">
                Row Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((r, idx) => {
              const rowNum = idx + 2;

              const formulaA = `="GRN-"&TEXT(YEAR(B${rowNum}),"0000")&"-"&TEXT(${rowNum}-1,"0000")`;
              const formulaE = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:B,2,FALSE),"")`;
              const formulaF = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:D,4,FALSE),"")`;
              const formulaH = `=IFERROR(G${rowNum}*VLOOKUP(D${rowNum},'Master List'!A:E,5,FALSE),0)`;
              const formulaI = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:I,9,FALSE),0)`;
              const formulaJ = `=G${rowNum}*I${rowNum}`;
              const formulaN = `=IF(O${rowNum}="","N/A","BAT-"&TEXT(YEAR(B${rowNum}),"0000")&"-"&TEXT(${rowNum}-1,"000"))`;
              const formulaP = `=IF(O${rowNum}="","N/A",O${rowNum}-TODAY())`;
              const formulaQ = `=IF(O${rowNum}="","NO EXPIRY",IF(P${rowNum}<0,"EXPIRED",IF(P${rowNum}<=30,"CRITICAL (<30 days)",IF(P${rowNum}<=90,"WARNING (<90 days)","OK"))))`;

              let qPill = 'bg-slate-800 text-slate-400';
              if (r.batchExpiryStatus === 'EXPIRED') {
                qPill = 'bg-red-600 text-white font-bold px-2 py-0.5 shadow-xs';
              } else if (r.batchExpiryStatus === 'CRITICAL (<30 days)') {
                qPill = 'bg-orange-500 text-white font-bold px-2 py-0.5 shadow-xs';
              } else if (r.batchExpiryStatus === 'WARNING (<90 days)') {
                qPill = 'bg-amber-400 text-slate-950 font-bold px-2 py-0.5 shadow-xs';
              } else if (r.batchExpiryStatus === 'OK') {
                qPill = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
              }

              return (
                <tr
                  key={r.grnNumber + idx}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    r.isLocked ? 'bg-slate-950/60 text-slate-400 italic' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    <div className="flex items-center justify-center gap-1">
                      {r.isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                      <span>{rowNum}</span>
                    </div>
                  </td>

                  {/* A: GRN */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Stock Received', formulaA, r.grnNumber, true)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-emerald-400 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaA : r.grnNumber}
                  </td>

                  {/* B: Date Received */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Stock Received', '', r.dateReceived, false)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {r.dateReceived}
                  </td>

                  {/* C: Supplier */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Stock Received', '', r.supplier, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50 truncate max-w-[160px]"
                  >
                    {r.supplier}
                  </td>

                  {/* D: SKU */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Stock Received', '', r.sku, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {r.sku}
                  </td>

                  {/* E: Product Name [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Stock Received', formulaE, r.productName, true)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaE : r.productName}
                  </td>

                  {/* F: Purchase Unit [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`F${rowNum}`, 'Stock Received', formulaF, r.purchaseUnit, true)}
                    className="px-3 py-2 border-r border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaF : r.purchaseUnit}
                  </td>

                  {/* G: Qty Received (Bulk) */}
                  <td
                    onClick={() => onSelectCell(`G${rowNum}`, 'Stock Received', '', String(r.qtyReceivedPurchase), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-sky-300 font-bold cursor-pointer hover:bg-slate-700/50 bg-sky-950/20"
                  >
                    {r.qtyReceivedPurchase} {r.purchaseUnit}(s)
                  </td>

                  {/* H: Qty in Issue Units [KEY CONVERSION FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`H${rowNum}`, 'Stock Received', formulaH, String(r.qtyInIssueUnits), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-emerald-300 font-bold bg-emerald-950/30 cursor-pointer hover:bg-emerald-950/50"
                  >
                    {showFormulas ? formulaH : `${r.qtyInIssueUnits.toLocaleString()} units`}
                  </td>

                  {/* I: Unit Cost (Bulk) [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`I${rowNum}`, 'Stock Received', formulaI, formatCedis(r.unitCostPurchase), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaI : formatCedis(r.unitCostPurchase)}
                  </td>

                  {/* J: Total Cost [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`J${rowNum}`, 'Stock Received', formulaJ, formatCedis(r.totalCost), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-100 font-semibold cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaJ : formatCedis(r.totalCost)}
                  </td>

                  {/* K: PO / Invoice */}
                  <td
                    onClick={() => onSelectCell(`K${rowNum}`, 'Stock Received', '', r.invoicePoRef, false)}
                    className="px-3 py-2 border-r border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {r.invoicePoRef}
                  </td>

                  {/* L: Received By */}
                  <td
                    onClick={() => onSelectCell(`L${rowNum}`, 'Stock Received', '', r.receivedBy, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {r.receivedBy}
                  </td>

                  {/* M: Remarks */}
                  <td
                    onClick={() => onSelectCell(`M${rowNum}`, 'Stock Received', '', r.remarks, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-400 cursor-pointer hover:bg-slate-700/50 truncate max-w-[150px]"
                  >
                    {r.remarks || '—'}
                  </td>

                  {/* N: Batch Number [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`N${rowNum}`, 'Stock Received', formulaN, r.batchNumber, true)}
                    className="px-3 py-2 border-r border-slate-800 font-mono text-amber-300 font-medium cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaN : r.batchNumber}
                  </td>

                  {/* O: Expiry Date */}
                  <td
                    onClick={() => onSelectCell(`O${rowNum}`, 'Stock Received', '', r.expiryDate || 'N/A', false)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {r.expiryDate || '—'}
                  </td>

                  {/* P: Days to Expiry [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`P${rowNum}`, 'Stock Received', formulaP, String(r.daysToExpiry), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaP
                    ) : typeof r.daysToExpiry === 'number' ? (
                      <span className={r.daysToExpiry < 0 ? 'text-red-400 font-bold' : r.daysToExpiry <= 30 ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {r.daysToExpiry}d
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* Q: Batch Expiry Status [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`Q${rowNum}`, 'Stock Received', formulaQ, r.batchExpiryStatus, true)}
                    className="px-3 py-2 text-center cursor-pointer hover:bg-slate-700/50 border-r border-slate-800"
                  >
                    {showFormulas ? formulaQ : <span className={`inline-block rounded ${qPill}`}>{r.batchExpiryStatus}</span>}
                  </td>

                  {/* Row Operations (Available to ANY user) */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditReceipt(r)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit GRN Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteGrn === r.grnNumber ? (
                        <div className="inline-flex items-center gap-1 bg-red-950 p-1 rounded border border-red-800 text-[10px]">
                          <span className="text-red-300 font-mono">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteReceipt(r.grnNumber);
                              setConfirmDeleteGrn(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteGrn(null)}
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteGrn(r.grnNumber)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Receipt Note"
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

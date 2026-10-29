import React, { useState } from 'react';
import { BatchItem } from '../../types/inventory';
import { Search, Hourglass, ShieldAlert, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface BatchTrackerSheetProps {
  batches: BatchItem[];
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenAuditReport: () => void;
}

export const BatchTrackerSheet: React.FC<BatchTrackerSheetProps> = ({
  batches,
  showFormulas,
  onSelectCell,
  onOpenAuditReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.grnReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.batchStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Batch #, SKU, GRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Batch Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Batches</option>
              <option value="CRITICAL">Critical (&lt;30 days)</option>
              <option value="EXPIRED">Expired Stock</option>
              <option value="WARNING">Warning (&lt;90 days)</option>
              <option value="OK">OK</option>
              <option value="DEPLETED">Depleted (0 remaining)</option>
            </select>
          </div>

          <button
            onClick={onOpenAuditReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Generate Expiry Audit Report</span>
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {batches.length} Delivery Batches | FEFO Queue Rank (Col L: 1 = Earliest Expiry)
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[1600px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[140px] font-mono text-amber-300">
                A: Batch Number
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[90px]">B: SKU</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[180px]">C: Product Name [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">D: GRN Reference</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[110px]">E: Date Received</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[110px] font-bold text-amber-300">
                F: Expiry Date
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[140px]">
                G: Qty Received (Issue Units)
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[140px]">
                H: Qty Issued From Batch [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[140px] font-bold text-slate-100 bg-slate-900/80">
                I: Qty Remaining [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px]">J: Days to Expiry [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[140px]">K: Batch Status [fx]</th>
              <th className="px-3 py-2 text-center min-w-[130px] font-mono text-emerald-400">
                L: FEFO Priority [fx]
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((b, idx) => {
              const rowNum = idx + 2;

              const formulaC = `=IFERROR(VLOOKUP(B${rowNum},'Master List'!A:B,2,FALSE),"")`;
              const formulaH = `=SUMIFS('Stock Issued'!H:H,'Stock Issued'!Q:Q,A${rowNum})`;
              const formulaI = `=MAX(0,G${rowNum}-H${rowNum})`;
              const formulaJ = `=IF(F${rowNum}="","N/A",F${rowNum}-TODAY())`;
              const formulaK = `=IF(I${rowNum}=0,"DEPLETED",IF(F${rowNum}="","NO EXPIRY",IF(J${rowNum}<0,"EXPIRED",IF(J${rowNum}<=30,"CRITICAL",IF(J${rowNum}<=90,"WARNING","OK")))))`;
              const formulaL = `=IF(OR(I${rowNum}=0,K${rowNum}="DEPLETED"),99999,IF(F${rowNum}="",99998,RANK.EQ(F${rowNum},$F$2:$F$500,1)))`;

              // Conditional formatting on Col K:
              let kStyle = 'bg-slate-800 text-slate-400';
              if (b.batchStatus === 'EXPIRED') {
                kStyle = 'bg-red-600 text-white font-bold px-2 py-0.5 shadow-sm';
              } else if (b.batchStatus === 'CRITICAL') {
                kStyle = 'bg-orange-500 text-white font-bold px-2 py-0.5 shadow-sm';
              } else if (b.batchStatus === 'WARNING') {
                kStyle = 'bg-amber-400 text-slate-950 font-bold px-2 py-0.5 shadow-sm';
              } else if (b.batchStatus === 'OK') {
                kStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
              } else if (b.batchStatus === 'DEPLETED') {
                kStyle = 'bg-slate-800 text-slate-500 line-through';
              }

              const isDepleted = b.batchStatus === 'DEPLETED';

              return (
                <tr
                  key={b.batchNumber + idx}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    isDepleted ? 'opacity-60 bg-slate-950/40' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    {rowNum}
                  </td>

                  {/* A: Batch Number */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Batch Tracker', '', b.batchNumber, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-amber-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.batchNumber}
                  </td>

                  {/* B: SKU */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Batch Tracker', '', b.sku, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.sku}
                  </td>

                  {/* C: Product Name [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Batch Tracker', formulaC, b.productName, true)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaC : b.productName}
                  </td>

                  {/* D: GRN Reference */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Batch Tracker', '', b.grnReference, false)}
                    className="px-3 py-2 border-r border-slate-800 text-emerald-400 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.grnReference}
                  </td>

                  {/* E: Date Received */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Batch Tracker', '', b.dateReceived, false)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.dateReceived}
                  </td>

                  {/* F: Expiry Date */}
                  <td
                    onClick={() => onSelectCell(`F${rowNum}`, 'Batch Tracker', '', b.expiryDate || 'N/A', false)}
                    className="px-3 py-2 border-r border-slate-800 text-center font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.expiryDate || '—'}
                  </td>

                  {/* G: Qty Received (Issue Units) */}
                  <td
                    onClick={() => onSelectCell(`G${rowNum}`, 'Batch Tracker', '', String(b.qtyReceived), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {b.qtyReceived.toLocaleString()}
                  </td>

                  {/* H: Qty Issued From Batch [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`H${rowNum}`, 'Batch Tracker', formulaH, String(b.qtyIssuedFromBatch), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaH : b.qtyIssuedFromBatch.toLocaleString()}
                  </td>

                  {/* I: Qty Remaining [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`I${rowNum}`, 'Batch Tracker', formulaI, String(b.qtyRemaining), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right font-bold text-slate-100 bg-slate-900/60 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaI : b.qtyRemaining.toLocaleString()}
                  </td>

                  {/* J: Days to Expiry [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`J${rowNum}`, 'Batch Tracker', formulaJ, String(b.daysToExpiry), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaJ
                    ) : typeof b.daysToExpiry === 'number' ? (
                      <span className={b.daysToExpiry < 0 ? 'text-red-400 font-bold' : b.daysToExpiry <= 30 ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {b.daysToExpiry}d
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* K: Batch Status [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`K${rowNum}`, 'Batch Tracker', formulaK, b.batchStatus, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaK : <span className={`inline-block rounded ${kStyle}`}>{b.batchStatus}</span>}
                  </td>

                  {/* L: FEFO Priority [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`L${rowNum}`, 'Batch Tracker', formulaL, String(b.fefoPriority), true)}
                    className="px-3 py-2 text-center font-mono cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaL
                    ) : b.fefoPriority === 1 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        Rank #1 (FEFO)
                      </span>
                    ) : b.fefoPriority < 99990 ? (
                      <span className="text-slate-300">Rank #{b.fefoPriority}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
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

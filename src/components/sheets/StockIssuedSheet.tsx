import React, { useState } from 'react';
import { StockIssue } from '../../types/inventory';
import { Search, Printer, Sparkles, AlertCircle, Lock, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface StockIssuedSheetProps {
  issues: StockIssue[];
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onPrintVoucher: (issue: StockIssue) => void;
  onAutoAssignFEFO: (issueNumber: string) => void;
  onOpenNewIssue: () => void;
  onEditIssue: (issue: StockIssue) => void;
  onDeleteIssue: (issueNumber: string) => void;
}

export const StockIssuedSheet: React.FC<StockIssuedSheetProps> = ({
  issues,
  showFormulas,
  onSelectCell,
  onPrintVoucher,
  onAutoAssignFEFO,
  onOpenNewIssue,
  onEditIssue,
  onDeleteIssue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fefoFilter, setFefoFilter] = useState('ALL');
  const [confirmDeleteIssueNum, setConfirmDeleteIssueNum] = useState<string | null>(null);

  const filtered = issues.filter((i) => {
    const matchesSearch =
      i.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.issuedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.issueFromBatch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFefo =
      fefoFilter === 'ALL' ||
      (fefoFilter === 'CORRECT' && i.fefoCheck === 'CORRECT (FEFO)') ||
      (fefoFilter === 'OLDER' && i.fefoCheck === 'USE OLDER BATCH FIRST') ||
      (fefoFilter === 'EXCEEDS' && i.stockCheck === 'EXCEEDS STOCK');

    return matchesSearch && matchesFefo;
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
              placeholder="Search Issue #, Dept, SKU, Batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">FEFO Status:</span>
            <select
              value={fefoFilter}
              onChange={(e) => setFefoFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Requisitions</option>
              <option value="CORRECT">Correct FEFO</option>
              <option value="OLDER">Needs Older Batch First (Warning)</option>
              <option value="EXCEEDS">Exceeds Stock (Deficit)</option>
            </select>
          </div>

          <button
            onClick={onOpenNewIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Stock (Dual-Unit)</span>
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {issues.length} Issues | Currency: <strong className="text-emerald-400">GH₵</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[2250px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">A: Issue Number [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[100px]">B: Date Issued</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">C: Department</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[90px]">D: SKU</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[170px]">E: Product Name [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[100px]">F: Issue Unit [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[120px] bg-slate-900/40">Mode (Unit Type)</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[100px]">G: Qty Requested</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[130px] font-bold text-slate-100 bg-slate-900/60">
                H: Qty Issued (Units)
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[130px]">I: Stock Before [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[130px]">J: Balance After [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px]">K: Cost/Unit (GH₵) [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px]">L: Total Cost (GH₵) [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[120px]">M: Issued By</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[120px]">N: Authorized By</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[130px]">O: Stock Check [fx]</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[150px]">P: Remarks</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[140px] font-mono text-amber-300">
                Q: Issue From Batch
              </th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[120px]">R: Batch Expiry [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[170px] bg-slate-950 font-semibold">
                S: FEFO Check [fx]
              </th>
              <th className="px-3 py-2 text-center min-w-[180px] sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                Row Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((i, idx) => {
              const rowNum = idx + 2;

              const formulaA = `="ISS-"&TEXT(YEAR(B${rowNum}),"0000")&"-"&TEXT(${rowNum}-1,"0000")`;
              const formulaE = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:B,2,FALSE),"")`;
              const formulaF = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:F,6,FALSE),"")`;
              const formulaI = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:O,15,FALSE),"N/A")`;
              const formulaJ = `=IF(ISNUMBER(I${rowNum}),I${rowNum}-H${rowNum},"N/A")`;
              const formulaK = `=IFERROR(VLOOKUP(D${rowNum},'Master List'!A:J,10,FALSE),0)`;
              const formulaL = `=H${rowNum}*K${rowNum}`;
              const formulaO = `=IF(H${rowNum}>VLOOKUP(D${rowNum},'Master List'!A:O,15,FALSE),"EXCEEDS STOCK","OK")`;
              const formulaR = `=IF(Q${rowNum}="N/A","N/A",IFERROR(VLOOKUP(Q${rowNum},'Batch Tracker'!A:F,6,FALSE),""))`;
              const formulaS = `=IF(Q${rowNum}="N/A","N/A",IFERROR(IF(Q${rowNum}=INDEX('Batch Tracker'!A:A,MATCH(MINIFS('Batch Tracker'!F:F,'Batch Tracker'!B:B,D${rowNum},'Batch Tracker'!I:I,">0"),'Batch Tracker'!F:F,0)),"CORRECT (FEFO)","USE OLDER BATCH FIRST"),"N/A"))`;

              const isExceed = i.stockCheck === 'EXCEEDS STOCK';
              const oPill = isExceed
                ? 'bg-red-600 text-white font-bold px-2 py-0.5 rounded shadow-xs'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded px-2 py-0.5';

              let sPill = 'text-slate-400';
              if (i.fefoCheck === 'CORRECT (FEFO)') {
                sPill = 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 rounded px-2 py-0.5 font-bold';
              } else if (i.fefoCheck === 'USE OLDER BATCH FIRST') {
                sPill = 'bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded shadow-xs animate-pulse';
              }

              return (
                <tr
                  key={i.issueNumber + idx}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    i.isLocked ? 'bg-slate-950/60 text-slate-400 italic' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    <div className="flex items-center justify-center gap-1">
                      {i.isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                      <span>{rowNum}</span>
                    </div>
                  </td>

                  {/* A: Issue Number [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Stock Issued', formulaA, i.issueNumber, true)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-sky-400 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaA : i.issueNumber}
                  </td>

                  {/* B: Date Issued */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Stock Issued', '', i.dateIssued, false)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.dateIssued}
                  </td>

                  {/* C: Department */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Stock Issued', '', i.department, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.department}
                  </td>

                  {/* D: SKU */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Stock Issued', '', i.sku, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.sku}
                  </td>

                  {/* E: Product Name [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Stock Issued', formulaE, i.productName, true)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaE : i.productName}
                  </td>

                  {/* F: Issue Unit [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`F${rowNum}`, 'Stock Issued', formulaF, i.issueUnit, true)}
                    className="px-3 py-2 border-r border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaF : i.issueUnit}
                  </td>

                  {/* Mode: BULK vs INDIVIDUAL */}
                  <td className="px-3 py-2 border-r border-slate-800 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        i.issuedUnitType === 'BULK'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {i.issuedUnitType === 'BULK' ? `BULK (${i.bulkQuantityInput}pk)` : 'INDIVIDUAL'}
                    </span>
                  </td>

                  {/* G: Qty Requested */}
                  <td
                    onClick={() => onSelectCell(`G${rowNum}`, 'Stock Issued', '', String(i.qtyRequested), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.qtyRequested}
                  </td>

                  {/* H: Qty Issued (Issue Units) */}
                  <td
                    onClick={() => onSelectCell(`H${rowNum}`, 'Stock Issued', '', String(i.qtyIssued), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right font-bold text-slate-100 bg-slate-900/60 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.qtyIssued} {i.issueUnit}s
                  </td>

                  {/* I: Available Stock Before [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`I${rowNum}`, 'Stock Issued', formulaI, String(i.availableStockBefore), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaI : i.availableStockBefore.toLocaleString()}
                  </td>

                  {/* J: Balance After [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`J${rowNum}`, 'Stock Issued', formulaJ, String(i.balanceAfter), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaJ : i.balanceAfter.toLocaleString()}
                  </td>

                  {/* K: Cost Per Issue Unit [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`K${rowNum}`, 'Stock Issued', formulaK, formatCedis(i.costPerIssueUnit), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaK : formatCedis(i.costPerIssueUnit)}
                  </td>

                  {/* L: Total Issue Cost [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`L${rowNum}`, 'Stock Issued', formulaL, formatCedis(i.totalIssueCost), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-100 font-semibold cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaL : formatCedis(i.totalIssueCost)}
                  </td>

                  {/* M: Issued By */}
                  <td
                    onClick={() => onSelectCell(`M${rowNum}`, 'Stock Issued', '', i.issuedBy, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.issuedBy}
                  </td>

                  {/* N: Authorized By */}
                  <td
                    onClick={() => onSelectCell(`N${rowNum}`, 'Stock Issued', '', i.authorizedBy, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.authorizedBy}
                  </td>

                  {/* O: Stock Check [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`O${rowNum}`, 'Stock Issued', formulaO, i.stockCheck, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaO : <span className={oPill}>{i.stockCheck}</span>}
                  </td>

                  {/* P: Remarks */}
                  <td
                    onClick={() => onSelectCell(`P${rowNum}`, 'Stock Issued', '', i.remarks, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-400 cursor-pointer hover:bg-slate-700/50 truncate max-w-[150px]"
                  >
                    {i.remarks}
                  </td>

                  {/* Q: Issue From Batch */}
                  <td
                    onClick={() => onSelectCell(`Q${rowNum}`, 'Stock Issued', '', i.issueFromBatch, false)}
                    className="px-3 py-2 border-r border-slate-800 font-mono text-amber-300 font-bold cursor-pointer hover:bg-slate-700/50"
                  >
                    {i.issueFromBatch}
                  </td>

                  {/* R: Batch Expiry Date [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`R${rowNum}`, 'Stock Issued', formulaR, i.batchExpiryDate, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaR : i.batchExpiryDate}
                  </td>

                  {/* S: FEFO Check [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`S${rowNum}`, 'Stock Issued', formulaS, i.fefoCheck, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaS : <span className={sPill}>{i.fefoCheck}</span>}
                  </td>

                  {/* Actions Column: Print Voucher, FEFO, Edit, Delete */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPrintVoucher(i)}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                        title="Print Material Requisition Voucher"
                      >
                        <Printer className="w-3 h-3 text-sky-400" />
                        <span>Slip</span>
                      </button>

                      {i.issueFromBatch !== 'N/A' && (
                        <button
                          onClick={() => onAutoAssignFEFO(i.issueNumber)}
                          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded border border-amber-800/60 transition-colors cursor-pointer"
                          title="Auto-Assign Earliest Expiring Batch (FEFO)"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>FEFO</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditIssue(i)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit Requisition Data"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {confirmDeleteIssueNum === i.issueNumber ? (
                        <div className="inline-flex items-center gap-1 bg-red-950 p-1 rounded border border-red-800 text-[10px]">
                          <span className="text-red-300 font-mono">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteIssue(i.issueNumber);
                              setConfirmDeleteIssueNum(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteIssueNum(null)}
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteIssueNum(i.issueNumber)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Requisition"
                        >
                          <Trash2 className="w-3 h-3" />
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

import React, { useState } from 'react';
import { Product } from '../../types/inventory';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface MasterListSheetProps {
  products: Product[];
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenReceiveForSku: (sku: string) => void;
  onOpenIssueForSku: (sku: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (sku: string) => void;
}

export const MasterListSheet: React.FC<MasterListSheetProps> = ({
  products,
  showFormulas,
  onSelectCell,
  onOpenReceiveForSku,
  onOpenIssueForSku,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.preferredSupplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OUT' && p.stockStatus === 'OUT OF STOCK') ||
      (statusFilter === 'REORDER' && p.stockStatus === 'REORDER') ||
      (statusFilter === 'EXPIRED' && p.qtyExpiredStillInStock > 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Table Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Product, Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="REORDER">Needs Reorder (Col R)</option>
              <option value="OUT">Out of Stock (Col R)</option>
              <option value="EXPIRED">Has Expired Stock (Col W)</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filteredProducts.length} of {products.length} Products | Currency: <strong className="text-emerald-400">GH₵</strong>
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[2200px]">
          {/* Column Headers */}
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-semibold sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[90px]">A: SKU</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[180px]">B: Product Name</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[110px]">C: Category</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[110px]">D: Purchase Unit</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[100px]">E: Pieces / Bulk</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[100px]">F: Issue Unit</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px]">G: Reorder Level</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[150px]">H: Preferred Supplier</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px]">I: Unit Cost (GH₵)</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[130px] bg-emerald-950/20 text-emerald-300">
                J: Cost/Issue (GH₵) [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px]">K: Opening Stock</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px] bg-slate-900/60">
                L: Total Received [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px] bg-slate-900/60">
                M: Total Issued [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px] bg-slate-900/60">
                N: Net Adjustments [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] font-bold text-slate-100 bg-slate-900/80">
                O: Current Stock [fx]
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[210px] font-semibold text-emerald-300 bg-emerald-950/30">
                P: Stock Display (Bulk + Loose) [fx]
              </th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] bg-slate-900/60">
                Q: Stock Value (GH₵) [fx]
              </th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[120px]">R: Stock Status [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[130px]">S: Earliest Expiry [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[110px]">T: Days Left [fx]</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[150px]">U: Expiry Status [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px]">V: Expiring &lt;30d [fx]</th>
              <th className="px-3 py-2 text-right border-r border-slate-800 min-w-[120px] text-red-400">
                W: Expired in Stock [fx]
              </th>
              <th className="px-3 py-2 text-center min-w-[170px] sticky right-0 bg-slate-950 z-10 border-l border-slate-800">
                Data Row Actions
              </th>
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filteredProducts.map((p, idx) => {
              const rowNum = idx + 2;

              const formulaJ = `=IF(E${rowNum}=0,"",I${rowNum}/E${rowNum})`;
              const formulaL = `=SUMIFS('Stock Received'!H:H,'Stock Received'!D:D,A${rowNum})`;
              const formulaM = `=SUMIFS('Stock Issued'!H:H,'Stock Issued'!D:D,A${rowNum})`;
              const formulaN = `=SUMIFS('Stock Adjustments'!H:H,'Stock Adjustments'!C:C,A${rowNum})`;
              const formulaO = `=K${rowNum}+L${rowNum}-M${rowNum}+N${rowNum}`;
              const formulaP = `=IF(E${rowNum}>1,INT(O${rowNum}/E${rowNum})&" "&D${rowNum}&"(s) + "&MOD(O${rowNum},E${rowNum})&" "&F${rowNum}&"(s)",O${rowNum}&" "&F${rowNum}&"(s)")`;
              const formulaQ = `=O${rowNum}*J${rowNum}`;
              const formulaR = `=IF(O${rowNum}<=0,"OUT OF STOCK",IF(O${rowNum}<=G${rowNum},"REORDER","OK"))`;
              const formulaS = `=IFERROR(AGGREGATE(15,6,'Batch Tracker'!$F$2:$F$500/(('Batch Tracker'!$B$2:$B$500=A${rowNum})*('Batch Tracker'!$I$2:$I$500>0)*('Batch Tracker'!$F$2:$F$500<>"")),1),"NO EXPIRY")`;
              const formulaT = `=IF(S${rowNum}="NO EXPIRY","N/A",S${rowNum}-TODAY())`;
              const formulaU = `=IF(S${rowNum}="NO EXPIRY","NO EXPIRY",IF(T${rowNum}<0,"HAS EXPIRED STOCK",IF(T${rowNum}<=30,"EXPIRING <30 DAYS",IF(T${rowNum}<=90,"EXPIRING <90 DAYS","OK"))))`;
              const formulaV = `=SUMPRODUCT(('Batch Tracker'!$B$2:$B$500=A${rowNum})*('Batch Tracker'!$I$2:$I$500>0)*('Batch Tracker'!$J$2:$J$500>=0)*('Batch Tracker'!$J$2:$J$500<=30)*('Batch Tracker'!$I$2:$I$500))`;
              const formulaW = `=SUMPRODUCT(('Batch Tracker'!$B$2:$B$500=A${rowNum})*('Batch Tracker'!$I$2:$I$500>0)*('Batch Tracker'!$J$2:$J$500<0)*('Batch Tracker'!$I$2:$I$500))`;

              let stockBg = 'bg-emerald-950/20 text-emerald-300';
              if (p.currentStock <= 0) {
                stockBg = 'bg-red-950/60 text-red-300 font-bold';
              } else if (p.currentStock <= p.reorderLevel) {
                stockBg = 'bg-amber-950/50 text-amber-300 font-semibold';
              }

              let statusPill = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
              if (p.stockStatus === 'OUT OF STOCK') {
                statusPill = 'bg-red-600 text-white font-bold px-2 py-0.5 shadow-xs';
              } else if (p.stockStatus === 'REORDER') {
                statusPill = 'bg-amber-400 text-slate-950 font-bold px-2 py-0.5 shadow-xs';
              }

              let expiryPill = 'bg-slate-800 text-slate-400';
              if (p.expiryStatus === 'HAS EXPIRED STOCK') {
                expiryPill = 'bg-red-600 text-white font-bold px-2 py-0.5 shadow-xs';
              } else if (p.expiryStatus === 'EXPIRING <30 DAYS') {
                expiryPill = 'bg-orange-500 text-white font-bold px-2 py-0.5 shadow-xs';
              } else if (p.expiryStatus === 'EXPIRING <90 DAYS') {
                expiryPill = 'bg-amber-400 text-slate-950 font-semibold px-2 py-0.5 shadow-xs';
              } else if (p.expiryStatus === 'OK') {
                expiryPill = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
              }

              return (
                <tr key={p.sku} className="hover:bg-slate-800/60 transition-colors group">
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    {rowNum}
                  </td>

                  {/* A: SKU */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Master List', '', p.sku, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.sku}
                  </td>

                  {/* B: Product Name */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Master List', '', p.name, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-100 font-medium cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.name}
                  </td>

                  {/* C: Category */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Master List', '', p.category, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.category}
                  </td>

                  {/* D: Purchase Unit */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Master List', '', p.purchaseUnit, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.purchaseUnit}
                  </td>

                  {/* E: Pieces Per Purchase Unit */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Master List', '', String(p.piecesPerPurchaseUnit), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.piecesPerPurchaseUnit}
                  </td>

                  {/* F: Issue Unit */}
                  <td
                    onClick={() => onSelectCell(`F${rowNum}`, 'Master List', '', p.issueUnit, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.issueUnit}
                  </td>

                  {/* G: Reorder Level */}
                  <td
                    onClick={() => onSelectCell(`G${rowNum}`, 'Master List', '', String(p.reorderLevel), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.reorderLevel.toLocaleString()} {p.issueUnit}s
                  </td>

                  {/* H: Preferred Supplier */}
                  <td
                    onClick={() => onSelectCell(`H${rowNum}`, 'Master List', '', p.preferredSupplier, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50 truncate max-w-[150px]"
                  >
                    {p.preferredSupplier}
                  </td>

                  {/* I: Unit Cost (Purchase) */}
                  <td
                    onClick={() => onSelectCell(`I${rowNum}`, 'Master List', '', formatCedis(p.unitCostPurchase), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {formatCedis(p.unitCostPurchase)}
                  </td>

                  {/* J: Cost Per Issue Unit [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`J${rowNum}`, 'Master List', formulaJ, formatCedis(p.costPerIssueUnit), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-emerald-400 font-semibold cursor-pointer bg-emerald-950/10 hover:bg-emerald-950/30"
                  >
                    {showFormulas ? formulaJ : formatCedis(p.costPerIssueUnit)}
                  </td>

                  {/* K: Opening Stock */}
                  <td
                    onClick={() => onSelectCell(`K${rowNum}`, 'Master List', '', String(p.openingStock), false)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {p.openingStock.toLocaleString()}
                  </td>

                  {/* L: Total Received [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`L${rowNum}`, 'Master List', formulaL, String(p.totalReceived), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaL : p.totalReceived.toLocaleString()}
                  </td>

                  {/* M: Total Issued [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`M${rowNum}`, 'Master List', formulaM, String(p.totalIssued), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaM : p.totalIssued.toLocaleString()}
                  </td>

                  {/* N: Net Adjustments [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`N${rowNum}`, 'Master List', formulaN, String(p.netAdjustments), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-200 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaN
                    ) : (
                      <span className={p.netAdjustments < 0 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                        {p.netAdjustments > 0 ? `+${p.netAdjustments}` : p.netAdjustments}
                      </span>
                    )}
                  </td>

                  {/* O: Current Stock [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`O${rowNum}`, 'Master List', formulaO, String(p.currentStock), true)}
                    className={`px-3 py-2 border-r border-slate-800 text-right cursor-pointer ${stockBg}`}
                  >
                    {showFormulas ? formulaO : p.currentStock.toLocaleString()}
                  </td>

                  {/* P: Stock Display (Bulk + Loose) [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`P${rowNum}`, 'Master List', formulaP, p.stockDisplay, true)}
                    className="px-3 py-2 border-r border-slate-800 text-emerald-300 font-bold bg-emerald-950/20 cursor-pointer hover:bg-emerald-950/40"
                  >
                    {showFormulas ? formulaP : p.stockDisplay}
                  </td>

                  {/* Q: Stock Value [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`Q${rowNum}`, 'Master List', formulaQ, formatCedis(p.stockValue), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-100 font-semibold cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaQ : formatCedis(p.stockValue)}
                  </td>

                  {/* R: Stock Status [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`R${rowNum}`, 'Master List', formulaR, p.stockStatus, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaR : <span className={`inline-block rounded ${statusPill}`}>{p.stockStatus}</span>}
                  </td>

                  {/* S: Earliest Expiry Date [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`S${rowNum}`, 'Master List', formulaS, p.earliestExpiryDate, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaS : p.earliestExpiryDate}
                  </td>

                  {/* T: Days Left [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`T${rowNum}`, 'Master List', formulaT, String(p.daysToEarliestExpiry), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaT
                    ) : typeof p.daysToEarliestExpiry === 'number' ? (
                      <span className={p.daysToEarliestExpiry < 0 ? 'text-red-400 font-bold' : p.daysToEarliestExpiry <= 30 ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {p.daysToEarliestExpiry}d
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* U: Expiry Status [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`U${rowNum}`, 'Master List', formulaU, p.expiryStatus, true)}
                    className="px-3 py-2 border-r border-slate-800 text-center cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? formulaU : <span className={`inline-block rounded ${expiryPill}`}>{p.expiryStatus}</span>}
                  </td>

                  {/* V: Qty Expiring <30 Days [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`V${rowNum}`, 'Master List', formulaV, String(p.qtyExpiringWithin30Days), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaV
                    ) : p.qtyExpiringWithin30Days > 0 ? (
                      <span className="text-orange-400 font-bold">{p.qtyExpiringWithin30Days}</span>
                    ) : (
                      '0'
                    )}
                  </td>

                  {/* W: Qty Expired Still in Stock [FORMULA] */}
                  <td
                    onClick={() => onSelectCell(`W${rowNum}`, 'Master List', formulaW, String(p.qtyExpiredStillInStock), true)}
                    className="px-3 py-2 border-r border-slate-800 text-right cursor-pointer hover:bg-slate-700/50"
                  >
                    {showFormulas ? (
                      formulaW
                    ) : p.qtyExpiredStillInStock > 0 ? (
                      <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs">
                        {p.qtyExpiredStillInStock}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>

                  {/* Row Operations (Available to ANY user per prompt) */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenReceiveForSku(p.sku)}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded transition-colors cursor-pointer"
                        title="Receive Stock for this SKU"
                      >
                        +Rec
                      </button>
                      <button
                        onClick={() => onOpenIssueForSku(p.sku)}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-blue-700 text-slate-200 hover:text-white rounded transition-colors cursor-pointer"
                        title="Issue Stock for this SKU"
                      >
                        -Iss
                      </button>
                      <button
                        onClick={() => onEditProduct(p)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit Product Data"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete product ${p.sku} - ${p.name}?`)) {
                            onDeleteProduct(p.sku);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        title="Delete Product SKU"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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

import React, { useState } from 'react';
import { DashboardMetrics } from '../../types/inventory';
import {
  Package,
  AlertOctagon,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  Coins,
} from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface DashboardSheetProps {
  metrics: DashboardMetrics;
  showFormulas: boolean;
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onNavigateToTab: (tabId: string) => void;
  onCheckExpiries?: () => void;
}

export const DashboardSheet: React.FC<DashboardSheetProps> = ({
  metrics,
  showFormulas,
  onSelectCell,
  onNavigateToTab,
  onCheckExpiries,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'excelGrid'>('visual');

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-auto scrollbar-thin">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>EXECUTIVE INVENTORY &amp; FINANCIAL DASHBOARD</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-normal">
              Currency: GH₵
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Cell B3 Last Updated: <span className="text-slate-200">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCheckExpiries && (
            <button
              onClick={onCheckExpiries}
              className="px-3 py-1.5 rounded text-xs bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/60 font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Expiries Now</span>
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === 'visual' ? 'excelGrid' : 'visual')}
            className="px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono cursor-pointer"
          >
            {viewMode === 'visual' ? 'View Excel Grid Formula Cells (B7:C30)' : 'View Modern Visual Cards'}
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* SECTION 1: KEY METRICS */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  SECTION 1 — Key Valuation &amp; Stock Metrics
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Standardized in Ghanaian Cedis (GH₵)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total SKUs */}
              <div
                onClick={() => onSelectCell('C7', 'Dashboard', "=COUNTA('Master List'!A2:A100)", String(metrics.totalSkus), true)}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total SKUs (B7)</span>
                  <Package className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100">{metrics.totalSkus}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">=COUNTA('Master List'!A2:A100)</div>
              </div>

              {/* Total Stock Value in GH₵ */}
              <div
                onClick={() => onSelectCell('C8', 'Dashboard', "=SUM('Master List'!Q2:Q100)", formatCedis(metrics.totalStockValue), true)}
                className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total Stock Value (B8)</span>
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCedis(metrics.totalStockValue)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">=SUM('Master List'!Q2:Q100)</div>
              </div>

              {/* Items in Stock */}
              <div
                onClick={() => onSelectCell('C9', 'Dashboard', "=COUNTIF('Master List'!O2:O100,\">\"&0)", String(metrics.itemsInStock), true)}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Items In Stock (B9)</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100">{metrics.itemsInStock}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">=COUNTIF(O2:O100, "&gt;0")</div>
              </div>

              {/* Items Out of Stock */}
              <div
                onClick={() => onSelectCell('C10', 'Dashboard', "=COUNTIF('Master List'!R2:R100,\"*OUT*\")", String(metrics.itemsOutOfStock), true)}
                className={`bg-slate-950/80 border p-4 rounded-xl cursor-pointer transition-all shadow-xs ${
                  metrics.itemsOutOfStock > 0 ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Out of Stock (B10)</span>
                  <AlertOctagon className={`w-4 h-4 ${metrics.itemsOutOfStock > 0 ? 'text-red-400' : 'text-slate-500'}`} />
                </div>
                <div className={`text-2xl font-bold font-mono ${metrics.itemsOutOfStock > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {metrics.itemsOutOfStock}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">=COUNTIF(R2:R100, "*OUT*")</div>
              </div>

              {/* Items Needing Reorder */}
              <div
                onClick={() => onSelectCell('C11', 'Dashboard', "=COUNTIF('Master List'!R2:R100,\"*REORDER*\")", String(metrics.itemsNeedingReorder), true)}
                className={`bg-slate-950/80 border p-4 rounded-xl cursor-pointer transition-all shadow-xs ${
                  metrics.itemsNeedingReorder > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Needing Reorder (B11)</span>
                  <AlertTriangle className={`w-4 h-4 ${metrics.itemsNeedingReorder > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                </div>
                <div className={`text-2xl font-bold font-mono ${metrics.itemsNeedingReorder > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {metrics.itemsNeedingReorder}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">=COUNTIF(R2:R100, "*REORDER*")</div>
              </div>
            </div>
          </div>

          {/* SECTION 2 & SECTION 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION 2: TRANSACTION SUMMARY */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    SECTION 2 — Inbound &amp; Outbound Turnover
                  </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Row B13-B21</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-300">Total Receipts Count (B15)</span>
                  </div>
                  <span className="font-bold text-slate-100">{metrics.totalReceipts}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Total Receipts Value (B16)</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    {formatCedis(metrics.totalReceiptsValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Total Requisitions Count (B17)</span>
                  </div>
                  <span className="font-bold text-slate-100">{metrics.totalIssues}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Total Requisition Cost (B18)</span>
                  </div>
                  <span className="font-bold text-amber-300">
                    {formatCedis(metrics.totalIssuesValue)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">This Month Receipts (B20)</div>
                    <div className="font-bold text-emerald-400">
                      {formatCedis(metrics.thisMonthReceivedValue)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">This Month Issues (B21)</div>
                    <div className="font-bold text-amber-300">
                      {formatCedis(metrics.thisMonthIssuedValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: EXPIRY ALERTS */}
            <div className="bg-slate-950/80 border border-red-950/60 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-red-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-300 font-mono">
                    SECTION 3 — Expiry &amp; Write-Off Risk
                  </h2>
                </div>
                <span className="text-[10px] text-red-400/80 font-mono">FEFO Health Monitor</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-900/30">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300">Items with Expired Stock (B25)</span>
                  </div>
                  <span className={`font-bold ${metrics.itemsWithExpiredStock > 0 ? 'text-red-400 bg-red-950 px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                    {metrics.itemsWithExpiredStock} SKU{metrics.itemsWithExpiredStock === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-950/20 border border-orange-900/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">Items Expiring &lt;30 Days (B26)</span>
                  </div>
                  <span className={`font-bold ${metrics.itemsExpiring30Days > 0 ? 'text-orange-300 bg-orange-950 px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                    {metrics.itemsExpiring30Days} SKU{metrics.itemsExpiring30Days === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Items Expiring &lt;90 Days (B27)</span>
                  </div>
                  <span className="font-bold text-amber-300">
                    {metrics.itemsExpiring90Days} SKU{metrics.itemsExpiring90Days === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">Total Expired Qty (B28)</div>
                    <div className="font-bold text-red-400">
                      {metrics.totalQtyExpired} units
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">Value of Expired Stock (B29)</div>
                    <div className="font-bold text-red-400">
                      {formatCedis(metrics.valueOfExpiredStock)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: URGENT EXPIRY TABLE */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  SECTION 4 — Urgent Expiry Queue (Top 10 Expiring Items &le;90 Days)
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('batches')}
                className="text-xs text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                Open FEFO Batch Tracker &rarr;
              </button>
            </div>

            {metrics.urgentExpiryList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-mono">
                ✓ No inventory batches expiring within 90 days. All stock is well within shelf-life!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="px-3 py-2 text-left">SKU (B31)</th>
                      <th className="px-3 py-2 text-left font-sans">Product Name (C31)</th>
                      <th className="px-3 py-2 text-center">Earliest Expiry (D31)</th>
                      <th className="px-3 py-2 text-right">Days Left (E31)</th>
                      <th className="px-3 py-2 text-right">Qty at Risk (F31)</th>
                      <th className="px-3 py-2 text-center">Status (G31)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {metrics.urgentExpiryList.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-200">{item.sku}</td>
                        <td className="px-3 py-2 text-slate-100 font-sans">{item.productName}</td>
                        <td className="px-3 py-2 text-center text-slate-300">{item.earliestExpiryDate}</td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`font-bold ${
                              item.daysLeft < 0
                                ? 'text-red-400'
                                : item.daysLeft <= 30
                                ? 'text-orange-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {item.daysLeft} days
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-200">
                          {item.qtyAtRisk} units
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'HAS EXPIRED STOCK'
                                ? 'bg-red-600 text-white'
                                : item.status === 'EXPIRING <30 DAYS'
                                ? 'bg-orange-500 text-white'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Excel Grid Representation of Sheet 8 */
        <div className="p-4 overflow-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs max-w-4xl mx-auto">
            <div className="text-slate-400 text-xs mb-3 font-bold border-b border-slate-800 pb-2">
              Exact Cell Structure (Sheet 8: Dashboard):
            </div>

            <table className="w-full border-collapse border border-slate-800">
              <tbody>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <td className="p-2 font-bold text-slate-500 w-16 border-r border-slate-800">B2:H2</td>
                  <td colSpan={2} className="p-2 font-bold text-lg text-emerald-400">
                    STOCK MANAGEMENT DASHBOARD (GH₵)
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B3 / C3</td>
                  <td className="p-2 text-slate-400">Last Updated:</td>
                  <td className="p-2 text-slate-200">=NOW() &rarr; {new Date().toLocaleString()}</td>
                </tr>
                <tr className="bg-blue-950/40 border-b border-slate-800">
                  <td className="p-2 font-bold text-slate-500 border-r border-slate-800">B5</td>
                  <td colSpan={2} className="p-2 font-bold text-blue-300">
                    SECTION 1 — KEY METRICS
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B7 / C7</td>
                  <td className="p-2 text-slate-300">Total SKUs</td>
                  <td className="p-2 font-bold text-slate-100">=COUNTA('Master List'!A2:A100) &rarr; {metrics.totalSkus}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B8 / C8</td>
                  <td className="p-2 text-slate-300">Total Stock Value</td>
                  <td className="p-2 font-bold text-emerald-400">=SUM('Master List'!Q2:Q100) &rarr; {formatCedis(metrics.totalStockValue)}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B9 / C9</td>
                  <td className="p-2 text-slate-300">Items In Stock</td>
                  <td className="p-2 font-bold text-slate-100">=COUNTIF('Master List'!O2:O100,"&gt;"&amp;0) &rarr; {metrics.itemsInStock}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B10 / C10</td>
                  <td className="p-2 text-slate-300">Items Out of Stock</td>
                  <td className="p-2 font-bold text-red-400">=COUNTIF('Master List'!R2:R100,"*OUT*") &rarr; {metrics.itemsOutOfStock}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B11 / C11</td>
                  <td className="p-2 text-slate-300">Items Needing Reorder</td>
                  <td className="p-2 font-bold text-amber-400">=COUNTIF('Master List'!R2:R100,"*REORDER*") &rarr; {metrics.itemsNeedingReorder}</td>
                </tr>

                <tr className="bg-blue-950/40 border-b border-slate-800">
                  <td className="p-2 font-bold text-slate-500 border-r border-slate-800">B13</td>
                  <td colSpan={2} className="p-2 font-bold text-blue-300">
                    SECTION 2 — TRANSACTION SUMMARY
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B15 / C15</td>
                  <td className="p-2 text-slate-300">Total Receipts</td>
                  <td className="p-2 font-bold text-slate-100">=COUNTA('Stock Received'!A2:A1000) &rarr; {metrics.totalReceipts}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B16 / C16</td>
                  <td className="p-2 text-slate-300">Total Receipts Value</td>
                  <td className="p-2 font-bold text-emerald-400">=SUM('Stock Received'!J2:J1000) &rarr; {formatCedis(metrics.totalReceiptsValue)}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B17 / C17</td>
                  <td className="p-2 text-slate-300">Total Issues</td>
                  <td className="p-2 font-bold text-slate-100">=COUNTA('Stock Issued'!A2:A1000) &rarr; {metrics.totalIssues}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B18 / C18</td>
                  <td className="p-2 text-slate-300">Total Issue Value</td>
                  <td className="p-2 font-bold text-amber-300">=SUM('Stock Issued'!L2:L1000) &rarr; {formatCedis(metrics.totalIssuesValue)}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B20 / C20</td>
                  <td className="p-2 text-slate-300">This Month Received Value</td>
                  <td className="p-2 font-bold text-emerald-400">=SUMPRODUCT(...) &rarr; {formatCedis(metrics.thisMonthReceivedValue)}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="p-2 text-slate-500 border-r border-slate-800">B21 / C21</td>
                  <td className="p-2 text-slate-300">This Month Issued Value</td>
                  <td className="p-2 font-bold text-amber-300">=SUMPRODUCT(...) &rarr; {formatCedis(metrics.thisMonthIssuedValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

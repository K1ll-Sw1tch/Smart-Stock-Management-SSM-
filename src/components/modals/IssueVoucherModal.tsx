import React from 'react';
import { StockIssue } from '../../types/inventory';
import { Printer, X } from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface IssueVoucherModalProps {
  issue: StockIssue | null;
  onClose: () => void;
}

export const IssueVoucherModal: React.FC<IssueVoucherModalProps> = ({ issue, onClose }) => {
  if (!issue) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-100 font-mono">
              Store Issue Requisition Voucher
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/30">
              {issue.issueNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-8 overflow-y-auto bg-slate-950 text-slate-100 font-sans print:p-0 print:bg-white print:text-black">
          <div className="border-2 border-slate-800 print:border-black p-6 rounded-lg bg-slate-900/60 print:bg-white">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-700 print:border-black mb-6">
              <div className="text-[11px] font-mono tracking-widest text-slate-400 print:text-gray-600 uppercase">
                Warehouse Material Draw Slip • Currency: GH₵
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white print:text-black mt-1">
                OFFICIAL STORE ISSUE VOUCHER
              </h1>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-300 print:text-black">
                <span>VOUCHER NO: <strong className="text-emerald-400 print:text-black">{issue.issueNumber}</strong></span>
                <span>•</span>
                <span>DATE: <strong>{issue.dateIssued}</strong></span>
              </div>
            </div>

            {/* Requisition Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6 pb-6 border-b border-slate-800 print:border-gray-300">
              <div>
                <span className="text-slate-400 print:text-gray-600">Requesting Department:</span>
                <div className="text-sm font-bold text-slate-100 print:text-black mt-0.5">{issue.department}</div>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600">Allocated Batch Number:</span>
                <div className="text-sm font-bold text-amber-300 print:text-black mt-0.5">
                  {issue.issueFromBatch || 'N/A'} {issue.batchExpiryDate !== 'N/A' && `(Exp: ${issue.batchExpiryDate})`}
                </div>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600">Requisition Mode &amp; Remarks:</span>
                <div className="text-slate-200 print:text-black mt-0.5 font-sans italic">
                  Mode: <strong className="font-mono text-emerald-400 print:text-black">{issue.issuedUnitType || 'INDIVIDUAL'}</strong> • {issue.remarks || 'Standard draw'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-600">FEFO Queue Compliance:</span>
                <div className="text-slate-200 print:text-black mt-0.5 font-bold">
                  {issue.fefoCheck}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full text-xs font-mono border-collapse border border-slate-700 print:border-black">
                <thead>
                  <tr className="bg-slate-800 print:bg-gray-200 text-slate-200 print:text-black border-b border-slate-700 print:border-black">
                    <th className="p-2 text-left border-r border-slate-700 print:border-black">SKU</th>
                    <th className="p-2 text-left border-r border-slate-700 print:border-black font-sans">Product Description</th>
                    <th className="p-2 text-left border-r border-slate-700 print:border-black">Issue Unit</th>
                    <th className="p-2 text-right border-r border-slate-700 print:border-black">Total Qty Issued</th>
                    <th className="p-2 text-right border-r border-slate-700 print:border-black">Unit Cost (GH₵)</th>
                    <th className="p-2 text-right">Total Cost (GH₵)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800 print:border-black font-semibold">
                    <td className="p-2.5 border-r border-slate-700 print:border-black text-slate-300 print:text-black">{issue.sku}</td>
                    <td className="p-2.5 border-r border-slate-700 print:border-black font-sans text-slate-100 print:text-black">{issue.productName}</td>
                    <td className="p-2.5 border-r border-slate-700 print:border-black text-slate-300 print:text-black">{issue.issueUnit}</td>
                    <td className="p-2.5 border-r border-slate-700 print:border-black text-right text-emerald-400 print:text-black font-bold">
                      {issue.qtyIssued} {issue.issueUnit}s
                      {issue.bulkQuantityInput && (
                        <div className="text-[10px] text-slate-400 print:text-gray-600 font-normal">
                          ({issue.bulkQuantityInput} Bulk Pack)
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 border-r border-slate-700 print:border-black text-right text-slate-300 print:text-black">
                      {formatCedis(issue.costPerIssueUnit)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-100 print:text-black">
                      {formatCedis(issue.totalIssueCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signatures Section */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t-2 border-slate-800 print:border-black text-xs font-mono">
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 print:text-gray-600">Issued By (Stores Controller):</span>
                  <div className="font-bold text-slate-200 print:text-black mt-0.5">{issue.issuedBy}</div>
                </div>
                <div className="pt-6">
                  <div className="border-b border-slate-600 print:border-black w-48 mb-1"></div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600">Storekeeper Signature &amp; Date</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 print:text-gray-600">Authorized By (Department Head):</span>
                  <div className="font-bold text-slate-200 print:text-black mt-0.5">{issue.authorizedBy}</div>
                </div>
                <div className="pt-6">
                  <div className="border-b border-slate-600 print:border-black w-48 mb-1"></div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600">Authorized Signature &amp; Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

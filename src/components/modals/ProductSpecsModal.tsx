import React, { useState } from 'react';
import { Product, UserAccount } from '../../types/inventory';
import { Settings, Lock, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCedis } from '../../utils/excelCalculations';

interface ProductSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentUser: UserAccount;
  onUpdateProductSpecs: (sku: string, reorderLevel: number, unitCostPurchase: number) => void;
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  isOpen,
  onClose,
  products,
  currentUser,
  onUpdateProductSpecs,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const [specs, setSpecs] = useState<Record<string, { reorderLevel: number; unitCostPurchase: number }>>(() => {
    const initial: Record<string, { reorderLevel: number; unitCostPurchase: number }> = {};
    products.forEach((p) => {
      initial[p.sku] = {
        reorderLevel: p.reorderLevel,
        unitCostPurchase: p.unitCostPurchase,
      };
    });
    return initial;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChangeReorder = (sku: string, val: number) => {
    if (!isAdmin) return;
    setSpecs((prev) => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        reorderLevel: Math.max(0, val),
      },
    }));
  };

  const handleChangeCost = (sku: string, val: number) => {
    if (!isAdmin) return;
    setSpecs((prev) => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        unitCostPurchase: Math.max(0, val),
      },
    }));
  };

  const handleSaveAll = () => {
    if (!isAdmin) return;
    Object.entries(specs).forEach(([sku, values]) => {
      onUpdateProductSpecs(sku, values.reorderLevel, values.unitCostPurchase);
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs select-none text-xs font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <span>Product Catalog &amp; Reorder Level Governance</span>
                {isAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                    Admin Access (Editable)
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {isAdmin
                  ? 'Super Admin authority: Adjust minimum safety reorder thresholds and bulk procurement costs in GH₵.'
                  : 'Reorder levels are visible across the system but can only be modified by an Administrator.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="px-3 py-2.5">SKU</th>
                <th className="px-3 py-2.5">Product Name</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Packaging Rule</th>
                <th className="px-3 py-2.5 text-right">Unit Cost (GH₵)</th>
                <th className="px-3 py-2.5 text-right">
                  Reorder Level ({isAdmin ? 'Editable' : 'View'})
                </th>
                <th className="px-3 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => {
                const currentReorder = specs[p.sku]?.reorderLevel ?? p.reorderLevel;
                const currentCost = specs[p.sku]?.unitCostPurchase ?? p.unitCostPurchase;
                const isUnderReorder = p.currentStock <= currentReorder;

                return (
                  <tr key={p.sku} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-slate-200">{p.sku}</td>
                    <td className="px-3 py-2.5 text-slate-100 font-sans">{p.name}</td>
                    <td className="px-3 py-2.5 text-slate-400">{p.category}</td>
                    <td className="px-3 py-2.5 text-slate-300">
                      1 {p.purchaseUnit} = {p.piecesPerPurchaseUnit} {p.issueUnit}s
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isAdmin ? (
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span className="text-emerald-400 font-bold">GH₵</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentCost}
                            onChange={(e) => handleChangeCost(p.sku, Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-bold">{formatCedis(p.unitCostPurchase)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={currentReorder}
                          onChange={(e) => handleChangeReorder(p.sku, Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-amber-500/50 rounded text-right text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                        />
                      ) : (
                        <span className="font-bold text-amber-300">
                          {p.reorderLevel} {p.issueUnit}s
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {isUnderReorder ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800 font-bold">
                          REORDER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">
            {isAdmin
              ? 'Changes to Reorder Levels update safety stock alarms across Requisitions and Dashboard.'
              : 'Contact an Administrator to adjust minimum stock reorder thresholds.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Specifications</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

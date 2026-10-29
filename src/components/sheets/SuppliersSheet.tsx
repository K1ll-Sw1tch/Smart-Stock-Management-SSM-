import React, { useState } from 'react';
import { Supplier, Product } from '../../types/inventory';
import { Search, Plus, Truck, Mail, Phone, Trash2, Edit2 } from 'lucide-react';

interface SuppliersSheetProps {
  suppliers: Supplier[];
  products: Product[];
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenNewSupplier: () => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (supplierId: string) => void;
}

export const SuppliersSheet: React.FC<SuppliersSheetProps> = ({
  suppliers,
  products,
  onSelectCell,
  onOpenNewSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
              placeholder="Search Suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 font-mono text-xs"
            />
          </div>

          <button
            onClick={onOpenNewSupplier}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Named Range: <span className="text-emerald-400">SupplierList</span> = Suppliers!$A$2:$A$100
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[950px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[200px] font-bold text-slate-100">
                A: Supplier Name (=SupplierList)
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[150px]">B: Contact Person</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[160px]">C: Email</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">D: Phone</th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[130px]">E: Category</th>
              <th className="px-3 py-2 text-center border-r border-slate-800 min-w-[120px]">Active SKUs</th>
              <th className="px-3 py-2 text-center min-w-[100px] sticky right-0 bg-slate-950 z-10 border-l border-slate-800">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((s, idx) => {
              const rowNum = idx + 2;
              const suppliedSkus = products.filter((p) => p.preferredSupplier === s.name);

              return (
                <tr key={s.id || s.name} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    {rowNum}
                  </td>

                  {/* A: Supplier Name */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Suppliers', '', s.name, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-100 cursor-pointer hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{s.name}</span>
                    </div>
                  </td>

                  {/* B: Contact Person */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Suppliers', '', s.contactPerson || '', false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {s.contactPerson || '—'}
                  </td>

                  {/* C: Email */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Suppliers', '', s.email || '', false)}
                    className="px-3 py-2 border-r border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {s.email ? (
                      <span className="text-sky-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {s.email}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* D: Phone */}
                  <td
                    onClick={() => onSelectCell(`D${rowNum}`, 'Suppliers', '', s.phone || '', false)}
                    className="px-3 py-2 border-r border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {s.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* E: Category */}
                  <td
                    onClick={() => onSelectCell(`E${rowNum}`, 'Suppliers', '', s.category || '', false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50"
                  >
                    {s.category || 'General'}
                  </td>

                  {/* Supplied SKUs */}
                  <td className="px-3 py-2 text-center border-r border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold">
                      {suppliedSkus.length} SKU{suppliedSkus.length === 1 ? '' : 's'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    <div className="flex items-center justify-center gap-1">
                      {onEditSupplier && (
                        <button
                          onClick={() => onEditSupplier(s)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteSupplier && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete supplier ${s.name}?`)) {
                              onDeleteSupplier(s.id || s.name);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Supplier"
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

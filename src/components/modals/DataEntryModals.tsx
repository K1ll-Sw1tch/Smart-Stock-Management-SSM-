import React, { useState, useEffect } from 'react';
import {
  Product,
  StockReceipt,
  StockIssue,
  StockAdjustment,
  BatchItem,
  Supplier,
  DepartmentStaff,
} from '../../types/inventory';
import { X, Sparkles, AlertCircle, ArrowRight, Check, Package, Layers } from 'lucide-react';
import { recommendFEFOBatch, formatCedis } from '../../utils/excelCalculations';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. ADD / EDIT PRODUCT MODAL
export const AddProductModal: React.FC<
  BaseModalProps & {
    suppliers: Supplier[];
    onAdd: (product: any) => void;
    existingSkus: string[];
    initialData?: Product | null;
  }
> = ({ isOpen, onClose, suppliers, onAdd, existingSkus, initialData }) => {
  const nextSkuNum = existingSkus.length + 1;
  const [sku, setSku] = useState(initialData?.sku || `SKU-${String(nextSkuNum).padStart(3, '0')}`);
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'Stationery');
  const [purchaseUnit, setPurchaseUnit] = useState(initialData?.purchaseUnit || 'Box');
  const [piecesPerPurchaseUnit, setPiecesPerPurchaseUnit] = useState(initialData?.piecesPerPurchaseUnit || 50);
  const [issueUnit, setIssueUnit] = useState(initialData?.issueUnit || 'Piece');
  const [reorderLevel, setReorderLevel] = useState(initialData?.reorderLevel || 100);
  const [preferredSupplier, setPreferredSupplier] = useState(initialData?.preferredSupplier || suppliers[0]?.name || 'ABC Office Supplies');
  const [unitCostPurchase, setUnitCostPurchase] = useState(initialData?.unitCostPurchase || 15.00);
  const [openingStock, setOpeningStock] = useState(initialData?.openingStock || 0);

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setName(initialData.name);
      setCategory(initialData.category);
      setPurchaseUnit(initialData.purchaseUnit);
      setPiecesPerPurchaseUnit(initialData.piecesPerPurchaseUnit);
      setIssueUnit(initialData.issueUnit);
      setReorderLevel(initialData.reorderLevel);
      setPreferredSupplier(initialData.preferredSupplier);
      setUnitCostPurchase(initialData.unitCostPurchase);
      setOpeningStock(initialData.openingStock);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;
    onAdd({
      sku,
      name,
      category,
      purchaseUnit,
      piecesPerPurchaseUnit: Number(piecesPerPurchaseUnit),
      issueUnit,
      reorderLevel: Number(reorderLevel),
      preferredSupplier,
      unitCostPurchase: Number(unitCostPurchase),
      openingStock: Number(openingStock),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 font-mono">
            {initialData ? `Edit Master Product: ${initialData.sku}` : 'Add Master Product Catalog SKU'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={!!initialData}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono disabled:opacity-60"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="Stationery">Stationery</option>
                <option value="PPE">PPE</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Hardware">Hardware</option>
                <option value="Medical">Medical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Product Description</label>
            <input
              type="text"
              placeholder="e.g. Heavy Duty Stapler"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-sans"
              required
            />
          </div>

          {/* Unit Conversion Configuration */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">
              ★ Bulk &rarr; Issue Unit Conversion Ratio:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-0.5">Purchase Unit</label>
                <select
                  value={purchaseUnit}
                  onChange={(e) => setPurchaseUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                >
                  <option value="Box">Box</option>
                  <option value="Ream">Ream</option>
                  <option value="Pack">Pack</option>
                  <option value="Carton">Carton</option>
                  <option value="Drum">Drum</option>
                  <option value="Each">Each</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">Pieces / Container</label>
                <input
                  type="number"
                  min="1"
                  value={piecesPerPurchaseUnit}
                  onChange={(e) => setPiecesPerPurchaseUnit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">Issue Unit</label>
                <select
                  value={issueUnit}
                  onChange={(e) => setIssueUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                >
                  <option value="Piece">Piece</option>
                  <option value="Sheet">Sheet</option>
                  <option value="Pair">Pair</option>
                  <option value="Drum">Drum</option>
                  <option value="Each">Each</option>
                  <option value="Litre">Litre</option>
                </select>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Rule: 1 {purchaseUnit} contains {piecesPerPurchaseUnit} {issueUnit}(s)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Reorder Level ({issueUnit}s)</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Unit Cost (GH₵ / Bulk)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCostPurchase}
                onChange={(e) => setUnitCostPurchase(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono text-emerald-400 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Opening Stock ({issueUnit}s)</label>
              <input
                type="number"
                min="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Preferred Supplier</label>
            <select
              value={preferredSupplier}
              onChange={(e) => setPreferredSupplier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs cursor-pointer"
            >
              {initialData ? 'Save Product Edits' : 'Save Product SKU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. ADD / EDIT GOODS RECEIVED (GRN) MODAL WITH INLINE SKU & SUPPLIER CREATION
export const AddReceiptModal: React.FC<
  BaseModalProps & {
    products: Product[];
    suppliers: Supplier[];
    staff: DepartmentStaff[];
    initialSku?: string;
    onAdd: (receipt: any) => void;
    initialData?: StockReceipt | null;
    onRegisterNewProduct?: (product: any) => void;
    onRegisterNewSupplier?: (supplier: Supplier) => void;
  }
> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  staff,
  initialSku,
  onAdd,
  initialData,
  onRegisterNewProduct,
  onRegisterNewSupplier,
}) => {
  const [sku, setSku] = useState(initialData?.sku || initialSku || products[0]?.sku || 'SKU-001');
  const selectedProduct = products.find((p) => p.sku === sku) || products[0];

  const nowYear = new Date().getFullYear();
  const [dateReceived, setDateReceived] = useState(initialData?.dateReceived || new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState(initialData?.supplier || selectedProduct?.preferredSupplier || suppliers[0]?.name || '');
  const [qtyReceivedPurchase, setQtyReceivedPurchase] = useState(initialData?.qtyReceivedPurchase || 2);
  const [invoicePoRef, setInvoicePoRef] = useState(initialData?.invoicePoRef || `INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [receivedBy, setReceivedBy] = useState(initialData?.receivedBy || staff[2]?.staffName || staff[0]?.staffName || 'Peter Dube');
  const [remarks, setRemarks] = useState(initialData?.remarks || 'Standard delivery restock');
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');

  // Inline Supplier Creation state
  const [showInlineSupplier, setShowInlineSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');

  // Inline Product Creation state
  const [showInlineProduct, setShowInlineProduct] = useState(false);
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Stationery');
  const [newProdPurchaseUnit, setNewProdPurchaseUnit] = useState('Box');
  const [newProdPiecesPerUnit, setNewProdPiecesPerUnit] = useState(50);
  const [newProdIssueUnit, setNewProdIssueUnit] = useState('Piece');
  const [newProdReorderLevel, setNewProdReorderLevel] = useState(100);
  const [newProdCost, setNewProdCost] = useState(25.0);

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setDateReceived(initialData.dateReceived);
      setSupplier(initialData.supplier);
      setQtyReceivedPurchase(initialData.qtyReceivedPurchase);
      setInvoicePoRef(initialData.invoicePoRef);
      setReceivedBy(initialData.receivedBy);
      setRemarks(initialData.remarks);
      setExpiryDate(initialData.expiryDate);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const piecesPerUnit = selectedProduct?.piecesPerPurchaseUnit || 1;
  const qtyInIssueUnits = qtyReceivedPurchase * piecesPerUnit;
  const totalCost = qtyReceivedPurchase * (selectedProduct?.unitCostPurchase || 0);

  const handleSaveInlineSupplier = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;
    const newSup: Supplier = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      name: newSupName.trim(),
      contactPerson: newSupContact.trim() || undefined,
      phone: newSupPhone.trim() || undefined,
    };
    if (onRegisterNewSupplier) {
      onRegisterNewSupplier(newSup);
    }
    setSupplier(newSup.name);
    setShowInlineSupplier(false);
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
  };

  const handleSaveInlineProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newProdSku.trim() || !newProdName.trim()) return;
    const newProd = {
      sku: newProdSku.trim().toUpperCase(),
      name: newProdName.trim(),
      category: newProdCategory,
      purchaseUnit: newProdPurchaseUnit,
      piecesPerPurchaseUnit: Number(newProdPiecesPerUnit),
      issueUnit: newProdIssueUnit,
      reorderLevel: Number(newProdReorderLevel),
      preferredSupplier: supplier,
      unitCostPurchase: Number(newProdCost),
      openingStock: 0,
    };
    if (onRegisterNewProduct) {
      onRegisterNewProduct(newProd);
    }
    setSku(newProd.sku);
    setShowInlineProduct(false);
    setNewProdSku('');
    setNewProdName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const grnNumber = initialData?.grnNumber || `GRN-${nowYear}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const batchNumber = initialData?.batchNumber || (expiryDate ? `BAT-${nowYear}-${String(Math.floor(Math.random() * 900) + 100)}` : 'N/A');

    onAdd({
      grnNumber,
      dateReceived,
      supplier,
      sku,
      qtyReceivedPurchase: Number(qtyReceivedPurchase),
      invoicePoRef,
      receivedBy,
      remarks,
      batchNumber,
      expiryDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              {initialData ? `Edit Goods Received Note: ${initialData.grnNumber}` : 'Inbound Goods Receipt (GRN)'}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Direct receiving with on-the-fly SKU &amp; Supplier registration
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Receipt Date</label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-mono">Supplier</label>
                <button
                  type="button"
                  onClick={() => setShowInlineSupplier(!showInlineSupplier)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer"
                >
                  {showInlineSupplier ? 'Cancel' : '+ New Supplier'}
                </button>
              </div>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline Supplier Registration Section */}
          {showInlineSupplier && (
            <div className="p-3 bg-slate-950/80 border border-emerald-500/40 rounded-lg space-y-2.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                  Register New Supplier / Vendor
                </span>
                <span className="text-[10px] text-slate-400">Available in dropdowns subsequently</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Supplier Name *"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveInlineSupplier}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Save &amp; Select Supplier
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-mono">Product SKU</label>
              <button
                type="button"
                onClick={() => setShowInlineProduct(!showInlineProduct)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer"
              >
                {showInlineProduct ? 'Cancel' : '+ Register New Product SKU'}
              </button>
            </div>
            <select
              value={sku}
              disabled={!!initialData}
              onChange={(e) => {
                setSku(e.target.value);
                const p = products.find((x) => x.sku === e.target.value);
                if (p) setSupplier(p.preferredSupplier);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono disabled:opacity-60"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (1 {p.purchaseUnit} = {p.piecesPerPurchaseUnit} {p.issueUnit}s)
                </option>
              ))}
            </select>
          </div>

          {/* Inline Product SKU Registration Section */}
          {showInlineProduct && (
            <div className="p-3.5 bg-slate-950/90 border border-cyan-500/40 rounded-lg space-y-2.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 font-mono">
                  Register New Product SKU Directly to Catalog
                </span>
                <span className="text-[10px] text-slate-400">Integrated immediately</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">SKU Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-006"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Hand Sanitizer 500ml"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="PPE">PPE</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Tools & Hardware">Tools &amp; Hardware</option>
                    <option value="Medical/First Aid">Medical/First Aid</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Bulk Purchase Unit</label>
                  <input
                    type="text"
                    value={newProdPurchaseUnit}
                    onChange={(e) => setNewProdPurchaseUnit(e.target.value)}
                    placeholder="Box, Carton, Pack"
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Pieces / Container</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdPiecesPerUnit}
                    onChange={(e) => setNewProdPiecesPerUnit(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Issue Unit</label>
                  <input
                    type="text"
                    value={newProdIssueUnit}
                    onChange={(e) => setNewProdIssueUnit(e.target.value)}
                    placeholder="Piece, Sheet"
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Unit Cost (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-400 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  Initial Reorder Level: {newProdReorderLevel} {newProdIssueUnit}s
                </span>
                <button
                  type="button"
                  onClick={handleSaveInlineProduct}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Save &amp; Select Product
                </button>
              </div>
            </div>
          )}

          {/* Unit Multiplier Card */}
          <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Automated Bulk &rarr; Issue Unit Conversion
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                1 {selectedProduct?.purchaseUnit} = {piecesPerUnit} {selectedProduct?.issueUnit}s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-slate-400 mb-1">
                  Qty in Bulk {selectedProduct?.purchaseUnit}(s):
                </label>
                <input
                  type="number"
                  min="1"
                  value={qtyReceivedPurchase}
                  onChange={(e) => setQtyReceivedPurchase(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sky-300 font-bold font-mono text-sm"
                  required
                />
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded text-right">
                <div className="text-[10px] text-emerald-300/80">Issue Units Added to Inventory:</div>
                <div className="text-lg font-bold text-emerald-300 font-mono">
                  +{qtyInIssueUnits.toLocaleString()} {selectedProduct?.issueUnit}s
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Expiry Date (From Packaging)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-amber-300 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Leave empty if no expiry date on shipment.
              </span>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Invoice / PO Reference</label>
              <input
                type="text"
                value={invoicePoRef}
                onChange={(e) => setInvoicePoRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Received By</label>
              <select
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                {staff.map((st) => (
                  <option key={st.staffName} value={st.staffName}>
                    {st.staffName} ({st.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="text-slate-400 font-mono">
              Total Order Value: <strong className="text-emerald-400">{formatCedis(totalCost)}</strong>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs cursor-pointer"
              >
                {initialData ? 'Save GRN Edits' : 'Confirm & Post GRN'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. REDESIGNED REQUISITION PANEL (DUAL-UNIT & INLINE STAFF/DEPT CREATION)
export const AddIssueModal: React.FC<
  BaseModalProps & {
    products: Product[];
    departments: DepartmentStaff[];
    batches: BatchItem[];
    initialSku?: string;
    onAdd: (issue: any) => void;
    initialData?: StockIssue | null;
    onRegisterNewStaff?: (staff: DepartmentStaff) => void;
  }
> = ({
  isOpen,
  onClose,
  products,
  departments,
  batches,
  initialSku,
  onAdd,
  initialData,
  onRegisterNewStaff,
}) => {
  const [sku, setSku] = useState(initialData?.sku || initialSku || products[0]?.sku || 'SKU-001');
  const selectedProduct = products.find((p) => p.sku === sku) || products[0];

  const nowYear = new Date().getFullYear();
  const [dateIssued, setDateIssued] = useState(initialData?.dateIssued || new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState(initialData?.department || departments[0]?.department || 'Marketing');

  // Inline Staff / Department Creation state
  const [showInlineStaff, setShowInlineStaff] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Requisition Officer');

  // CRITICAL REQUIREMENT: Unit toggle allowing user to decide whether to issue in Bulk units or Individual units
  const [unitMode, setUnitMode] = useState<'INDIVIDUAL' | 'BULK'>(initialData?.issuedUnitType || 'INDIVIDUAL');
  const [bulkQtyInput, setBulkQtyInput] = useState(initialData?.bulkQuantityInput || 1);
  const [individualQtyInput, setIndividualQtyInput] = useState(initialData?.qtyIssued || 10);

  const [issuedBy, setIssuedBy] = useState(initialData?.issuedBy || 'Peter Dube');
  const [authorizedBy, setAuthorizedBy] = useState(initialData?.authorizedBy || 'Grace Ncube');
  const [remarks, setRemarks] = useState(initialData?.remarks || 'Department requisition');

  const skuBatches = batches.filter((b) => b.sku === sku && b.qtyRemaining > 0);
  const recommendedBatch = recommendFEFOBatch(sku, batches);
  const [issueFromBatch, setIssueFromBatch] = useState<string>(
    initialData?.issueFromBatch || recommendedBatch?.batchNumber || (skuBatches[0]?.batchNumber ?? 'N/A')
  );

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setDateIssued(initialData.dateIssued);
      setDepartment(initialData.department);
      setUnitMode(initialData.issuedUnitType || 'INDIVIDUAL');
      if (initialData.bulkQuantityInput) setBulkQtyInput(initialData.bulkQuantityInput);
      setIndividualQtyInput(initialData.qtyIssued);
      setIssuedBy(initialData.issuedBy);
      setAuthorizedBy(initialData.authorizedBy);
      setRemarks(initialData.remarks);
      setIssueFromBatch(initialData.issueFromBatch);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const currentAvailableStock = selectedProduct?.currentStock || 0;
  const piecesPerBulk = selectedProduct?.piecesPerPurchaseUnit || 1;

  // Compute final issue units based on chosen mode
  const effectiveIssueUnits =
    unitMode === 'BULK' ? Number(bulkQtyInput) * piecesPerBulk : Number(individualQtyInput);

  const isDeficit = effectiveIssueUnits > currentAvailableStock;
  const unitCostInIssue = selectedProduct?.costPerIssueUnit || 0;
  const totalIssueCost = effectiveIssueUnits * unitCostInIssue;
  const isUnderReorder = currentAvailableStock <= (selectedProduct?.reorderLevel || 0);

  const handleSaveInlineStaff = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newStaffName.trim()) return;
    const newEntry: DepartmentStaff = {
      id: `DEP-${Date.now().toString().slice(-4)}`,
      department: newDeptName.trim(),
      staffName: newStaffName.trim(),
      role: newStaffRole.trim() || 'Authorized Staff',
    };
    if (onRegisterNewStaff) {
      onRegisterNewStaff(newEntry);
    }
    setDepartment(newEntry.department);
    setAuthorizedBy(newEntry.staffName);
    setShowInlineStaff(false);
    setNewDeptName('');
    setNewStaffName('');
  };

  const handleApplyFEFO = () => {
    if (recommendedBatch) {
      setIssueFromBatch(recommendedBatch.batchNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const issueNumber = initialData?.issueNumber || `ISS-${nowYear}-${String(Math.floor(Math.random() * 900) + 100)}`;

    onAdd({
      issueNumber,
      dateIssued,
      department,
      sku,
      issuedUnitType: unitMode,
      bulkQuantityInput: unitMode === 'BULK' ? Number(bulkQtyInput) : undefined,
      qtyRequested: effectiveIssueUnits,
      qtyIssued: effectiveIssueUnits,
      issuedBy,
      authorizedBy,
      remarks,
      issueFromBatch: issueFromBatch || 'N/A',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              {initialData ? `Edit Requisition: ${initialData.issueNumber}` : 'Stock Issue / Department Requisition'}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Dual-Unit Engine: Issue in full bulk containers or loose individual units
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Issue Date</label>
              <input
                type="date"
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-mono">Department</label>
                <button
                  type="button"
                  onClick={() => setShowInlineStaff(!showInlineStaff)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer"
                >
                  {showInlineStaff ? 'Cancel' : '+ New Dept/Staff'}
                </button>
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                {Array.from(new Set(departments.map((d) => d.department))).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline Staff / Department Registration Section */}
          {showInlineStaff && (
            <div className="p-3 bg-slate-950/80 border border-emerald-500/40 rounded-lg space-y-2.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                  Register New Department &amp; Staff Member
                </span>
                <span className="text-[10px] text-slate-400">Added to roster dropdowns</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Department Name *"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                />
                <input
                  type="text"
                  placeholder="Staff Name *"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Lead QA)"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveInlineStaff}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Save &amp; Select Staff
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-mono">Product SKU</label>
              {/* Reorder Level indicator visible to all users */}
              <span className={`text-[11px] font-mono font-medium ${isUnderReorder ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                Reorder Threshold: {selectedProduct?.reorderLevel} {selectedProduct?.issueUnit}s {isUnderReorder ? '⚠️ (Below Reorder Level)' : ''}
              </span>
            </div>
            <select
              value={sku}
              disabled={!!initialData}
              onChange={(e) => {
                setSku(e.target.value);
                const rec = recommendFEFOBatch(e.target.value, batches);
                setIssueFromBatch(rec ? rec.batchNumber : 'N/A');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono disabled:opacity-60"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (Stock: {p.currentStock} {p.issueUnit}s / {p.stockDisplay})
                </option>
              ))}
            </select>
          </div>

          {/* DUAL-UNIT SELECTOR (CRITICAL REQUIREMENT) */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Requisition Unit Selection
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                Available: {currentAvailableStock} {selectedProduct?.issueUnit}s
              </span>
            </div>

            {/* Segmented Mode Button Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setUnitMode('INDIVIDUAL')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  unitMode === 'INDIVIDUAL'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Individual ({selectedProduct?.issueUnit}s)</span>
              </button>

              <button
                type="button"
                onClick={() => setUnitMode('BULK')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  unitMode === 'BULK'
                    ? 'bg-slate-800 text-sky-400 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Bulk ({selectedProduct?.purchaseUnit}s)</span>
              </button>
            </div>

            {/* Input Row based on chosen mode */}
            {unitMode === 'BULK' ? (
              <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sky-300 font-mono text-xs font-semibold">
                    Bulk Containers to Issue:
                  </label>
                  <span className="text-slate-400 text-[10px] font-mono">
                    1 {selectedProduct?.purchaseUnit} = {piecesPerBulk} {selectedProduct?.issueUnit}s
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={bulkQtyInput}
                    onChange={(e) => setBulkQtyInput(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-sky-600 rounded p-2 text-sky-300 font-bold font-mono text-sm"
                    required
                  />
                  <div className="text-slate-300 text-xs font-mono">
                    = <strong className="text-emerald-400 text-sm font-mono">{effectiveIssueUnits} {selectedProduct?.issueUnit}s</strong> total
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <label className="text-emerald-300 font-mono text-xs font-semibold block">
                  Individual Quantity to Issue ({selectedProduct?.issueUnit}s):
                </label>
                <input
                  type="number"
                  min="1"
                  value={individualQtyInput}
                  onChange={(e) => setIndividualQtyInput(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-600 rounded p-2 text-emerald-300 font-bold font-mono text-sm"
                  required
                />
              </div>
            )}

            {isDeficit && (
              <div className="text-red-400 text-[11px] font-mono flex items-center gap-1.5 p-2 bg-red-950/30 border border-red-800/50 rounded">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Warning: Requested {effectiveIssueUnits} {selectedProduct?.issueUnit}s exceeds available store stock ({currentAvailableStock})!
                </span>
              </div>
            )}
          </div>

          {/* FEFO Batch Allocation */}
          <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                FEFO Batch Allocation Queue
              </span>

              {recommendedBatch && (
                <button
                  type="button"
                  onClick={handleApplyFEFO}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono hover:bg-amber-500/30 cursor-pointer"
                >
                  ⚡ Auto-Assign Best FEFO
                </button>
              )}
            </div>

            <select
              value={issueFromBatch}
              onChange={(e) => setIssueFromBatch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
            >
              <option value="N/A">N/A (No Batch / Non-expiring Item)</option>
              {skuBatches.map((b) => {
                const isBest = recommendedBatch?.batchNumber === b.batchNumber;
                return (
                  <option key={b.batchNumber} value={b.batchNumber}>
                    {b.batchNumber} — Exp: {b.expiryDate || 'None'} ({b.qtyRemaining} units rem.) {isBest ? '★ RECOMMENDED FEFO' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Issued By</label>
              <select
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                {departments.map((st) => (
                  <option key={st.staffName} value={st.staffName}>
                    {st.staffName} ({st.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Authorized By</label>
              <select
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                {departments.map((st) => (
                  <option key={st.staffName} value={st.staffName}>
                    {st.staffName} ({st.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Purpose / Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="text-slate-400 font-mono">
              Total Cost: <strong className="text-slate-100">{formatCedis(totalIssueCost)}</strong>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs cursor-pointer"
              >
                {initialData ? 'Save Requisition Edits' : 'Issue Stock & Print Slip'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. ADD / EDIT ADJUSTMENT MODAL
export const AddAdjustmentModal: React.FC<
  BaseModalProps & {
    products: Product[];
    staff: DepartmentStaff[];
    onAdd: (adjustment: any) => void;
    initialData?: StockAdjustment | null;
  }
> = ({ isOpen, onClose, products, staff, onAdd, initialData }) => {
  const [sku, setSku] = useState(initialData?.sku || products[0]?.sku || 'SKU-001');
  const selectedProduct = products.find((p) => p.sku === sku) || products[0];

  const nowYear = new Date().getFullYear();
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment['adjustmentType']>(
    initialData?.adjustmentType || 'Physical Count'
  );
  const [actualQty, setActualQty] = useState(initialData?.actualQty || selectedProduct?.currentStock || 0);
  const [reason, setReason] = useState(initialData?.reason || 'Routine physical stock audit count');
  const [approvedBy, setApprovedBy] = useState(initialData?.approvedBy || staff[3]?.staffName || staff[0]?.staffName || 'Grace Ncube');

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setDate(initialData.date);
      setAdjustmentType(initialData.adjustmentType);
      setActualQty(initialData.actualQty);
      setReason(initialData.reason);
      setApprovedBy(initialData.approvedBy);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const systemQty = selectedProduct?.currentStock || 0;
  const variance = actualQty - systemQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjustmentNumber = initialData?.adjustmentNumber || `ADJ-${nowYear}-${String(Math.floor(Math.random() * 900) + 100)}`;
    onAdd({
      adjustmentNumber,
      date,
      sku,
      adjustmentType,
      systemQty,
      actualQty: Number(actualQty),
      reason,
      approvedBy,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 font-mono">
            {initialData ? `Edit Physical Stock Adjustment: ${initialData.adjustmentNumber}` : 'Record Physical Stock Count / Variance'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="Physical Count">Physical Count</option>
                <option value="Damage/Write-off">Damage/Write-off</option>
                <option value="Transfer In">Transfer In</option>
                <option value="Transfer Out">Transfer Out</option>
                <option value="Correction">Correction</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Target SKU</label>
            <select
              value={sku}
              disabled={!!initialData}
              onChange={(e) => {
                setSku(e.target.value);
                const p = products.find((x) => x.sku === e.target.value);
                if (p) setActualQty(p.currentStock);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono disabled:opacity-60"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name} (System: {p.currentStock} {p.issueUnit}s)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">System Qty</span>
              <span className="text-sm font-bold text-slate-300 font-mono">{systemQty}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Actual Count</span>
              <span className="text-sm font-bold text-sky-400 font-mono">{actualQty}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Variance</span>
              <span
                className={`text-sm font-bold font-mono ${
                  variance < 0 ? 'text-red-400' : variance > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {variance > 0 ? `+${variance}` : variance}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Physical / Verified Count</label>
            <input
              type="number"
              value={actualQty}
              onChange={(e) => setActualQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sky-300 font-mono font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Audit Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Approved By</label>
            <select
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            >
              {staff.map((st) => (
                <option key={st.staffName} value={st.staffName}>
                  {st.staffName} ({st.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs cursor-pointer"
            >
              {initialData ? 'Save Adjustment Edits' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

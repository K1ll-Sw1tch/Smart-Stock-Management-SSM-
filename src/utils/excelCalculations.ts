import * as XLSX from 'xlsx';
import {
  Product,
  StockReceipt,
  StockIssue,
  StockAdjustment,
  BatchItem,
  Supplier,
  DepartmentStaff,
  DashboardMetrics,
  UserAccount,
  AuditLogEntry,
  FormulaRule,
} from '../types/inventory';

// Currency standard for Ghana Cedi
export const CURRENCY_SYMBOL = 'GH₵';

export function formatCedis(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${CURRENCY_SYMBOL} 0.00`;
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Reference date for simulation / calculations
export function getDaysDiff(targetDateStr: string, baseDate: Date = new Date()): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const now = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffTime = targetDay.getTime() - now.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatStockDisplay(
  currentStock: number,
  purchaseUnit: string,
  issueUnit: string,
  piecesPerPurchaseUnit: number
): string {
  if (piecesPerPurchaseUnit > 1) {
    const bulk = Math.floor(currentStock / piecesPerPurchaseUnit);
    const loose = currentStock % piecesPerPurchaseUnit;
    return `${bulk} ${purchaseUnit}(s) + ${loose} ${issueUnit}(s)`;
  }
  return `${currentStock} ${issueUnit}(s)`;
}

export function computeBatchExpiryStatus(daysToExpiry: number | 'N/A', expiryDate: string): BatchItem['batchStatus'] {
  if (!expiryDate || daysToExpiry === 'N/A') return 'NO EXPIRY';
  if (daysToExpiry < 0) return 'EXPIRED';
  if (daysToExpiry <= 30) return 'CRITICAL';
  if (daysToExpiry <= 90) return 'WARNING';
  return 'OK';
}

export function recalculateAll(
  rawProducts: Array<any>,
  rawReceipts: Array<any>,
  rawIssues: Array<any>,
  rawAdjustments: Array<any>,
  historicalBatches: Array<any> = []
) {
  // 1. Process Receipts with conversions
  const receipts: StockReceipt[] = rawReceipts.map((rec) => {
    const prod = rawProducts.find((p) => p.sku === rec.sku);
    const piecesPerUnit = prod?.piecesPerPurchaseUnit || 1;
    const qtyInIssueUnits = Number(rec.qtyReceivedPurchase || 0) * piecesPerUnit;
    const unitCostPurchase = prod?.unitCostPurchase || 0;
    const totalCost = Number(rec.qtyReceivedPurchase || 0) * unitCostPurchase;

    let daysToExpiry: number | 'N/A' = 'N/A';
    let batchExpiryStatus: StockReceipt['batchExpiryStatus'] = 'NO EXPIRY';
    if (rec.expiryDate) {
      daysToExpiry = getDaysDiff(rec.expiryDate);
      if (daysToExpiry < 0) batchExpiryStatus = 'EXPIRED';
      else if (daysToExpiry <= 30) batchExpiryStatus = 'CRITICAL (<30 days)';
      else if (daysToExpiry <= 90) batchExpiryStatus = 'WARNING (<90 days)';
      else batchExpiryStatus = 'OK';
    }

    return {
      grnNumber: rec.grnNumber,
      dateReceived: rec.dateReceived,
      supplier: rec.supplier,
      sku: rec.sku,
      productName: prod?.name || rec.sku,
      purchaseUnit: prod?.purchaseUnit || 'Unit',
      qtyReceivedPurchase: Number(rec.qtyReceivedPurchase || 0),
      qtyInIssueUnits,
      unitCostPurchase,
      totalCost,
      invoicePoRef: rec.invoicePoRef || '',
      receivedBy: rec.receivedBy || '',
      remarks: rec.remarks || '',
      batchNumber: rec.batchNumber || (rec.expiryDate ? `BAT-${rec.dateReceived.split('-')[0]}-${rec.grnNumber.slice(-3)}` : 'N/A'),
      expiryDate: rec.expiryDate || '',
      daysToExpiry,
      batchExpiryStatus,
      isLocked: rec.isLocked || false,
      lastModifiedBy: rec.lastModifiedBy,
      lastModifiedAt: rec.lastModifiedAt,
    };
  });

  // 2. Build Batches from receipts + historical batches
  const batchListMap = new Map<string, BatchItem>();

  // Historical batches
  for (const hb of historicalBatches) {
    const days = hb.expiryDate ? getDaysDiff(hb.expiryDate) : 'N/A';
    batchListMap.set(hb.batchNumber, {
      batchNumber: hb.batchNumber,
      sku: hb.sku,
      productName: hb.productName,
      grnReference: hb.grnReference,
      dateReceived: hb.dateReceived,
      expiryDate: hb.expiryDate || '',
      qtyReceived: Number(hb.qtyReceived),
      qtyIssuedFromBatch: 0,
      qtyRemaining: Number(hb.qtyReceived),
      daysToExpiry: days,
      batchStatus: computeBatchExpiryStatus(days, hb.expiryDate),
      fefoPriority: 99998,
    });
  }

  // Batches from receipts
  for (const rec of receipts) {
    if (rec.batchNumber && rec.batchNumber !== 'N/A') {
      const days = rec.expiryDate ? getDaysDiff(rec.expiryDate) : 'N/A';
      batchListMap.set(rec.batchNumber, {
        batchNumber: rec.batchNumber,
        sku: rec.sku,
        productName: rec.productName,
        grnReference: rec.grnNumber,
        dateReceived: rec.dateReceived,
        expiryDate: rec.expiryDate || '',
        qtyReceived: rec.qtyInIssueUnits,
        qtyIssuedFromBatch: 0,
        qtyRemaining: rec.qtyInIssueUnits,
        daysToExpiry: days,
        batchStatus: computeBatchExpiryStatus(days, rec.expiryDate),
        fefoPriority: 99998,
      });
    }
  }

  // 3. Process Issues & deduct from batches
  const issues: StockIssue[] = rawIssues.map((iss) => {
    const prod = rawProducts.find((p) => p.sku === iss.sku);
    const costPerIssueUnit = prod && prod.piecesPerPurchaseUnit > 0 ? prod.unitCostPurchase / prod.piecesPerPurchaseUnit : 0;
    
    // Support dual-unit (bulk vs individual)
    let qtyIssued = Number(iss.qtyIssued || iss.qtyRequested || 0);
    if (iss.issuedUnitType === 'BULK' && iss.bulkQuantityInput && prod?.piecesPerPurchaseUnit) {
      qtyIssued = Number(iss.bulkQuantityInput) * prod.piecesPerPurchaseUnit;
    }

    const totalIssueCost = qtyIssued * costPerIssueUnit;
    const batch = batchListMap.get(iss.issueFromBatch);
    const batchExpiryDate = batch?.expiryDate || 'N/A';

    return {
      issueNumber: iss.issueNumber,
      dateIssued: iss.dateIssued,
      department: iss.department,
      sku: iss.sku,
      productName: prod?.name || iss.sku,
      issueUnit: prod?.issueUnit || 'Piece',
      issuedUnitType: iss.issuedUnitType || 'INDIVIDUAL',
      bulkQuantityInput: iss.bulkQuantityInput,
      qtyRequested: Number(iss.qtyRequested || qtyIssued),
      qtyIssued,
      availableStockBefore: 0,
      balanceAfter: 0,
      costPerIssueUnit,
      totalIssueCost,
      issuedBy: iss.issuedBy || '',
      authorizedBy: iss.authorizedBy || '',
      stockCheck: 'OK',
      remarks: iss.remarks || '',
      issueFromBatch: iss.issueFromBatch || 'N/A',
      batchExpiryDate,
      fefoCheck: 'N/A',
      isLocked: iss.isLocked || false,
      lastModifiedBy: iss.lastModifiedBy,
      lastModifiedAt: iss.lastModifiedAt,
    };
  });

  // Deduct batch usage from issues
  for (const iss of issues) {
    if (iss.issueFromBatch && iss.issueFromBatch !== 'N/A') {
      const b = batchListMap.get(iss.issueFromBatch);
      if (b) {
        b.qtyIssuedFromBatch += iss.qtyIssued;
        b.qtyRemaining = Math.max(0, b.qtyReceived - b.qtyIssuedFromBatch);
        if (b.qtyRemaining === 0) {
          b.batchStatus = 'DEPLETED';
        } else {
          b.batchStatus = computeBatchExpiryStatus(b.daysToExpiry, b.expiryDate);
        }
      }
    }
  }

  // Calculate FEFO Priority for all batches
  const batches = Array.from(batchListMap.values());
  const activeExpiringBatches = batches
    .filter((b) => b.qtyRemaining > 0 && b.expiryDate)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  batches.forEach((b) => {
    if (b.qtyRemaining === 0 || b.batchStatus === 'DEPLETED') {
      b.fefoPriority = 99999;
    } else if (!b.expiryDate) {
      b.fefoPriority = 99998;
    } else {
      const rank = activeExpiringBatches.findIndex((ab) => ab.batchNumber === b.batchNumber);
      b.fefoPriority = rank >= 0 ? rank + 1 : 99998;
    }
  });

  // Process Adjustments
  const adjustments: StockAdjustment[] = rawAdjustments.map((adj) => {
    const prod = rawProducts.find((p) => p.sku === adj.sku);
    const systemQty = Number(adj.systemQty || 0);
    const actualQty = Number(adj.actualQty || 0);
    const variance = actualQty - systemQty;

    return {
      adjustmentNumber: adj.adjustmentNumber,
      date: adj.date,
      sku: adj.sku,
      productName: prod?.name || adj.sku,
      adjustmentType: adj.adjustmentType,
      systemQty,
      actualQty,
      variance,
      reason: adj.reason || '',
      approvedBy: adj.approvedBy || '',
      lastModifiedBy: adj.lastModifiedBy,
      lastModifiedAt: adj.lastModifiedAt,
    };
  });

  // 4. Compute Product Master List formulas
  const products: Product[] = rawProducts.map((p) => {
    const costPerIssueUnit = p.piecesPerPurchaseUnit > 0 ? p.unitCostPurchase / p.piecesPerPurchaseUnit : 0;
    const totalReceived = receipts
      .filter((r) => r.sku === p.sku)
      .reduce((sum, r) => sum + r.qtyInIssueUnits, 0);
    const totalIssued = issues
      .filter((i) => i.sku === p.sku)
      .reduce((sum, i) => sum + i.qtyIssued, 0);
    const netAdjustments = adjustments
      .filter((a) => a.sku === p.sku)
      .reduce((sum, a) => sum + a.variance, 0);

    const currentStock = p.openingStock + totalReceived - totalIssued + netAdjustments;
    const stockDisplay = formatStockDisplay(currentStock, p.purchaseUnit, p.issueUnit, p.piecesPerPurchaseUnit);
    const stockValue = currentStock * costPerIssueUnit;

    let stockStatus: Product['stockStatus'] = 'OK';
    if (currentStock <= 0) {
      stockStatus = 'OUT OF STOCK';
    } else if (currentStock <= p.reorderLevel) {
      stockStatus = 'REORDER';
    }

    const skuBatchesWithStock = batches.filter(
      (b) => b.sku === p.sku && b.qtyRemaining > 0 && b.expiryDate
    );

    let earliestExpiryDate: string | 'NO EXPIRY' = 'NO EXPIRY';
    let daysToEarliestExpiry: number | 'N/A' = 'N/A';
    let expiryStatus: Product['expiryStatus'] = 'NO EXPIRY';
    let qtyExpiringWithin30Days = 0;
    let qtyExpiredStillInStock = 0;

    if (skuBatchesWithStock.length > 0) {
      skuBatchesWithStock.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      earliestExpiryDate = skuBatchesWithStock[0].expiryDate;
      daysToEarliestExpiry = getDaysDiff(earliestExpiryDate);

      if (daysToEarliestExpiry < 0) {
        expiryStatus = 'HAS EXPIRED STOCK';
      } else if (daysToEarliestExpiry <= 30) {
        expiryStatus = 'EXPIRING <30 DAYS';
      } else if (daysToEarliestExpiry <= 90) {
        expiryStatus = 'EXPIRING <90 DAYS';
      } else {
        expiryStatus = 'OK';
      }

      for (const b of skuBatchesWithStock) {
        const d = typeof b.daysToExpiry === 'number' ? b.daysToExpiry : 0;
        if (d < 0) {
          qtyExpiredStillInStock += b.qtyRemaining;
        } else if (d <= 30) {
          qtyExpiringWithin30Days += b.qtyRemaining;
        }
      }
    }

    return {
      ...p,
      costPerIssueUnit,
      totalReceived,
      totalIssued,
      netAdjustments,
      currentStock,
      stockDisplay,
      stockValue,
      stockStatus,
      earliestExpiryDate,
      daysToEarliestExpiry,
      expiryStatus,
      qtyExpiringWithin30Days,
      qtyExpiredStillInStock,
      lastModifiedBy: p.lastModifiedBy,
      lastModifiedAt: p.lastModifiedAt,
    };
  });

  // Re-verify issues with stock levels & FEFO
  for (const iss of issues) {
    const prod = products.find((p) => p.sku === iss.sku);
    iss.availableStockBefore = prod ? prod.currentStock + iss.qtyIssued : 0;
    iss.balanceAfter = iss.availableStockBefore - iss.qtyIssued;
    iss.stockCheck = iss.qtyIssued > iss.availableStockBefore ? 'EXCEEDS STOCK' : 'OK';

    if (!iss.issueFromBatch || iss.issueFromBatch === 'N/A') {
      iss.fefoCheck = 'N/A';
    } else {
      const eligibleBatches = batches
        .filter((b) => b.sku === iss.sku && b.expiryDate)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      if (eligibleBatches.length > 0) {
        const earliestBatch = eligibleBatches[0];
        if (iss.issueFromBatch === earliestBatch.batchNumber) {
          iss.fefoCheck = 'CORRECT (FEFO)';
        } else {
          iss.fefoCheck = 'USE OLDER BATCH FIRST';
        }
      } else {
        iss.fefoCheck = 'CORRECT (FEFO)';
      }
    }
  }

  // Dashboard Metrics
  const totalStockValue = products.reduce((acc, p) => acc + p.stockValue, 0);
  const itemsInStock = products.filter((p) => p.currentStock > 0).length;
  const itemsOutOfStock = products.filter((p) => p.currentStock <= 0).length;
  const itemsNeedingReorder = products.filter((p) => p.stockStatus === 'REORDER').length;
  const totalReceiptsValue = receipts.reduce((acc, r) => acc + r.totalCost, 0);
  const totalIssuesValue = issues.reduce((acc, i) => acc + i.totalIssueCost, 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthReceivedValue = receipts
    .filter((r) => {
      const d = new Date(r.dateReceived);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((acc, r) => acc + r.totalCost, 0);

  const thisMonthIssuedValue = issues
    .filter((i) => {
      const d = new Date(i.dateIssued);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((acc, i) => acc + i.totalIssueCost, 0);

  const itemsWithExpiredStock = products.filter((p) => p.expiryStatus === 'HAS EXPIRED STOCK').length;
  const itemsExpiring30Days = products.filter((p) => p.expiryStatus === 'EXPIRING <30 DAYS').length;
  const itemsExpiring90Days = products.filter((p) => p.expiryStatus === 'EXPIRING <90 DAYS').length;

  const totalQtyExpired = products.reduce((acc, p) => acc + p.qtyExpiredStillInStock, 0);
  const valueOfExpiredStock = products.reduce((acc, p) => acc + p.qtyExpiredStillInStock * p.costPerIssueUnit, 0);

  const urgentExpiryList = products
    .filter((p) => typeof p.daysToEarliestExpiry === 'number' && p.daysToEarliestExpiry <= 90)
    .sort((a, b) => (a.daysToEarliestExpiry as number) - (b.daysToEarliestExpiry as number))
    .slice(0, 10)
    .map((p) => ({
      sku: p.sku,
      productName: p.name,
      earliestExpiryDate: p.earliestExpiryDate,
      daysLeft: p.daysToEarliestExpiry as number,
      qtyAtRisk: p.qtyExpiringWithin30Days + p.qtyExpiredStillInStock,
      status: p.expiryStatus,
    }));

  const metrics: DashboardMetrics = {
    totalSkus: products.length,
    totalStockValue,
    itemsInStock,
    itemsOutOfStock,
    itemsNeedingReorder,
    totalReceipts: receipts.length,
    totalReceiptsValue,
    totalIssues: issues.length,
    totalIssuesValue,
    thisMonthReceivedValue,
    thisMonthIssuedValue,
    itemsWithExpiredStock,
    itemsExpiring30Days,
    itemsExpiring90Days,
    totalQtyExpired,
    valueOfExpiredStock,
    urgentExpiryList,
  };

  return {
    products,
    receipts,
    issues,
    adjustments,
    batches,
    metrics,
  };
}

export function recommendFEFOBatch(sku: string, batches: BatchItem[]): BatchItem | null {
  const eligible = batches
    .filter((b) => b.sku === sku && b.qtyRemaining > 0 && b.expiryDate)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  if (eligible.length > 0) {
    return eligible[0];
  }
  const nonExpiring = batches.find((b) => b.sku === sku && b.qtyRemaining > 0);
  return nonExpiring || null;
}

export function downloadWorkbookXLSX(data: {
  products: Product[];
  receipts: StockReceipt[];
  issues: StockIssue[];
  adjustments: StockAdjustment[];
  batches: BatchItem[];
  suppliers: Supplier[];
  departments: DepartmentStaff[];
  metrics: DashboardMetrics;
  users?: UserAccount[];
  auditLogs?: AuditLogEntry[];
}) {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Master List
  const masterData = data.products.map((p) => ({
    'SKU': p.sku,
    'Product Name': p.name,
    'Category': p.category,
    'Purchase Unit': p.purchaseUnit,
    'Pieces Per Bulk': p.piecesPerPurchaseUnit,
    'Issue Unit': p.issueUnit,
    'Reorder Level (Issue Units)': p.reorderLevel,
    'Preferred Supplier': p.preferredSupplier,
    'Unit Cost Purchase (GH₵)': p.unitCostPurchase,
    'Cost Per Issue Unit (GH₵)': p.costPerIssueUnit,
    'Opening Stock (Issue Units)': p.openingStock,
    'Total Received': p.totalReceived,
    'Total Issued': p.totalIssued,
    'Net Adjustments': p.netAdjustments,
    'Current Stock': p.currentStock,
    'Stock Packaging Display': p.stockDisplay,
    'Stock Value (GH₵)': p.stockValue,
    'Stock Status': p.stockStatus,
    'Earliest Expiry Date': p.earliestExpiryDate,
    'Days to Expiry': p.daysToEarliestExpiry,
    'Expiry Status': p.expiryStatus,
    'Qty Expiring <30d': p.qtyExpiringWithin30Days,
    'Qty Expired in Stock': p.qtyExpiredStillInStock,
  }));
  const ws1 = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Master List');

  // SHEET 2: Stock Received
  const receiptsData = data.receipts.map((r) => ({
    'GRN Number': r.grnNumber,
    'Date Received': r.dateReceived,
    'Supplier': r.supplier,
    'SKU': r.sku,
    'Product Name': r.productName,
    'Purchase Unit': r.purchaseUnit,
    'Qty Received Bulk': r.qtyReceivedPurchase,
    'Qty in Issue Units': r.qtyInIssueUnits,
    'Unit Cost Purchase (GH₵)': r.unitCostPurchase,
    'Total Cost (GH₵)': r.totalCost,
    'Invoice/PO Ref': r.invoicePoRef,
    'Received By': r.receivedBy,
    'Remarks': r.remarks,
    'Batch Number': r.batchNumber,
    'Expiry Date': r.expiryDate || 'N/A',
    'Days to Expiry': r.daysToExpiry,
    'Batch Expiry Status': r.batchExpiryStatus,
  }));
  const ws2 = XLSX.utils.json_to_sheet(receiptsData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Stock Received');

  // SHEET 3: Stock Issued
  const issuesData = data.issues.map((i) => ({
    'Issue Number': i.issueNumber,
    'Date Issued': i.dateIssued,
    'Department': i.department,
    'SKU': i.sku,
    'Product Name': i.productName,
    'Issue Unit': i.issueUnit,
    'Requisition Mode': i.issuedUnitType || 'INDIVIDUAL',
    'Qty Issued': i.qtyIssued,
    'Stock Before Issue': i.availableStockBefore,
    'Balance After Issue': i.balanceAfter,
    'Cost Per Issue Unit (GH₵)': i.costPerIssueUnit,
    'Total Issue Cost (GH₵)': i.totalIssueCost,
    'Issued By': i.issuedBy,
    'Authorized By': i.authorizedBy,
    'Stock Check': i.stockCheck,
    'Remarks': i.remarks,
    'Issue From Batch': i.issueFromBatch,
    'Batch Expiry Date': i.batchExpiryDate,
    'FEFO Check': i.fefoCheck,
  }));
  const ws3 = XLSX.utils.json_to_sheet(issuesData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Stock Issued');

  // SHEET 4: Stock Adjustments
  const adjustmentsData = data.adjustments.map((a) => ({
    'Adjustment Number': a.adjustmentNumber,
    'Date': a.date,
    'SKU': a.sku,
    'Product Name': a.productName,
    'Adjustment Type': a.adjustmentType,
    'System Qty': a.systemQty,
    'Actual Qty': a.actualQty,
    'Variance': a.variance,
    'Reason': a.reason,
    'Approved By': a.approvedBy,
  }));
  const ws4 = XLSX.utils.json_to_sheet(adjustmentsData);
  XLSX.utils.book_append_sheet(wb, ws4, 'Stock Adjustments');

  // SHEET 5: Batch Tracker
  const batchData = data.batches.map((b) => ({
    'Batch Number': b.batchNumber,
    'SKU': b.sku,
    'Product Name': b.productName,
    'GRN Reference': b.grnReference,
    'Date Received': b.dateReceived,
    'Expiry Date': b.expiryDate || 'N/A',
    'Qty Received': b.qtyReceived,
    'Qty Issued From Batch': b.qtyIssuedFromBatch,
    'Qty Remaining': b.qtyRemaining,
    'Days to Expiry': b.daysToExpiry,
    'Batch Status': b.batchStatus,
    'FEFO Priority': b.fefoPriority,
  }));
  const ws5 = XLSX.utils.json_to_sheet(batchData);
  XLSX.utils.book_append_sheet(wb, ws5, 'Batch Tracker');

  // SHEET 6: Suppliers
  const suppliersData = data.suppliers.map((s) => ({
    'Supplier Name': s.name,
    'Contact Person': s.contactPerson || '',
    'Email': s.email || '',
    'Phone': s.phone || '',
    'Category': s.category || '',
  }));
  const ws6 = XLSX.utils.json_to_sheet(suppliersData);
  XLSX.utils.book_append_sheet(wb, ws6, 'Suppliers');

  // SHEET 7: Departments
  const deptData = data.departments.map((d) => ({
    'Department': d.department,
    'Staff Name': d.staffName,
    'Role': d.role || '',
  }));
  const ws7 = XLSX.utils.json_to_sheet(deptData);
  XLSX.utils.book_append_sheet(wb, ws7, 'Departments');

  // SHEET 8: Dashboard & Financials
  const dashboardData = [
    { 'Metric / Section': '=== SMARTSTOCK ERP INVENTORY AUDIT ===', 'Value': '' },
    { 'Metric / Section': 'Currency', 'Value': 'Ghanaian Cedi (GH₵)' },
    { 'Metric / Section': 'Last Updated', 'Value': new Date().toLocaleString() },
    { 'Metric / Section': 'Total SKUs', 'Value': data.metrics.totalSkus },
    { 'Metric / Section': 'Total Stock Value (GH₵)', 'Value': data.metrics.totalStockValue.toFixed(2) },
    { 'Metric / Section': 'Items In Stock', 'Value': data.metrics.itemsInStock },
    { 'Metric / Section': 'Items Out of Stock', 'Value': data.metrics.itemsOutOfStock },
    { 'Metric / Section': 'Items Needing Reorder', 'Value': data.metrics.itemsNeedingReorder },
    { 'Metric / Section': 'Total Receipts Value (GH₵)', 'Value': data.metrics.totalReceiptsValue.toFixed(2) },
    { 'Metric / Section': 'Total Issues Value (GH₵)', 'Value': data.metrics.totalIssuesValue.toFixed(2) },
    { 'Metric / Section': 'Items Expired in Stock', 'Value': data.metrics.itemsWithExpiredStock },
    { 'Metric / Section': 'Value of Expired Stock (GH₵)', 'Value': data.metrics.valueOfExpiredStock.toFixed(2) },
  ];
  const ws8 = XLSX.utils.json_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, ws8, 'Dashboard');

  // SHEET 9: Audit Trail
  if (data.auditLogs && data.auditLogs.length > 0) {
    const auditData = data.auditLogs.map((l) => ({
      'Log ID': l.id,
      'Timestamp': l.timestamp,
      'User': l.userName,
      'Role': l.userRole,
      'Action': l.action,
      'Entity': l.entity,
      'Entity Ref': l.entityId,
      'Summary': l.summary,
    }));
    const ws9 = XLSX.utils.json_to_sheet(auditData);
    XLSX.utils.book_append_sheet(wb, ws9, 'Audit Trail');
  }

  // Write file
  XLSX.writeFile(wb, 'SmartStock_ERP_Inventory_Ghana.xlsx');
}

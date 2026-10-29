export type UserRole = 'ADMIN' | 'STAFF';

export interface UserAccount {
  id: string;
  username: string; // Unique username set exclusively by Admin
  name: string;
  role: UserRole;
  pin: string; // 4-digit PIN
  pinChangedByUser: boolean; // true = hidden from Admin (shows '••••')
  department: string;
  avatarInitials: string;
  createdAt: string;
  active: boolean;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'FORMULA_CHANGE' | 'LOGIN' | 'REVERT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entity: 'PRODUCT' | 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'SUPPLIER' | 'DEPARTMENT' | 'USER' | 'FORMULA';
  entityId: string;
  entityName: string;
  summary: string;
  details?: string;
  previousState?: any; // Snapshot before mutation for 1-click restore
  newState?: any;      // Snapshot after mutation
  isReverted?: boolean;
}

export interface SystemResetProposal {
  id: string;
  requestedByAdminId: string;
  requestedByAdminName: string;
  requestedAt: string;
  approvedAdminIds: string[]; // All admin IDs required to trigger reset
  status: 'PENDING' | 'REJECTED' | 'EXECUTED';
}

export interface FormulaRule {
  id: string;
  code: string;
  name: string;
  sheet: string;
  column: string;
  formula: string;
  description: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  purchaseUnit: string; // Box, Ream, Pack, Carton, Drum, Each
  piecesPerPurchaseUnit: number;
  issueUnit: string; // Piece, Sheet, Pair, Drum, Each, Litre
  reorderLevel: number; // in issue units
  preferredSupplier: string;
  unitCostPurchase: number; // in GH₵
  openingStock: number; // in issue units
  // Computed values
  costPerIssueUnit: number; // UnitCost / PiecesPerPurchaseUnit
  totalReceived: number; // in issue units
  totalIssued: number; // in issue units
  netAdjustments: number; // in issue units
  currentStock: number; // Opening + Received - Issued + Adjustments
  stockDisplay: string; // e.g. "6 Box(es) + 30 Piece(s)"
  stockValue: number; // currentStock * costPerIssueUnit (in GH₵)
  stockStatus: 'OK' | 'REORDER' | 'OUT OF STOCK';
  earliestExpiryDate: string | 'NO EXPIRY';
  daysToEarliestExpiry: number | 'N/A';
  expiryStatus: 'NO EXPIRY' | 'HAS EXPIRED STOCK' | 'EXPIRING <30 DAYS' | 'EXPIRING <90 DAYS' | 'OK';
  qtyExpiringWithin30Days: number;
  qtyExpiredStillInStock: number;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface StockReceipt {
  grnNumber: string; // GRN-YYYY-XXXX
  dateReceived: string; // YYYY-MM-DD
  supplier: string;
  sku: string;
  productName: string;
  purchaseUnit: string;
  qtyReceivedPurchase: number;
  qtyInIssueUnits: number; // Conversion: qtyReceivedPurchase * piecesPerPurchaseUnit
  unitCostPurchase: number; // in GH₵
  totalCost: number; // qtyReceivedPurchase * unitCostPurchase (in GH₵)
  invoicePoRef: string;
  receivedBy: string;
  remarks: string;
  batchNumber: string; // BAT-YYYY-XXX or N/A
  expiryDate: string; // YYYY-MM-DD or empty
  daysToExpiry: number | 'N/A';
  batchExpiryStatus: 'NO EXPIRY' | 'EXPIRED' | 'CRITICAL (<30 days)' | 'WARNING (<90 days)' | 'OK';
  isLocked?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface StockIssue {
  issueNumber: string; // ISS-YYYY-XXXX
  dateIssued: string; // YYYY-MM-DD
  department: string;
  sku: string;
  productName: string;
  issueUnit: string;
  issuedUnitType?: 'BULK' | 'INDIVIDUAL';
  bulkQuantityInput?: number;
  qtyRequested: number;
  qtyIssued: number; // in issue units
  availableStockBefore: number;
  balanceAfter: number;
  costPerIssueUnit: number; // in GH₵
  totalIssueCost: number; // qtyIssued * costPerIssueUnit (in GH₵)
  issuedBy: string;
  authorizedBy: string;
  stockCheck: 'OK' | 'EXCEEDS STOCK';
  remarks: string;
  issueFromBatch: string; // BAT-XXXX or N/A
  batchExpiryDate: string;
  fefoCheck: 'CORRECT (FEFO)' | 'USE OLDER BATCH FIRST' | 'N/A';
  isLocked?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface StockAdjustment {
  adjustmentNumber: string; // ADJ-YYYY-XXXX
  date: string;
  sku: string;
  productName: string;
  adjustmentType: 'Physical Count' | 'Damage/Write-off' | 'Transfer In' | 'Transfer Out' | 'Correction';
  systemQty: number;
  actualQty: number;
  variance: number; // actualQty - systemQty
  reason: string;
  approvedBy: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface BatchItem {
  batchNumber: string;
  sku: string;
  productName: string;
  grnReference: string;
  dateReceived: string;
  expiryDate: string;
  qtyReceived: number; // in issue units
  qtyIssuedFromBatch: number; // in issue units
  qtyRemaining: number; // in issue units
  daysToExpiry: number | 'N/A';
  batchStatus: 'DEPLETED' | 'NO EXPIRY' | 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK';
  fefoPriority: number; // 1 = earliest expiry
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface DepartmentStaff {
  id?: string;
  department: string;
  staffName: string;
  role?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface DashboardMetrics {
  totalSkus: number;
  totalStockValue: number; // in GH₵
  itemsInStock: number;
  itemsOutOfStock: number;
  itemsNeedingReorder: number;
  totalReceipts: number;
  totalReceiptsValue: number; // in GH₵
  totalIssues: number;
  totalIssuesValue: number; // in GH₵
  thisMonthReceivedValue: number; // in GH₵
  thisMonthIssuedValue: number; // in GH₵
  itemsWithExpiredStock: number;
  itemsExpiring30Days: number;
  itemsExpiring90Days: number;
  totalQtyExpired: number;
  valueOfExpiredStock: number; // in GH₵
  urgentExpiryList: Array<{
    sku: string;
    productName: string;
    earliestExpiryDate: string;
    daysLeft: number;
    qtyAtRisk: number;
    status: string;
  }>;
}

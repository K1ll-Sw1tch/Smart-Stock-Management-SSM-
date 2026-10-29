import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_SUPPLIERS,
  INITIAL_DEPARTMENTS_STAFF,
  INITIAL_RAW_PRODUCTS,
  INITIAL_RAW_RECEIPTS,
  INITIAL_RAW_ISSUES,
  INITIAL_RAW_ADJUSTMENTS,
  HISTORICAL_BATCHES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from './data/seedData';
import { VBA_MACROS } from './data/vbaCodeContent';
import {
  recalculateAll,
  downloadWorkbookXLSX,
  recommendFEFOBatch,
} from './utils/excelCalculations';
import { ErpSidebar, ErpModuleId } from './components/navigation/ErpSidebar';
import { ErpTopBar } from './components/navigation/ErpTopBar';
import { LoginScreen } from './components/auth/LoginScreen';
import { ChangePinModal } from './components/auth/ChangePinModal';
import { PinLoginModal } from './components/auth/PinLoginModal';
import { UserManagementModule } from './components/modules/UserManagementModule';
import { AuditLogModule } from './components/modules/AuditLogModule';
import { StockReceivedSheet } from './components/sheets/StockReceivedSheet';
import { StockIssuedSheet } from './components/sheets/StockIssuedSheet';
import { StockAdjustmentsSheet } from './components/sheets/StockAdjustmentsSheet';
import { BatchTrackerSheet } from './components/sheets/BatchTrackerSheet';
import { DashboardSheet } from './components/sheets/DashboardSheet';
import { VBACodeSheet } from './components/sheets/VBACodeSheet';
import { IssueVoucherModal } from './components/modals/IssueVoucherModal';
import { ExpiryAlertModal } from './components/modals/ExpiryAlertModal';
import { ProductSpecsModal } from './components/modals/ProductSpecsModal';
import {
  AddReceiptModal,
  AddIssueModal,
  AddAdjustmentModal,
} from './components/modals/DataEntryModals';
import {
  Product,
  StockReceipt,
  StockIssue,
  StockAdjustment,
  Supplier,
  DepartmentStaff,
  UserAccount,
  AuditLogEntry,
  AuditAction,
  SystemResetProposal,
} from './types/inventory';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const STORAGE_KEY = 'smartstock_erp_ghana_v3';

export default function App() {
  // Session & Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_logged_in`);
    return saved === 'true';
  });

  // Multi-Admin Consensus Reset State
  const [resetProposal, setResetProposal] = useState<SystemResetProposal | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reset_proposal`);
    return saved ? JSON.parse(saved) : null;
  });

  // Immutable Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Operational Inventory Data
  const [rawProducts, setRawProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_RAW_PRODUCTS;
  });

  const [rawReceipts, setRawReceipts] = useState<any[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_receipts`);
    return saved ? JSON.parse(saved) : INITIAL_RAW_RECEIPTS;
  });

  const [rawIssues, setRawIssues] = useState<any[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_issues`);
    return saved ? JSON.parse(saved) : INITIAL_RAW_ISSUES;
  });

  const [rawAdjustments, setRawAdjustments] = useState<any[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_adjustments`);
    return saved ? JSON.parse(saved) : INITIAL_RAW_ADJUSTMENTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [departments, setDepartments] = useState<DepartmentStaff[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS_STAFF;
  });

  // Ergonomic Navigation & UI Layout State
  const [activeModule, setActiveModule] = useState<ErpModuleId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Toast Feedback System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals Management State
  const [showSwitchUserModal, setShowSwitchUserModal] = useState<boolean>(false);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [showExpiryAlertModal, setShowExpiryAlertModal] = useState<boolean>(false);
  const [showProductSpecsModal, setShowProductSpecsModal] = useState<boolean>(false);
  const [selectedIssueForVoucher, setSelectedIssueForVoucher] = useState<StockIssue | null>(null);

  // Transaction Modals
  const [showAddReceiptModal, setShowAddReceiptModal] = useState<boolean>(false);
  const [editingReceipt, setEditingReceipt] = useState<StockReceipt | null>(null);

  const [showAddIssueModal, setShowAddIssueModal] = useState<boolean>(false);
  const [editingIssue, setEditingIssue] = useState<StockIssue | null>(null);

  const [showAddAdjustmentModal, setShowAddAdjustmentModal] = useState<boolean>(false);
  const [editingAdjustment, setEditingAdjustment] = useState<StockAdjustment | null>(null);

  const [preselectedSku, setPreselectedSku] = useState<string | undefined>(undefined);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    localStorage.setItem(`${STORAGE_KEY}_is_logged_in`, String(isLoggedIn));
    localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(rawProducts));
    localStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(rawReceipts));
    localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify(rawIssues));
    localStorage.setItem(`${STORAGE_KEY}_adjustments`, JSON.stringify(rawAdjustments));
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
    if (resetProposal) {
      localStorage.setItem(`${STORAGE_KEY}_reset_proposal`, JSON.stringify(resetProposal));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_reset_proposal`);
    }
  }, [
    users,
    currentUser,
    isLoggedIn,
    auditLogs,
    rawProducts,
    rawReceipts,
    rawIssues,
    rawAdjustments,
    suppliers,
    departments,
    resetProposal,
  ]);

  // Recalculate full workbook logic invisibly in backend
  const { products, receipts, issues, adjustments, batches, metrics } = useMemo(() => {
    return recalculateAll(rawProducts, rawReceipts, rawIssues, rawAdjustments, HISTORICAL_BATCHES);
  }, [rawProducts, rawReceipts, rawIssues, rawAdjustments]);

  // Audit Logging Engine with State Snapshots for Rollback
  const logAudit = (
    action: AuditAction,
    entity: AuditLogEntry['entity'],
    entityId: string,
    entityName: string,
    summary: string,
    details?: string,
    previousState?: any,
    newState?: any
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      entityName,
      summary,
      details,
      previousState,
      newState,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Full-Screen Login & Authentication Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    logAudit('LOGIN', 'USER', user.id, user.name, `${user.name} (@${user.username}) logged in.`);
    showToast(`Welcome back, ${user.name} (${user.role === 'ADMIN' ? 'Super Admin' : 'Storekeeper'})`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Logged out of SmartStock ERP terminal session.', 'info');
  };

  const handleChangePin = (newPin: string) => {
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id
        ? { ...u, pin: newPin, pinChangedByUser: true }
        : u
    );
    setUsers(updatedUsers);
    setCurrentUser((prev) => ({
      ...prev,
      pin: newPin,
      pinChangedByUser: true,
    }));
    logAudit(
      'UPDATE',
      'USER',
      currentUser.id,
      currentUser.name,
      `User ${currentUser.name} updated their private security PIN.`
    );
    showToast('Your security PIN has been updated and is masked from Administrator views.', 'success');
  };

  const handleSelectUserFromSwitcher = (user: UserAccount) => {
    setCurrentUser(user);
    setShowSwitchUserModal(false);
    logAudit('LOGIN', 'USER', user.id, user.name, `Terminal switched to: ${user.name} (@${user.username})`);
    showToast(`Switched terminal session to: ${user.name} (${user.role})`, 'success');
  };

  // Download real .xlsx workbook containing all sheets in Ghanaian Cedis (GH₵)
  const handleDownloadXlsx = () => {
    downloadWorkbookXLSX({
      products,
      receipts,
      issues,
      adjustments,
      batches,
      suppliers,
      departments,
      metrics,
      users,
      auditLogs,
    });
    showToast('Downloaded SmartStock_ERP_Inventory_Ghana.xlsx with full sheets and GH₵ valuations!', 'success');
  };

  // Cell selection no-op (formulas execute silently in background)
  const handleSelectCell = () => {
    // Background formula execution only
  };

  // Admin User Management Handlers
  const handleAddUser = (newUser: UserAccount) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Super Admin authorization required to setup users.', 'warning');
      return;
    }
    setUsers((prev) => [...prev, newUser]);
    logAudit(
      'CREATE',
      'USER',
      newUser.id,
      newUser.name,
      `Admin setup new user: ${newUser.name} (@${newUser.username}) [${newUser.role}]`,
      undefined,
      undefined,
      newUser
    );
    showToast(`User ${newUser.name} (@${newUser.username}) created.`, 'success');
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Super Admin authorization required to edit users.', 'warning');
      return;
    }
    const prevUser = users.find((u) => u.id === updatedUser.id);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    logAudit(
      'UPDATE',
      'USER',
      updatedUser.id,
      updatedUser.name,
      `Admin modified user profile for ${updatedUser.name} (@${updatedUser.username})`,
      undefined,
      prevUser,
      updatedUser
    );
    showToast(`User ${updatedUser.name} updated.`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Super Admin authorization required to delete users.', 'warning');
      return;
    }
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit(
      'DELETE',
      'USER',
      userId,
      target?.name || '',
      `Admin deleted user profile: ${target?.name || userId}`,
      undefined,
      target,
      undefined
    );
    showToast(`User ${target?.name || userId} deleted.`, 'info');
  };

  // Multi-Admin Consensus System Reset Logic
  const handleProposeReset = () => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Only Administrators can initiate a system reset proposal.', 'warning');
      return;
    }
    const newProposal: SystemResetProposal = {
      id: `RST-${Date.now().toString().slice(-4)}`,
      requestedByAdminId: currentUser.id,
      requestedByAdminName: currentUser.name,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      approvedAdminIds: [currentUser.id],
      status: 'PENDING',
    };
    setResetProposal(newProposal);
    logAudit(
      'UPDATE',
      'USER',
      newProposal.id,
      'System Reset Proposal',
      `Admin ${currentUser.name} initiated a complete system reset proposal. Awaiting sign-off from all registered Admins.`
    );
    showToast('System Reset proposal initiated. Consensus required from all Admins.', 'info');
  };

  const handleApproveReset = (pin: string) => {
    if (currentUser.role !== 'ADMIN') return;
    if (currentUser.pin !== pin) {
      showToast('Incorrect Administrator PIN.', 'warning');
      return;
    }
    if (!resetProposal) return;

    const updatedApprovals = Array.from(new Set([...resetProposal.approvedAdminIds, currentUser.id]));
    const updatedProposal: SystemResetProposal = {
      ...resetProposal,
      approvedAdminIds: updatedApprovals,
    };
    setResetProposal(updatedProposal);

    logAudit(
      'UPDATE',
      'USER',
      resetProposal.id,
      'Reset Authorization',
      `Administrator ${currentUser.name} signed off on the system reset proposal.`
    );

    const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.active);
    if (updatedApprovals.length >= activeAdmins.length) {
      showToast('Unanimous Administrator consensus achieved! Ready to execute complete system reset.', 'success');
    } else {
      showToast(`Sign-off recorded (${updatedApprovals.length} of ${activeAdmins.length} Admins).`, 'info');
    }
  };

  const handleRejectReset = () => {
    if (currentUser.role !== 'ADMIN') return;
    if (!resetProposal) return;
    logAudit(
      'UPDATE',
      'USER',
      resetProposal.id,
      'Reset Proposal Cancelled',
      `Administrator ${currentUser.name} cancelled the system reset proposal.`
    );
    setResetProposal(null);
    showToast('System reset proposal cancelled.', 'info');
  };

  const handleExecuteReset = () => {
    if (currentUser.role !== 'ADMIN') return;
    const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.active);
    if (!resetProposal || resetProposal.approvedAdminIds.length < activeAdmins.length) {
      showToast('Cannot execute reset without 100% Admin consensus sign-off.', 'warning');
      return;
    }

    // Complete factory reset: purge transaction logs and restore clean roster
    setRawProducts(INITIAL_RAW_PRODUCTS);
    setRawReceipts([]);
    setRawIssues([]);
    setRawAdjustments([]);
    setSuppliers(INITIAL_SUPPLIERS);
    setDepartments(INITIAL_DEPARTMENTS_STAFF);

    const resetAudit: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'UPDATE',
      entity: 'USER',
      entityId: 'FACTORY_RESET',
      entityName: 'Consensus Reset',
      summary: `Complete factory reset executed following unanimous consensus of all ${activeAdmins.length} Administrators. Operational tables purged.`,
    };
    setAuditLogs([resetAudit]);
    setResetProposal(null);
    showToast('Complete system reset executed! All inventory tables reset with consensus.', 'success');
  };

  // Reorder Level Governance (Admin Only Editing, Visible to All)
  const handleUpdateProductSpecs = (sku: string, reorderLevel: number, unitCostPurchase: number) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Only Administrators can edit safety reorder levels and unit purchase costs.', 'warning');
      return;
    }
    const prevProd = rawProducts.find((p) => p.sku === sku);
    setRawProducts((prev) =>
      prev.map((p) =>
        p.sku === sku
          ? {
              ...p,
              reorderLevel,
              unitCostPurchase,
              lastModifiedBy: currentUser.name,
              lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : p
      )
    );
    logAudit(
      'UPDATE',
      'PRODUCT',
      sku,
      prevProd?.name || sku,
      `Admin updated specifications: Reorder Level = ${reorderLevel}, Unit Cost = GH₵ ${unitCostPurchase.toFixed(2)}`,
      `Previous Reorder: ${prevProd?.reorderLevel}, Previous Cost: GH₵ ${prevProd?.unitCostPurchase}`,
      prevProd,
      { ...prevProd, reorderLevel, unitCostPurchase }
    );
    showToast(`Updated product specifications for ${sku}`, 'success');
  };

  // Dynamic In-Context Creation Handlers
  const handleRegisterNewProduct = (newProd: any) => {
    setRawProducts((prev) => [
      ...prev,
      {
        ...newProd,
        lastModifiedBy: currentUser.name,
        lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
    ]);
    logAudit(
      'CREATE',
      'PRODUCT',
      newProd.sku,
      newProd.name,
      `Registered new SKU ${newProd.sku} (${newProd.name}) directly from GRN popup`,
      `Unit: 1 ${newProd.purchaseUnit} = ${newProd.piecesPerPurchaseUnit} ${newProd.issueUnit}s`,
      undefined,
      newProd
    );
    showToast(`Product ${newProd.sku} (${newProd.name}) added to catalog.`, 'success');
  };

  const handleRegisterNewSupplier = (newSup: Supplier) => {
    setSuppliers((prev) => [...prev, newSup]);
    logAudit(
      'CREATE',
      'SUPPLIER',
      newSup.id,
      newSup.name,
      `Registered new supplier ${newSup.name} directly from GRN popup`,
      undefined,
      undefined,
      newSup
    );
    showToast(`Supplier ${newSup.name} added to directory.`, 'success');
  };

  const handleRegisterNewStaff = (newStaff: DepartmentStaff) => {
    setDepartments((prev) => [...prev, newStaff]);
    logAudit(
      'CREATE',
      'DEPARTMENT',
      newStaff.department,
      newStaff.staffName,
      `Registered new staff ${newStaff.staffName} (${newStaff.department}) directly from requisition popup`,
      undefined,
      undefined,
      newStaff
    );
    showToast(`Staff ${newStaff.staffName} (${newStaff.department}) registered.`, 'success');
  };

  // GOODS RECEIPT CRUD (All users can edit/delete data rows)
  const handleSaveReceipt = (recData: any) => {
    if (editingReceipt) {
      setRawReceipts((prev) =>
        prev.map((r) =>
          r.grnNumber === editingReceipt.grnNumber
            ? {
                ...r,
                ...recData,
                lastModifiedBy: currentUser.name,
                lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              }
            : r
        )
      );
      logAudit(
        'UPDATE',
        'RECEIPT',
        recData.grnNumber,
        recData.sku,
        `Modified GRN ${recData.grnNumber} details`,
        undefined,
        editingReceipt,
        recData
      );
      showToast(`Saved modifications to ${recData.grnNumber}`, 'success');
    } else {
      setRawReceipts((prev) => [
        ...prev,
        {
          ...recData,
          lastModifiedBy: currentUser.name,
          lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      ]);
      logAudit(
        'CREATE',
        'RECEIPT',
        recData.grnNumber,
        recData.sku,
        `Received ${recData.qtyReceivedPurchase} bulk units under ${recData.grnNumber}`,
        undefined,
        undefined,
        recData
      );
      showToast(`Stock received under ${recData.grnNumber}`, 'success');
    }
    setEditingReceipt(null);
  };

  const handleDeleteReceipt = (grnNumber: string) => {
    const target = rawReceipts.find((r) => r.grnNumber === grnNumber);
    setRawReceipts((prev) => prev.filter((r) => r.grnNumber !== grnNumber));
    logAudit(
      'DELETE',
      'RECEIPT',
      grnNumber,
      target?.sku || '',
      `Deleted goods receipt note ${grnNumber}`,
      undefined,
      target,
      undefined
    );
    showToast(`Deleted receipt ${grnNumber}`, 'info');
  };

  // REQUISITION / STOCK ISSUE CRUD (Dual-Unit support)
  const handleSaveIssue = (issueData: any) => {
    if (editingIssue) {
      setRawIssues((prev) =>
        prev.map((i) =>
          i.issueNumber === editingIssue.issueNumber
            ? {
                ...i,
                ...issueData,
                lastModifiedBy: currentUser.name,
                lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              }
            : i
        )
      );
      logAudit(
        'UPDATE',
        'ISSUE',
        issueData.issueNumber,
        issueData.sku,
        `Modified stock requisition ${issueData.issueNumber}`,
        undefined,
        editingIssue,
        issueData
      );
      showToast(`Updated requisition ${issueData.issueNumber}`, 'success');
    } else {
      setRawIssues((prev) => [
        ...prev,
        {
          ...issueData,
          lastModifiedBy: currentUser.name,
          lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      ]);
      logAudit(
        'CREATE',
        'ISSUE',
        issueData.issueNumber,
        issueData.sku,
        `Issued ${issueData.qtyIssued} units to ${issueData.department} (Mode: ${issueData.issuedUnitType || 'INDIVIDUAL'})`,
        undefined,
        undefined,
        issueData
      );
      showToast(`Stock issued under ${issueData.issueNumber}`, 'success');

      // Auto-preview printable voucher
      const computed = issues.find((i) => i.issueNumber === issueData.issueNumber);
      if (computed) {
        setSelectedIssueForVoucher(computed);
      }
    }
    setEditingIssue(null);
  };

  const handleDeleteIssue = (issueNumber: string) => {
    const target = rawIssues.find((i) => i.issueNumber === issueNumber);
    setRawIssues((prev) => prev.filter((i) => i.issueNumber !== issueNumber));
    logAudit(
      'DELETE',
      'ISSUE',
      issueNumber,
      target?.sku || '',
      `Deleted requisition ${issueNumber}`,
      undefined,
      target,
      undefined
    );
    showToast(`Deleted issue record ${issueNumber}`, 'info');
  };

  // ADJUSTMENT CRUD
  const handleSaveAdjustment = (adjData: any) => {
    if (editingAdjustment) {
      setRawAdjustments((prev) =>
        prev.map((a) =>
          a.adjustmentNumber === editingAdjustment.adjustmentNumber
            ? {
                ...a,
                ...adjData,
                lastModifiedBy: currentUser.name,
                lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              }
            : a
        )
      );
      logAudit(
        'UPDATE',
        'ADJUSTMENT',
        adjData.adjustmentNumber,
        adjData.sku,
        `Modified stock adjustment ${adjData.adjustmentNumber}`,
        undefined,
        editingAdjustment,
        adjData
      );
      showToast(`Updated adjustment ${adjData.adjustmentNumber}`, 'success');
    } else {
      setRawAdjustments((prev) => [
        ...prev,
        {
          ...adjData,
          lastModifiedBy: currentUser.name,
          lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      ]);
      logAudit(
        'CREATE',
        'ADJUSTMENT',
        adjData.adjustmentNumber,
        adjData.sku,
        `Posted ${adjData.adjustmentType} count variance ${adjData.variance} under ${adjData.adjustmentNumber}`,
        undefined,
        undefined,
        adjData
      );
      showToast(`Posted adjustment ${adjData.adjustmentNumber}`, 'success');
    }
    setEditingAdjustment(null);
  };

  const handleDeleteAdjustment = (adjustmentNumber: string) => {
    const target = rawAdjustments.find((a) => a.adjustmentNumber === adjustmentNumber);
    setRawAdjustments((prev) => prev.filter((a) => a.adjustmentNumber !== adjustmentNumber));
    logAudit(
      'DELETE',
      'ADJUSTMENT',
      adjustmentNumber,
      target?.sku || '',
      `Deleted adjustment ${adjustmentNumber}`,
      undefined,
      target,
      undefined
    );
    showToast(`Deleted adjustment record ${adjustmentNumber}`, 'info');
  };

  // ONE-CLICK ADMIN ROLLBACK / REVERT ENGINE
  const handleRevertAction = (logId: string) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Super Admin authority required to rollback transactions.', 'warning');
      return;
    }

    const log = auditLogs.find((l) => l.id === logId);
    if (!log) return;

    if (log.isReverted) {
      showToast('This action has already been reverted.', 'warning');
      return;
    }

    if (log.userRole === 'ADMIN') {
      showToast('Admin actions cannot be reverted directly.', 'warning');
      return;
    }

    try {
      switch (log.entity) {
        case 'RECEIPT': {
          if (log.action === 'CREATE') {
            setRawReceipts((prev) => prev.filter((r) => r.grnNumber !== log.entityId));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setRawReceipts((prev) =>
              prev.map((r) => (r.grnNumber === log.entityId ? { ...log.previousState } : r))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setRawReceipts((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        case 'ISSUE': {
          if (log.action === 'CREATE') {
            setRawIssues((prev) => prev.filter((i) => i.issueNumber !== log.entityId));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setRawIssues((prev) =>
              prev.map((i) => (i.issueNumber === log.entityId ? { ...log.previousState } : i))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setRawIssues((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        case 'ADJUSTMENT': {
          if (log.action === 'CREATE') {
            setRawAdjustments((prev) => prev.filter((a) => a.adjustmentNumber !== log.entityId));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setRawAdjustments((prev) =>
              prev.map((a) => (a.adjustmentNumber === log.entityId ? { ...log.previousState } : a))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setRawAdjustments((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        case 'PRODUCT': {
          if (log.action === 'CREATE') {
            setRawProducts((prev) => prev.filter((p) => p.sku !== log.entityId));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setRawProducts((prev) =>
              prev.map((p) => (p.sku === log.entityId ? { ...log.previousState } : p))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setRawProducts((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        case 'SUPPLIER': {
          if (log.action === 'CREATE') {
            setSuppliers((prev) => prev.filter((s) => s.id !== log.entityId && s.name !== log.entityName));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setSuppliers((prev) =>
              prev.map((s) => (s.id === log.entityId ? { ...log.previousState } : s))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setSuppliers((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        case 'DEPARTMENT': {
          if (log.action === 'CREATE') {
            setDepartments((prev) => prev.filter((d) => d.staffName !== log.entityName));
          } else if (log.action === 'UPDATE' && log.previousState) {
            setDepartments((prev) =>
              prev.map((d) => (d.staffName === log.entityName ? { ...log.previousState } : d))
            );
          } else if (log.action === 'DELETE' && log.previousState) {
            setDepartments((prev) => [...prev, { ...log.previousState }]);
          }
          break;
        }
        default:
          break;
      }

      // Mark original entry as reverted
      setAuditLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, isReverted: true } : l))
      );

      // Append immutable REVERT entry to permanent audit trail
      const revertEntry: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'REVERT',
        entity: log.entity,
        entityId: log.entityId,
        entityName: log.entityName,
        summary: `Admin ${currentUser.name} reverted ${log.action} action performed by ${log.userName} on ${log.entity} (${log.entityId || log.entityName}).`,
        details: `Rollback applied to log ID: ${log.id}. Prior snapshot state restored.`,
      };

      setAuditLogs((prev) => [revertEntry, ...prev]);
      showToast(`Reverted ${log.action} action on ${log.entity} (${log.entityId || log.entityName}).`, 'success');
    } catch {
      showToast('Failed to revert transaction.', 'warning');
    }
  };

  // Macro 6 implementation for FEFO assignment
  const handleAutoAssignFEFO = (issueNumber: string) => {
    const targetIssue = rawIssues.find((i: any) => i.issueNumber === issueNumber);
    if (!targetIssue) return;

    const bestBatch = recommendFEFOBatch(targetIssue.sku, batches);
    if (bestBatch) {
      setRawIssues((prev: any[]) =>
        prev.map((i) =>
          i.issueNumber === issueNumber ? { ...i, issueFromBatch: bestBatch.batchNumber } : i
        )
      );
      logAudit(
        'UPDATE',
        'ISSUE',
        issueNumber,
        targetIssue.sku,
        `Allocated FEFO Batch ${bestBatch.batchNumber} (Exp: ${bestBatch.expiryDate})`
      );
      showToast(
        `FEFO Auto-Assign: Allocated Batch ${bestBatch.batchNumber} (Exp: ${bestBatch.expiryDate}) for ${targetIssue.sku}`,
        'success'
      );
    } else {
      showToast(`No available batches with stock found for ${targetIssue.sku}`, 'warning');
    }
  };

  // Macro actions for Excel automation notes
  const handleRunMacro = (macroId: string) => {
    switch (macroId) {
      case 'macro1': {
        const invalidIssues = issues.filter((i) => i.stockCheck === 'EXCEEDS STOCK');
        if (invalidIssues.length === 0) {
          showToast('Macro 1: All stock issues are valid! No stock deficits detected.', 'success');
        } else {
          showToast(
            `Macro 1 Warning: ${invalidIssues.length} issue row(s) exceed available stock balances!`,
            'warning'
          );
          setActiveModule('issued');
        }
        break;
      }
      case 'macro2': {
        const backupData = {
          timestamp: new Date().toISOString(),
          currency: 'GH₵ (Ghanaian Cedi)',
          rawProducts,
          rawReceipts,
          rawIssues,
          rawAdjustments,
          suppliers,
          departments,
          users,
          auditLogs,
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartStock_Backup_GH₵_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Macro 2: Complete ERP backup file generated and downloaded.', 'success');
        break;
      }
      case 'macro5': {
        setShowExpiryAlertModal(true);
        break;
      }
      case 'macro6': {
        if (issues.length > 0) {
          handleAutoAssignFEFO(issues[0].issueNumber);
        } else {
          showToast('Macro 6: No issue records available to allocate.', 'warning');
        }
        break;
      }
      case 'macro7': {
        setActiveModule('batches');
        showToast('Macro 7: Expiry Risk Audit Monitor activated.', 'success');
        break;
      }
      default:
        break;
    }
  };

  // Open primary action modal according to active module
  const handleOpenNewModal = () => {
    switch (activeModule) {
      case 'received':
        setEditingReceipt(null);
        setPreselectedSku(undefined);
        setShowAddReceiptModal(true);
        break;
      case 'issued':
        setEditingIssue(null);
        setPreselectedSku(undefined);
        setShowAddIssueModal(true);
        break;
      case 'adjustments':
        setEditingAdjustment(null);
        setShowAddAdjustmentModal(true);
        break;
      case 'users':
        if (currentUser.role !== 'ADMIN') {
          showToast('Super Admin rights required to setup users.', 'warning');
        }
        break;
      default:
        setShowAddReceiptModal(true);
        break;
    }
  };

  // Render Full-Screen Login Gateway if logged out
  if (!isLoggedIn) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 select-none font-sans">
      {/* 1. Modern Collapsible ERP Sidebar Navigation */}
      <ErpSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
        metrics={{
          reorderCount: metrics.itemsNeedingReorder,
          expiredCount: metrics.itemsWithExpiredStock,
          criticalCount: metrics.itemsExpiring30Days,
        }}
        auditLogCount={auditLogs.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Main Application Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar with Breadcrumb, Currency Badge, PIN Settings, and Logout */}
        <ErpTopBar
          activeModule={activeModule}
          currentUser={currentUser}
          onOpenSwitchUser={() => setShowSwitchUserModal(true)}
          onOpenChangePin={() => setShowChangePinModal(true)}
          onLogout={handleLogout}
          onCheckExpiries={() => setShowExpiryAlertModal(true)}
          onDownloadXlsx={handleDownloadXlsx}
          onOpenNewModal={handleOpenNewModal}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Multi-Admin System Reset Alert Banner for Admins */}
        {currentUser.role === 'ADMIN' && resetProposal && (
          <div className="bg-red-950/90 border-b border-red-800 text-red-200 px-4 py-2 flex items-center justify-between text-xs font-mono animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>System Reset Proposal Pending:</strong> {resetProposal.approvedAdminIds.length} of{' '}
                {users.filter((u) => u.role === 'ADMIN' && u.active).length} Administrators Approved.
              </span>
            </div>
            <button
              onClick={() => setActiveModule('users')}
              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-bold cursor-pointer transition-colors shadow-xs"
            >
              Consensus Voting &rarr;
            </button>
          </div>
        )}

        {/* Toast Feedback Notification Banner */}
        {toast && (
          <div
            className={`flex items-center justify-between px-4 py-2 text-xs font-mono border-b animate-in fade-in duration-100 ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : toast.type === 'warning'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-sky-950/80 text-sky-300 border-sky-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <Info className="w-4 h-4 text-sky-400" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white cursor-pointer text-sm"
            >
              &times;
            </button>
          </div>
        )}

        {/* Active Module Viewport (Master List, Suppliers & Departments Disbanded into Integrated Workflows) */}
        <main className="flex-1 overflow-hidden relative">
          {activeModule === 'dashboard' && (
            <DashboardSheet
              metrics={metrics}
              showFormulas={false}
              onSelectCell={handleSelectCell}
              onNavigateToTab={(tab) => {
                if (tab === 'received' || tab === 'issued' || tab === 'batches' || tab === 'adjustments') {
                  setActiveModule(tab);
                } else if (tab === 'master') {
                  setActiveModule('received');
                }
              }}
            />
          )}

          {activeModule === 'received' && (
            <StockReceivedSheet
              receipts={receipts}
              showFormulas={false}
              onSelectCell={handleSelectCell}
              onOpenNewReceipt={() => {
                setEditingReceipt(null);
                setPreselectedSku(undefined);
                setShowAddReceiptModal(true);
              }}
              onEditReceipt={(rec) => {
                setEditingReceipt(rec);
                setShowAddReceiptModal(true);
              }}
              onDeleteReceipt={handleDeleteReceipt}
              onOpenProductSpecs={() => setShowProductSpecsModal(true)}
              isAdmin={currentUser.role === 'ADMIN'}
            />
          )}

          {activeModule === 'issued' && (
            <StockIssuedSheet
              issues={issues}
              showFormulas={false}
              onSelectCell={handleSelectCell}
              onPrintVoucher={(issue) => setSelectedIssueForVoucher(issue)}
              onAutoAssignFEFO={handleAutoAssignFEFO}
              onOpenNewIssue={() => {
                setEditingIssue(null);
                setPreselectedSku(undefined);
                setShowAddIssueModal(true);
              }}
              onEditIssue={(iss) => {
                setEditingIssue(iss);
                setShowAddIssueModal(true);
              }}
              onDeleteIssue={handleDeleteIssue}
            />
          )}

          {activeModule === 'adjustments' && (
            <StockAdjustmentsSheet
              adjustments={adjustments}
              showFormulas={false}
              onSelectCell={handleSelectCell}
              onOpenNewAdjustment={() => {
                setEditingAdjustment(null);
                setShowAddAdjustmentModal(true);
              }}
              onEditAdjustment={(adj) => {
                setEditingAdjustment(adj);
                setShowAddAdjustmentModal(true);
              }}
              onDeleteAdjustment={handleDeleteAdjustment}
            />
          )}

          {activeModule === 'batches' && (
            <BatchTrackerSheet
              batches={batches}
              showFormulas={false}
              onSelectCell={handleSelectCell}
              onOpenAuditReport={() => {
                setShowExpiryAlertModal(true);
              }}
            />
          )}

          {/* Admin Modules (Restricted to Admin Users) */}
          {activeModule === 'audit-log' && (
            <AuditLogModule
              auditLogs={auditLogs}
              currentUser={currentUser}
              onRevertAction={handleRevertAction}
            />
          )}

          {activeModule === 'users' && (
            <UserManagementModule
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              resetProposal={resetProposal}
              onProposeReset={handleProposeReset}
              onApproveReset={handleApproveReset}
              onRejectReset={handleRejectReset}
              onExecuteReset={handleExecuteReset}
            />
          )}

          {activeModule === 'vba' && <VBACodeSheet onRunMacro={handleRunMacro} />}
        </main>
      </div>

      {/* Switch User Modal */}
      <PinLoginModal
        isOpen={showSwitchUserModal}
        onClose={() => setShowSwitchUserModal(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUserFromSwitcher}
      />

      {/* Change PIN Modal (Masks user's PIN from Admin once updated) */}
      <ChangePinModal
        isOpen={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        currentUser={currentUser}
        onChangePin={handleChangePin}
      />

      {/* Reorder Level & Product Specifications Modal (Admin editable, visible to all) */}
      <ProductSpecsModal
        isOpen={showProductSpecsModal}
        onClose={() => setShowProductSpecsModal(false)}
        products={products}
        currentUser={currentUser}
        onUpdateProductSpecs={handleUpdateProductSpecs}
      />

      {/* Printable Issue Voucher */}
      <IssueVoucherModal
        issue={selectedIssueForVoucher}
        onClose={() => setSelectedIssueForVoucher(null)}
      />

      {/* On-Demand Expiry Check Modal (Disabled on startup, appears on user command) */}
      {showExpiryAlertModal && (
        <ExpiryAlertModal
          products={products}
          onClose={() => setShowExpiryAlertModal(false)}
          onNavigateToBatches={() => {
            setShowExpiryAlertModal(false);
            setActiveModule('batches');
          }}
        />
      )}

      {/* Inbound Goods Receiving (GRN) with Inline SKU and Supplier Registration */}
      <AddReceiptModal
        isOpen={showAddReceiptModal}
        onClose={() => {
          setShowAddReceiptModal(false);
          setEditingReceipt(null);
        }}
        products={products}
        suppliers={suppliers}
        staff={departments}
        initialSku={preselectedSku}
        onAdd={handleSaveReceipt}
        initialData={editingReceipt}
        onRegisterNewProduct={handleRegisterNewProduct}
        onRegisterNewSupplier={handleRegisterNewSupplier}
      />

      {/* Stock Requisitions with Dual Bulk/Individual Toggle and Inline Staff Registration */}
      <AddIssueModal
        isOpen={showAddIssueModal}
        onClose={() => {
          setShowAddIssueModal(false);
          setEditingIssue(null);
        }}
        products={products}
        departments={departments}
        batches={batches}
        initialSku={preselectedSku}
        onAdd={handleSaveIssue}
        initialData={editingIssue}
        onRegisterNewStaff={handleRegisterNewStaff}
      />

      {/* Physical Stock Adjustments */}
      <AddAdjustmentModal
        isOpen={showAddAdjustmentModal}
        onClose={() => {
          setShowAddAdjustmentModal(false);
          setEditingAdjustment(null);
        }}
        products={products}
        staff={departments}
        onAdd={handleSaveAdjustment}
        initialData={editingAdjustment}
      />
    </div>
  );
}

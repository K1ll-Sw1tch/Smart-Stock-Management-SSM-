# SmartStock ERP — Streamlined Architecture, Role Governance & Consensus Security

A definitive architectural blueprint upgrading SmartStock ERP into an ultra-streamlined, high-security stock management platform. This release disbands redundant administrative panels (Master Inventory, Suppliers, and Staff) into dynamic inline workflows, enforces strict PIN privacy and multi-admin consensus system resets, delivers an immutable audit trail with one-click rollback for non-admin actions, and executes all business formulas silently in the backend in Ghanaian Cedis (`GH₵`).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been verified through user clarification and finalized into this specification:

- **Confirmed Decision 1 (Panel Disbandment & Unified Operations)**:
  - The standalone **Master Inventory**, **Suppliers**, and **Staff & Departments** panels are completely disbanded from the navigation.
  - *Goods Received (GRN)* handles receiving, inline registration of new product SKUs, inline vendor registration, and packaging conversions.
  - *Stock Requisitions* handles dual-unit issuing (bulk/individual), available stock checks, and inline registration of new departments and staff members.
  - *FEFO Batch Tracker* handles all expiry date monitoring, batch status alerts, and earliest-expiry prioritization.
- **Confirmed Decision 2 (Reorder Level Governance)**:
  - Reorder Levels are visible to all users across Requisitions, Goods Received, and Dashboard KPIs.
  - Reorder Levels can **only be edited by Admin users** through a dedicated **Product Specifications Modal** accessible from the Goods Received interface.
- **Confirmed Decision 3 (Strict Audit Log Privacy & Immutability)**:
  - The Audit Trail panel is **strictly hidden from non-admin users** (removed from non-admin navigation and blocked from access).
  - Admin revert actions generate permanent, immutable `REVERT` log entries. Audit records cannot be deleted or pruned during regular operations.
- **Confirmed Decision 4 (Multi-Admin Consensus for System Reset)**:
  - A complete system reset cannot be executed by a single admin. It creates a **Pending Reset Proposal** requiring explicit PIN approval from **every registered Admin account** in their respective interfaces before the database can be wiped.
- **Confirmed Decision 5 (Authentication & PIN Privacy)**:
  - Dedicated full-screen login gateway requiring Username and 4-digit PIN.
  - Persistent user profile and **Logout icon button** in the top navigation.
  - Admin provisions usernames and initial temporary PINs (`pinChangedByUser: false`).
  - Users can update their PIN privately; once changed (`pinChangedByUser: true`), the PIN is completely masked from Admin views (`•••• (Private - Set by User)`).
- **Confirmed Decision 6 (Backend-Only Calculation Engine)**:
  - All mathematical formulas execute invisibly in `excelCalculations.ts`.
  - Frontend formula bars, formula toggles, and calculation rules editors are completely removed.

---

## 1. Overview & Core Concept

### What It Does
SmartStock ERP simplifies warehouse operations for growing enterprises. By shifting away from multi-sheet spreadsheet sprawl, storekeepers manage inventory through action-focused panels: receiving goods, issuing requisitions, and tracking batch shelf-lives. Inbound deliveries from new suppliers or for new SKUs are captured on-the-fly without navigating away. Departmental requisitioners are added dynamically at the moment of issue. Critical security controls—including immutable rollback history, multi-admin reset consensus, and private PIN credentials—protect business integrity without slowing down warehouse flow.

### Target Personas
1. **Warehouse Storekeepers / Non-Admin Staff**:
   - Log into a full-screen terminal with their unique username and private 4-digit PIN.
   - Receive bulk goods (registering new suppliers or SKUs on-the-fly when necessary).
   - Fulfill requisitions in bulk cartons or loose pieces, registering new departments/staff inline.
   - Self-manage their private PIN without admin visibility.
2. **Super Administrators / Stores Controllers**:
   - Oversee global portfolio valuations in Ghanaian Cedis (`GH₵`) and monitor reorder levels.
   - Maintain catalog specifications, purchase costs, and safety reorder thresholds.
   - Review the restricted Audit Trail and undo unauthorized or erroneous non-admin actions in one click.
   - Participate in multi-admin consensus voting if a system reset is ever requested.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [=] SmartStock ERP       [Breadcrumbs: Goods Received (GRN)]   [GH₵ Cedi]  [Kwame M. (Admin)] [->]│
├─────────────┬──────────────────────────────────────────────────────────────────────────────────┤
│ [Collapse]  │ GOODS RECEIVED (GRN)                                        [+ Receive Bulk Goods]│
│             ├──────────────────────────────────────────────────────────────────────────────────┤
│ [Dashboard] │ Search GRN, SKU, Vendor...   [Filter by Vendor v]            [Product Specs (Admin)│
│ [Received]  ├────────────┬──────────┬──────────────┬──────────────┬─────────────┬──────────────┤
│ [Requisition│ GRN #      │ Date     │ Product SKU  │ Bulk Qty     │ Total Issue │ Valuation    │
│ [Batch FEFO]│ GRN-2025-01│ Oct 19   │ SKU-001      │ 3 Boxes      │ 150 Pieces  │ GH₵ 45.00    │
│ [Adjustment]│            │          │ (50 pcs/box) │              │             │              │
│ ─────────── ├────────────┴──────────┴──────────────┴──────────────┴─────────────┴──────────────┤
│ [Audit Log]*│ *Admin Only Navigation Items                                                     │
│ [Users]*    │                                                                                  │
└─────────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

### Key User Flows

#### Flow 1: Authentication & Logout
1. **Logged-Out Gateway**: A clean, distraction-free full-screen card with company branding, prompting for **Username** and **4-digit PIN**.
2. **Active Session**: Authenticated state loads the ERP shell. Top-right navigation renders the user's name, role badge, quick "Change My PIN" trigger, and an explicit **Logout icon button** (`LogOut` from Lucide).
3. **Logout**: Clicking the logout icon terminates session state and smoothly returns to the login gateway.

#### Flow 2: Inbound Goods Receiving & Dynamic Registration
1. Storekeeper opens `+ Receive Bulk Goods (GRN)`.
2. **Dynamic Supplier**: Dropdown lists existing vendors, plus a `+ Add New Supplier` trigger that expands inline fields (*Name*, *Contact*, *Phone*, *Email*). Saving immediately adds the vendor to the company roster and selects it for this GRN.
3. **Dynamic Product SKU**: Dropdown lists catalog items, plus an expandable `+ Register New SKU` section. Saving immediately registers the product and sets packaging multipliers.
4. Completing the GRN automatically recalculates inventory, stock value in GH₵, and batch expiry tracking.

#### Flow 3: Requisition with Dynamic Department & Staff Allocation
1. Storekeeper opens `+ Issue Stock Requisition`.
2. Selects SKU and toggles between **Bulk Mode** (e.g. cartons) and **Individual Mode** (loose pieces).
3. Displays live available stock (e.g. `6 Box(es) + 25 Piece(s)`) and visible safety **Reorder Level**.
4. **Dynamic Staff & Department**: In the department/requisitioner selector, clicking `+ Add New Staff / Department` unveils inline fields (*Department*, *Staff Name*, *Role*). Saving registers them for this issue and permanently adds them to subsequent dropdowns.

#### Flow 4: Admin Product Specifications & Reorder Level Management
1. Inside the Goods Received module, Admin users see a **"Product Specs & Reorder Levels"** action button (hidden or disabled for non-admins).
2. Clicking opens the modal listing all products with their current Reorder Levels, Bulk Purchase Costs, and Packaging ratios.
3. Admins can update the safety Reorder Level and save, instantly updating reorder warnings across the Dashboard, Requisitions, and Batch Tracker.

#### Flow 5: Restricted Audit Trail & One-Click Rollback
1. Only Admin users see the **Audit Trail** item in the navigation sidebar. Non-admins cannot access or view this module.
2. The trail displays every historical action with timestamp, author, and details.
3. Any action performed by a non-admin features a prominent **[Revert Action]** button.
4. Clicking Revert prompts confirmation, restores the prior state from the stored snapshot, and writes an **immutable `REVERT` log entry**.

#### Flow 6: Multi-Admin Consensus System Reset
1. If an Admin initiates a factory reset, a **System Reset Proposal** is created.
2. The system does not wipe immediately; instead, an administrative banner informs all admins: *"System Reset Proposal: 1 of 2 Admins Approved"*.
3. When other Admins log into their own interfaces, they are presented with the pending proposal and must enter their credentials to approve or reject.
4. Only when **100% of registered Admin accounts have signed off** does the system execute the reset and purge data.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Collapsing Suppliers and Staff into In-Context Creation
- **Chosen Approach**: Completely remove separate Suppliers and Staff pages. Instead, embed lightweight expandable creation forms directly inside the GRN and Requisition dialogs.
- **Why**: Standalone supplier and department directories create unnecessary navigation hops for warehouse clerks. In real storekeeping, new suppliers and departments are introduced when goods arrive or when a staff member submits a requisition.
- **Trade-off Handled**: Newly registered entities are persisted into local state so they remain permanently available in future dropdown selectors.

### Decision 2: Admin-Only Reorder Level Governance
- **Chosen Approach**: Allow all users to observe safety reorder levels to prevent stockouts, but restrict modification privileges strictly to Admin users via a dedicated specifications console in Goods Received.
- **Why**: Safety stock levels determine procurement triggers. Allowing arbitrary staff modification risks hidden deficits or artificial reorder alerts.

### Decision 3: Multi-Admin Consensus Verification
- **Chosen Approach**: Implement an asynchronous multi-admin approval state (`SystemResetProposal`) tracking approvals per admin ID, rather than allowing any single admin to wipe company history.
- **Why**: Protects against accidental data destruction or unilateral rogue actions in multi-supervisor environments.

### Decision 4: Collapsible Ergonomic Sidebar
- **Chosen Approach**: A dual-state sidebar (expanded `w-64` with text and counters, collapsed `w-16` with icons and hover tooltips) with a header toggle button.
- **Why**: Maximizes horizontal screen real estate for wide transaction tables while keeping navigation one click away.

---

## 4. Technical Architecture & Component Mapping

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Full-Screen Login Gateway                                 │
│                 Username Input  •  4-Digit PIN Input  •  Session Boot                  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (Authenticated)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Main ERP Application Shell                                │
│  ┌─────────────────────────────────── ErpTopBar ─────────────────────────────────────┐  │
│  │ Brand  •  Sidebar Toggle  •  Breadcrumb  •  GH₵ Badge  •  User Menu  •  [LogOut] │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────┬──────────────────────────────────────────────────────────────┐  │
│  │     ErpSidebar     │                       Active Module Viewport                 │  │
│  │ (Expanded/Compact) │                                                              │  │
│  │                    │  • Dashboard & KPIs (Stock Valuation, SKUs, Reorder Alerts)  │  │
│  │  - Dashboard       │  • Goods Received GRN (Inbound Logs, Inline SKU/Vendor Add,  │  │
│  │  - Goods Received  │                       Admin Product Specs & Reorder Levels)  │  │
│  │  - Requisitions    │  • Stock Requisitions (Dual Bulk/Loose Issue, Balance Check, │  │
│  │  - Batch Tracker   │                       Inline Department/Staff Registration)  │  │
│  │  - Adjustments     │  • FEFO Batch Tracker (Expiry Risk Engine, Priority Queues)  │  │
│  │  ────────────────  │  • Physical Adjustments (Stock Audits, Discrepancy Variances)│  │
│  │  - Audit Trail*    │  • Audit Trail [Admin Only] (Immutable Logs, 1-Click Revert) │  │
│  │  - User Management*│  • User Management [Admin Only] (Usernames, Temporary PINs,  │  │
│  │   *(Admin Only)    │                                 Multi-Admin Reset Consensus) │  │
│  └────────────────────┴──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       Background Calculation Engine (Silent)                           │
│        recalculateAll() • recommendFEFOBatch() • formatCedis() • LocalStorage          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Extensions (`src/types/inventory.ts`)

```typescript
export interface UserAccount {
  id: string;
  username: string;          // Unique username set exclusively by Admin
  name: string;
  role: 'ADMIN' | 'STAFF';
  pin: string;               // 4-digit PIN
  pinChangedByUser: boolean; // true = hidden from Admin (shows '••••')
  department: string;
  avatarInitials: string;
  createdAt: string;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'ADMIN' | 'STAFF';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'REVERT';
  entity: 'PRODUCT' | 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'SUPPLIER' | 'DEPARTMENT' | 'USER';
  entityId: string;
  entityName: string;
  summary: string;
  previousState?: any;      // Snapshot prior to change for single-click rollback
  newState?: any;           // Snapshot after change
  isReverted?: boolean;
}

export interface SystemResetProposal {
  id: string;
  requestedByAdminId: string;
  requestedByAdminName: string;
  requestedAt: string;
  approvedAdminIds: string[];  // All admin IDs must be present to execute reset
  status: 'PENDING' | 'REJECTED' | 'EXECUTED';
}
```

### Component Structure & Responsibilities

1. **`LoginScreen.tsx`**: Full-screen gate rendered when `isLoggedIn === false`. Validates username and PIN; transitions into session state.
2. **`ErpSidebar.tsx`**:
   - Collapsible state (`isCollapsed: boolean`).
   - Conditionally filters navigation items so `audit-log` and `users` are completely hidden for non-admin roles.
   - Disbands `master`, `suppliers`, and `departments` tabs.
3. **`ErpTopBar.tsx`**:
   - Sidebar collapse/expand toggle button (`PanelLeftClose` / `PanelLeft`).
   - Contextual breadcrumbs and currency indicator (`GH₵`).
   - Current user badge with "Change PIN" action and explicit **Logout button** (`LogOut`).
4. **`StockReceivedSheet.tsx` & `AddReceiptModal.tsx`**:
   - Inbound GRN log table with quick product specs inspect.
   - Modal contains inline expandable `+ Add New Supplier` and `+ Register New SKU`.
   - Admin-exclusive `ProductSpecsModal.tsx` to edit Reorder Levels and bulk pricing.
5. **`StockIssuedSheet.tsx` & `AddIssueModal.tsx`**:
   - Dual-unit bulk/individual issue toggle with real-time stock balance check and reorder alert pill.
   - Modal contains inline expandable `+ Add New Staff / Department`.
6. **`AuditLogModule.tsx`**:
   - Restricted to Admin role.
   - One-click `[Revert Action]` button on non-admin entries restoring the prior state snapshot and creating an immutable `REVERT` log.
7. **`UserManagementModule.tsx`**:
   - Admin sets username and initial PIN.
   - Displays `•••• (Private - Set by User)` if `pinChangedByUser === true`, with admin reset override.
   - Multi-admin consensus system reset proposal interface.

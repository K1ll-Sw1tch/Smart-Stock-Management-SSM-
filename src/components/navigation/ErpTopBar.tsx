import React, { useState } from 'react';
import {
  Download,
  ShieldAlert,
  Coins,
  ChevronRight,
  Plus,
  KeyRound,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  User,
} from 'lucide-react';
import { UserAccount } from '../../types/inventory';
import { ErpModuleId } from './ErpSidebar';

interface ErpTopBarProps {
  activeModule: ErpModuleId;
  currentUser: UserAccount;
  onOpenSwitchUser: () => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
  onCheckExpiries: () => void;
  onDownloadXlsx: () => void;
  onOpenNewModal: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const ErpTopBar: React.FC<ErpTopBarProps> = ({
  activeModule,
  currentUser,
  onOpenSwitchUser,
  onOpenChangePin,
  onLogout,
  onCheckExpiries,
  onDownloadXlsx,
  onOpenNewModal,
  isCollapsed,
  onToggleSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return 'Executive Overview & Financials';
      case 'received':
        return 'Inbound Goods Received Notes (GRN)';
      case 'issued':
        return 'Department Stock Requisitions';
      case 'adjustments':
        return 'Physical Inventory Audits & Counts';
      case 'batches':
        return 'FEFO Delivery Batch Monitor';
      case 'audit-log':
        return 'System Audit Trail & Rollback Console';
      case 'users':
        return 'User Management & Authorization Console';
      case 'vba':
        return 'Excel Automation Notes';
      default:
        return 'Inventory Management';
    }
  };

  const getAddButtonLabel = () => {
    switch (activeModule) {
      case 'received':
        return '+ Receive Stock (GRN)';
      case 'issued':
        return '+ Issue Requisition';
      case 'adjustments':
        return '+ Post Adjustment';
      case 'users':
        return currentUser.role === 'ADMIN' ? '+ Setup New User' : null;
      default:
        return null;
    }
  };

  const addLabel = getAddButtonLabel();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 select-none shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: Sidebar Collapse Toggle + Breadcrumbs Trail */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4 text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <span className="text-slate-500 hidden sm:inline">SmartStock</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <span className="text-slate-200 font-semibold truncate max-w-xs sm:max-w-md">
            {getBreadcrumbTitle()}
          </span>
        </div>

        {/* Right: Currency badge, Expiry check, Download, and User profile + Logout */}
        <div className="flex items-center gap-2">
          {/* Ghanaian Cedi Currency Pill */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-700/80 text-[11px] font-mono text-emerald-400"
            title="Standard Enterprise Currency: Ghanaian Cedi (GH₵)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>GH₵ (Ghana Cedi)</span>
          </div>

          {/* Explicit On-Demand Expiry Check */}
          <button
            onClick={onCheckExpiries}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 transition-colors cursor-pointer"
            title="Perform manual on-demand expiry audit and view critical batches"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Check Expiry Status</span>
          </button>

          {/* Download Real .xlsx File */}
          <button
            onClick={onDownloadXlsx}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
            title="Download multi-sheet Excel workbook in GH₵"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .xlsx</span>
          </button>

          {/* Primary Action Button */}
          {addLabel && (
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{addLabel}</span>
            </button>
          )}

          {/* User Profile & Actions Dropdown */}
          <div className="relative border-l border-slate-800 pl-2 ml-1 flex items-center gap-1.5">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="User Account &amp; PIN Settings"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] hidden sm:inline">
                {currentUser.name.split(' ')[0]} ({currentUser.role === 'ADMIN' ? 'Admin' : 'Staff'})
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-10 top-full mt-1.5 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs font-mono space-y-1 animate-in fade-in duration-100"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1">
                  <div className="font-bold text-slate-100">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400">@{currentUser.username} • {currentUser.role}</div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenChangePin();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change My PIN</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSwitchUser();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Switch Terminal Profile</span>
                </button>
              </div>
            )}

            {/* Explicit Logout Icon Button */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
              title="Logout of Terminal Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

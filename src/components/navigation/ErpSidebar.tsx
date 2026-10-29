import React from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  PackageMinus,
  SlidersHorizontal,
  Hourglass,
  Users,
  FileSpreadsheet,
  History,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { UserAccount } from '../../types/inventory';

export type ErpModuleId =
  | 'dashboard'
  | 'received'
  | 'issued'
  | 'adjustments'
  | 'batches'
  | 'audit-log'
  | 'users'
  | 'vba';

interface ErpSidebarProps {
  activeModule: ErpModuleId;
  setActiveModule: (module: ErpModuleId) => void;
  currentUser: UserAccount;
  metrics: {
    reorderCount: number;
    expiredCount: number;
    criticalCount: number;
  };
  auditLogCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const ErpSidebar: React.FC<ErpSidebarProps> = ({
  activeModule,
  setActiveModule,
  currentUser,
  metrics,
  auditLogCount,
  isCollapsed,
  setIsCollapsed,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  // Core operational modules (disbanded separate Master, Suppliers, Staff into these)
  const operationalModules = [
    {
      id: 'dashboard' as ErpModuleId,
      name: 'Dashboard & KPIs',
      icon: LayoutDashboard,
      badge: metrics.reorderCount > 0 ? `${metrics.reorderCount} Alerts` : null,
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    },
    {
      id: 'received' as ErpModuleId,
      name: 'Goods Received (GRN)',
      icon: PackageCheck,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'issued' as ErpModuleId,
      name: 'Stock Requisitions',
      icon: PackageMinus,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'batches' as ErpModuleId,
      name: 'FEFO Batch Tracker',
      icon: Hourglass,
      badge:
        metrics.expiredCount > 0
          ? `${metrics.expiredCount} Expired`
          : metrics.criticalCount > 0
          ? `${metrics.criticalCount} <30d`
          : null,
      badgeColor:
        metrics.expiredCount > 0
          ? 'text-red-400 bg-red-950/60 border-red-800/60'
          : 'text-orange-400 bg-orange-950/60 border-orange-800/60',
    },
    {
      id: 'adjustments' as ErpModuleId,
      name: 'Physical Adjustments',
      icon: SlidersHorizontal,
      badge: null,
      badgeColor: '',
    },
  ];

  // Administrative Governance modules - STRICTLY visible ONLY to Admin users!
  const adminModules = isAdmin
    ? [
        {
          id: 'audit-log' as ErpModuleId,
          name: 'Audit Trail & Rollback',
          icon: History,
          badge: auditLogCount > 0 ? String(auditLogCount) : null,
          badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
        },
        {
          id: 'users' as ErpModuleId,
          name: 'User Management',
          icon: Users,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'vba' as ErpModuleId,
          name: 'Excel Automation Notes',
          icon: FileSpreadsheet,
          badge: null,
          badgeColor: '',
        },
      ]
    : [];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800/80 flex flex-col h-full text-slate-300 select-none transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-sm shrink-0">
              SS
            </div>
            <div className="truncate">
              <div className="font-bold text-slate-100 text-sm tracking-tight truncate">
                SmartStock ERP
              </div>
              <div className="text-[10px] text-emerald-400 font-mono truncate">
                Ghana Stock Suite
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              SS
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title="Collapse navigation sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-5 scrollbar-thin">
        {/* Operational Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Operations
            </div>
          )}
          <nav className="space-y-1">
            {operationalModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={isCollapsed ? item.name : undefined}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administrative Governance Section - ONLY for Admins */}
        {isAdmin && adminModules.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center justify-between">
                <span>Governance</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Admin
                </span>
              </div>
            )}
            <nav className="space-y-1">
              {adminModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={isCollapsed ? item.name : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-cyan-700 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Collapsed Toggle Button when collapsed */}
      {isCollapsed && (
        <div className="p-2 border-t border-slate-800/80 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Expand navigation sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Status Footer */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 font-mono shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate font-mono">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                @{currentUser.username} • {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800/80 flex justify-center bg-slate-950/60">
          <div
            className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 font-mono"
            title={`${currentUser.name} (@${currentUser.username})`}
          >
            {currentUser.avatarInitials}
          </div>
        </div>
      )}
    </aside>
  );
};

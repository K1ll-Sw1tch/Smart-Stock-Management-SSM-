import React from 'react';
import {
  ListChecks,
  PackageCheck,
  PackageMinus,
  SlidersHorizontal,
  Hourglass,
  Truck,
  Building2,
  LayoutDashboard,
  FileCode,
  AlertCircle,
  FileText,
} from 'lucide-react';

export interface TabItem {
  id: string;
  name: string;
  sheetNumber: number;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
  badgeColor?: string;
}

interface TabBarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  metrics: {
    reorderCount: number;
    expiredCount: number;
    criticalCount: number;
  };
  hasExpiryReport: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  hasExpiryReport,
}) => {
  const tabs: TabItem[] = [
    {
      id: 'master',
      name: '1. Master List',
      sheetNumber: 1,
      icon: ListChecks,
      badge: metrics.reorderCount > 0 ? `${metrics.reorderCount} Reorder` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'received',
      name: '2. Stock Received',
      sheetNumber: 2,
      icon: PackageCheck,
    },
    {
      id: 'issued',
      name: '3. Stock Issued',
      sheetNumber: 3,
      icon: PackageMinus,
    },
    {
      id: 'adjustments',
      name: '4. Stock Adjustments',
      sheetNumber: 4,
      icon: SlidersHorizontal,
    },
    {
      id: 'batches',
      name: '5. Batch Tracker',
      sheetNumber: 5,
      icon: Hourglass,
      badge: metrics.expiredCount > 0 ? `${metrics.expiredCount} Expired` : metrics.criticalCount > 0 ? `${metrics.criticalCount} <30d` : null,
      badgeColor: metrics.expiredCount > 0 ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    {
      id: 'suppliers',
      name: '6. Suppliers',
      sheetNumber: 6,
      icon: Truck,
    },
    {
      id: 'departments',
      name: '7. Departments',
      sheetNumber: 7,
      icon: Building2,
    },
    {
      id: 'dashboard',
      name: '8. Dashboard',
      sheetNumber: 8,
      icon: LayoutDashboard,
    },
    {
      id: 'vba',
      name: '9. VBA Code (Notes)',
      sheetNumber: 9,
      icon: FileCode,
    },
  ];

  if (hasExpiryReport) {
    tabs.push({
      id: 'expiry-report',
      name: '10. Expiry Report',
      sheetNumber: 10,
      icon: FileText,
      badge: 'Audit',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    });
  }

  return (
    <div className="bg-slate-950 border-t border-slate-800 px-2 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-thin select-none shadow-inner">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-medium transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="tracking-tight">{tab.name}</span>

              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

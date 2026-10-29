import React from 'react';
import {
  Download,
  Play,
  RotateCcw,
  Plus,
  Code2,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  Printer,
  Sparkles,
} from 'lucide-react';
import { VBAMacro } from '../data/vbaCodeContent';

interface ExcelHeaderProps {
  activeTab: string;
  showFormulas: boolean;
  setShowFormulas: (val: boolean) => void;
  onDownloadXlsx: () => void;
  onResetData: () => void;
  onRunMacro: (macroId: string) => void;
  macros: VBAMacro[];
  onOpenNewModal: () => void;
  isLockedTransactions: boolean;
}

export const ExcelHeader: React.FC<ExcelHeaderProps> = ({
  activeTab,
  showFormulas,
  setShowFormulas,
  onDownloadXlsx,
  onResetData,
  onRunMacro,
  macros,
  onOpenNewModal,
  isLockedTransactions,
}) => {
  const [macroDropdownOpen, setMacroDropdownOpen] = React.useState(false);

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'master':
        return '+ New Product';
      case 'received':
        return '+ Receive Stock (GRN)';
      case 'issued':
        return '+ Issue Stock (Requisition)';
      case 'adjustments':
        return '+ New Adjustment';
      case 'suppliers':
        return '+ Add Supplier';
      case 'departments':
        return '+ Add Department / Staff';
      default:
        return '+ Add Record';
    }
  };

  const showAddButton = ['master', 'received', 'issued', 'adjustments', 'suppliers', 'departments'].includes(activeTab);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 select-none shadow-md">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/90 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-emerald-600 text-white font-bold text-sm shadow-sm ring-1 ring-emerald-400/30">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm tracking-tight">
                SmartStock_Inventory_Manager_FEFO.xlsm
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Auto-Converting Units &amp; FEFO Engine
              </span>
              {isLockedTransactions && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                  <Lock className="w-3 h-3" /> Rows &gt;7d Protected (admin123)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Bulk Unit Conversion • Expiry Date Tracking Per Batch • FEFO Queue • 9-Sheet Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Formula View Toggle */}
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all border ${
              showFormulas
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
            }`}
            title="Toggle between calculated values and exact Excel formulas (=IF, =SUMIFS, =VLOOKUP)"
          >
            <span className="font-bold text-amber-400">fx</span>
            <span>{showFormulas ? 'Showing Formulas' : 'Show Excel Formulas'}</span>
          </button>

          {/* Reset Data */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reset workbook back to prompt seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          {/* Download Real .xlsx Workbook */}
          <button
            onClick={onDownloadXlsx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm ring-1 ring-emerald-400/40 cursor-pointer"
            title="Generate and download actual Microsoft Excel .xlsx file with all 9 sheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .xlsx</span>
          </button>
        </div>
      </div>

      {/* Excel Ribbon / Action Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Action Button */}
          {showAddButton && (
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{getAddButtonLabel()}</span>
            </button>
          )}

          {/* VBA Macros Menu */}
          <div className="relative">
            <button
              onClick={() => setMacroDropdownOpen(!macroDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Run VBA Macro...</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {macroDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setMacroDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  7 Excel &amp; VBA Automation Macros
                </div>
                {macros.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onRunMacro(m.id);
                      setMacroDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 hover:text-emerald-300 flex items-start gap-2.5 transition-colors"
                  >
                    <span className="text-emerald-400 font-mono mt-0.5">▶</span>
                    <div>
                      <div className="font-medium text-slate-100">{m.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Macro Shortcuts */}
          <button
            onClick={() => onRunMacro('macro1')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80"
            title="Macro 1: Validate Stock Issues against available balances"
          >
            <span>✓ Validate Issues</span>
          </button>

          <button
            onClick={() => onRunMacro('macro6')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded text-amber-200 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60"
            title="Macro 6: Auto-Assign FEFO Batch"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-FEFO Batch</span>
          </button>

          <button
            onClick={() => onRunMacro('macro5')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded text-red-200 hover:text-red-100 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60"
            title="Macro 5: Open Expiry Alert Modal"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Expiry Check</span>
          </button>

          <button
            onClick={() => onRunMacro('macro7')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded text-cyan-200 hover:text-cyan-100 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60"
            title="Macro 7: Generate Expiry Audit Report"
          >
            <span>Audit Report</span>
          </button>

          <button
            onClick={() => onRunMacro('macro3')}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80"
            title="Macro 3: Lock Old Transactions older than 7 days"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Lock Old (&gt;7d)</span>
          </button>
        </div>

        {/* Small hint on right */}
        <div className="hidden xl:flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            FEFO Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Bulk-to-Issue Conversion
          </span>
          <span className="text-slate-500 font-mono">Password: admin123</span>
        </div>
      </div>
    </header>
  );
};

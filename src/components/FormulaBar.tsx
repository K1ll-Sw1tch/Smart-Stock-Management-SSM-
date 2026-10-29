import React from 'react';
import { Lock, Unlock, FunctionSquare } from 'lucide-react';

interface FormulaBarProps {
  activeCell: {
    coord: string;
    sheet: string;
    formula: string;
    value: string;
    isLocked: boolean;
  };
}

export const FormulaBar: React.FC<FormulaBarProps> = ({ activeCell }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs font-mono">
      {/* Name Box (Cell Coordinate) */}
      <div className="flex items-center justify-center min-w-[70px] px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-emerald-400 font-semibold tracking-wider text-center">
        {activeCell.coord || 'A1'}
      </div>

      {/* fx button / indicator */}
      <div className="flex items-center gap-1 px-1.5 text-slate-400 select-none">
        <span className="font-serif italic font-bold text-amber-400 text-sm">fx</span>
      </div>

      {/* Formula & Value Field */}
      <div className="flex-1 flex items-center justify-between px-3 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <span className="text-slate-100 font-mono text-[13px]">
          {activeCell.formula ? (
            <span className="text-amber-300 font-medium">{activeCell.formula}</span>
          ) : (
            <span className="text-slate-300">{activeCell.value || '—'}</span>
          )}
        </span>

        {/* Protection indicator */}
        <div className="flex items-center gap-1.5 pl-3 text-[11px] text-slate-400 select-none">
          {activeCell.isLocked ? (
            <span className="flex items-center gap-1 text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Formula Locked</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]">
              <Unlock className="w-3 h-3 text-emerald-400" />
              <span>Unlocked Input</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

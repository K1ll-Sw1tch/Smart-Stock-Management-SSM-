import React, { useState } from 'react';
import { FormulaRule, UserAccount } from '../../types/inventory';
import { Code2, Lock, Unlock, Edit3, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface FormulaConfigModuleProps {
  formulaRules: FormulaRule[];
  currentUser: UserAccount;
  onUpdateFormula: (rule: FormulaRule) => void;
}

export const FormulaConfigModule: React.FC<FormulaConfigModuleProps> = ({
  formulaRules,
  currentUser,
  onUpdateFormula,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const [editingRule, setEditingRule] = useState<FormulaRule | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');

  const openEdit = (rule: FormulaRule) => {
    if (!isAdmin) return;
    setEditingRule(rule);
    setFormulaValue(rule.formula);
    setDescriptionValue(rule.description);
  };

  const handleSave = () => {
    if (!editingRule || !isAdmin) return;
    onUpdateFormula({
      ...editingRule,
      formula: formulaValue,
      description: descriptionValue,
      lastModifiedBy: currentUser.name,
      lastModifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    setEditingRule(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <span>Calculation Rules &amp; Formula Governance</span>
            {isAdmin ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                Admin: Unlocked for Editing
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-normal flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Protected: Admin-Only Changes
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {isAdmin
              ? 'Super Admin privilege: You can modify system formulas, multiplier logic, and calculations.'
              : 'Non-admin users can edit and delete operational data records, but cannot alter formula rules.'}
          </p>
        </div>
      </div>

      {/* Formula Rules List */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-4">
          {!isAdmin && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 font-mono flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong>Formula Protection Active:</strong> Operational staff can freely edit or delete rows across Master List, Received, Requisitions, and Adjustments. Core business mathematical formulas are protected and can only be altered by an Administrator.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {formulaRules.map((rule) => {
              const isEditing = editingRule?.id === rule.id;

              return (
                <div
                  key={rule.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                        {rule.column}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm font-sans">{rule.name}</h3>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Target Sheet: <span className="text-slate-200">{rule.sheet}</span> • Column {rule.column}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleSave}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Formula</span>
                            </button>
                            <button
                              onClick={() => setEditingRule(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEdit(rule)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Formula</span>
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-500">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Formula Locked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formula Display / Input */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                      Excel Formula Expression (fx)
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formulaValue}
                        onChange={(e) => setFormulaValue(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2.5 text-amber-300 font-mono text-xs focus:outline-none"
                        rows={2}
                      />
                    ) : (
                      <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre">
                        {rule.formula}
                      </div>
                    )}
                  </div>

                  {/* Description & Metadata */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1 font-sans">
                    <p className="flex-1 text-[11px]">{rule.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 text-right">
                      Last altered by: <span className="text-slate-300">{rule.lastModifiedBy}</span> ({rule.lastModifiedAt})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

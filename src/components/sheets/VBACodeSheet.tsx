import React, { useState } from 'react';
import { VBA_MACROS, VBAMacro } from '../../data/vbaCodeContent';
import { Copy, Check, Play, FileCode2, Terminal, Info, ShieldCheck } from 'lucide-react';

interface VBACodeSheetProps {
  onRunMacro: (macroId: string) => void;
}

export const VBACodeSheet: React.FC<VBACodeSheetProps> = ({ onRunMacro }) => {
  const [selectedMacroId, setSelectedMacroId] = useState<string>('macro1');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedMacro = VBA_MACROS.find((m) => m.id === selectedMacroId) || VBA_MACROS[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const allCode = VBA_MACROS.map((m) => `' === ${m.title} ===\n' Location: ${m.location}\n${m.code}`).join('\n\n\n');
    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Banner / Sheet Instructions */}
      <div className="bg-slate-950 border-b border-slate-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              <h1 className="text-sm font-bold text-slate-100 font-mono">
                SHEET 9: VBA CODE &amp; AUTOMATION ENGINE
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                7 Complete Macros
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Cell A1: &quot;VBA MACROS — Open VBA Editor (<kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Alt+F11</kbd>), Insert &rarr; Module, paste code below&quot;
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All 7 Macros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main split view: Macro tabs on left, Code and Runner on right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Macro List Sidebar */}
        <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/60 overflow-y-auto p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            Workbook Macros
          </div>

          {VBA_MACROS.map((macro, idx) => {
            const isSelected = macro.id === selectedMacroId;
            return (
              <div
                key={macro.id}
                onClick={() => setSelectedMacroId(macro.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {idx + 1}. {macro.name}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 bg-slate-900'}`}>
                    {macro.location.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {macro.description}
                </p>
              </div>
            );
          })}

          <div className="p-3 mt-4 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workbook Security</span>
            </div>
            <div>Password: <span className="text-emerald-300">admin123</span></div>
            <div>Enforces UserInterfaceOnly:=True on sheets</div>
          </div>
        </div>

        {/* Code viewer & Runner Panel */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Top Macro Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/60">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  {selectedMacro.title}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded">
                  {selectedMacro.location}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedMacro.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Single Macro */}
              <button
                onClick={() => handleCopy(selectedMacro.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>

              {/* Run Macro in Web App */}
              <button
                onClick={() => onRunMacro(selectedMacro.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute in Web App</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 scrollbar-thin">
            <pre className="p-4 rounded-lg bg-slate-900/90 border border-slate-800/80 overflow-x-auto leading-relaxed text-emerald-300">
              <code>{selectedMacro.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

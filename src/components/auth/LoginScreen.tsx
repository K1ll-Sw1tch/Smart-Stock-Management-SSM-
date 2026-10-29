import React, { useState } from 'react';
import { UserAccount } from '../../types/inventory';
import { ShieldCheck, Lock, User, KeyRound, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = usernameInput.trim().toLowerCase();
    const targetUser = users.find(
      (u) => u.username.toLowerCase() === trimmedUser || u.name.toLowerCase() === trimmedUser
    );

    if (!targetUser) {
      setErrorMsg('Username not recognized. Please check with an Administrator.');
      return;
    }

    if (!targetUser.active) {
      setErrorMsg('This account has been deactivated. Contact an Administrator.');
      return;
    }

    if (targetUser.pin !== pinInput.trim()) {
      setErrorMsg('Incorrect 4-digit PIN. Please try again.');
      return;
    }

    onLogin(targetUser);
  };

  const handleQuickFill = (u: UserAccount) => {
    setUsernameInput(u.username);
    setPinInput(u.pin);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-4 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand & Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            SmartStock ERP
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Secure Warehouse &amp; Inventory Management Terminal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder="e.g. admin or peter.dube"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>4-Digit Security PIN</span>
            </label>
            <input
              type="password"
              required
              maxLength={8}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm tracking-widest text-center focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono animate-in fade-in duration-100">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Authenticate &amp; Enter System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Login Demo Accounts:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickFill(u)}
                className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                  {u.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {u.username} • PIN: {u.pin}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

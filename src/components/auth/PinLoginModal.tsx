import React, { useState } from 'react';
import { UserAccount } from '../../types/inventory';
import { ShieldCheck, UserCheck, X, KeyRound, Lock, Check } from 'lucide-react';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserAccount>(currentUser);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUserClick = (u: UserAccount) => {
    setSelectedUser(u);
    setPinInput('');
    setErrorMsg('');
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === selectedUser.pin) {
      onSelectUser(selectedUser);
      onClose();
    } else {
      setErrorMsg('Invalid PIN. Please try again or check setup.');
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg('');
      if (next.length === 4) {
        if (next === selectedUser.pin) {
          onSelectUser(selectedUser);
          onClose();
        } else {
          setErrorMsg('Incorrect 4-digit PIN');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs select-none animate-in fade-in duration-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight font-mono">
                Storekeeper &amp; Admin PIN Login Panel
              </h2>
              <p className="text-[11px] text-slate-400">
                Select your user profile and authenticate with your 4-digit PIN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: User Roster */}
          <div className="space-y-2 border-r border-slate-800/80 pr-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Select User Profile
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
              {users
                .filter((u) => u.active)
                .map((u) => {
                  const isSelected = u.id === selectedUser.id;
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold font-mono ${
                            isAdmin
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {u.avatarInitials}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-100 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.department}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isAdmin
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isAdmin ? 'ADMIN' : 'STAFF'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1 font-mono">
              <div className="font-bold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Demo Access PINs:</span>
              </div>
              <div>• Admin (Kwame Mensah): <strong className="text-amber-300">1234</strong></div>
              <div>• Staff (Peter Dube): <strong className="text-emerald-300">0001</strong></div>
              <div>• Staff (Linda Phiri): <strong className="text-emerald-300">0002</strong></div>
            </div>
          </div>

          {/* Right Column: PIN Keypad */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full text-center mb-3">
              <div className="text-xs text-slate-400">Authenticating as:</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {selectedUser.name}
              </div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  selectedUser.role === 'ADMIN'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedUser.role === 'ADMIN'
                  ? 'SUPER ADMIN (Full Edit, Audit & Formula Rights)'
                  : 'OPERATIONAL STAFF (Edit/Delete Data Rows, Formulas Locked)'}
              </span>
            </div>

            {/* PIN Display Dots */}
            <div className="flex items-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      filled
                        ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-xs'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <div className="text-red-400 text-[11px] font-mono my-1">{errorMsg}</div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-52 mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPinInput('');
                    else if (k === '⌫') handleBackspace();
                    else handleKeypadDigit(k);
                  }}
                  className="h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold font-mono text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Quick 1-Click Login button for Demo Convenience */}
            <button
              onClick={() => {
                setPinInput(selectedUser.pin);
                onSelectUser(selectedUser);
                onClose();
              }}
              className="mt-3 text-[11px] text-slate-400 hover:text-emerald-400 underline font-mono cursor-pointer"
            >
              ⚡ Quick Sign-In as {selectedUser.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

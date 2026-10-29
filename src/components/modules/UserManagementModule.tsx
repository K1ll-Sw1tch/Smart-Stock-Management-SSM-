import React, { useState } from 'react';
import { UserAccount, UserRole, SystemResetProposal } from '../../types/inventory';
import {
  Users,
  Plus,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit2,
  Lock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface UserManagementModuleProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  resetProposal: SystemResetProposal | null;
  onProposeReset: () => void;
  onApproveReset: (pin: string) => void;
  onRejectReset: () => void;
  onExecuteReset: () => void;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  resetProposal,
  onProposeReset,
  onApproveReset,
  onRejectReset,
  onExecuteReset,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [pin, setPin] = useState('1111');
  const [department, setDepartment] = useState('Operations');

  // Admin PIN Reset Modal state
  const [resetPinUser, setResetPinUser] = useState<UserAccount | null>(null);
  const [tempNewPin, setTempNewPin] = useState('');

  // Approval PIN input for multi-admin reset
  const [approvalPin, setApprovalPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  const adminUsers = users.filter((u) => u.role === 'ADMIN' && u.active);
  const hasCurrentUserApproved =
    resetProposal?.approvedAdminIds.includes(currentUser.id) ?? false;
  const allAdminsApproved =
    resetProposal !== null &&
    adminUsers.length > 0 &&
    adminUsers.every((a) => resetProposal.approvedAdminIds.includes(a.id));

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('STAFF');
    setPin(String(Math.floor(1000 + Math.random() * 9000)));
    setDepartment('Operations');
    setShowModal(true);
  };

  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setPin(user.pin);
    setDepartment(user.department);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !pin) return;

    const initials =
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ST';

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        username: username.trim().toLowerCase(),
        name: name.trim(),
        role,
        // Only update PIN if user hasn't changed it themselves yet, or keep existing
        pin: editingUser.pinChangedByUser ? editingUser.pin : pin,
        department,
        avatarInitials: initials,
      });
    } else {
      const newUser: UserAccount = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: username.trim().toLowerCase(),
        name: name.trim(),
        role,
        pin: pin.trim(),
        pinChangedByUser: false, // Initially set by admin
        department,
        avatarInitials: initials,
        createdAt: new Date().toISOString().split('T')[0],
        active: true,
      };
      onAddUser(newUser);
    }
    setShowModal(false);
  };

  const handleAdminResetUserPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinUser || !tempNewPin) return;

    onUpdateUser({
      ...resetPinUser,
      pin: tempNewPin.trim(),
      pinChangedByUser: false, // Reverted to admin-assigned temporary PIN
    });

    setResetPinUser(null);
    setTempNewPin('');
  };

  const handleApproveWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (approvalPin !== currentUser.pin) {
      setResetError('Invalid PIN entered. Authentication failed.');
      return;
    }
    onApproveReset(approvalPin);
    setApprovalPin('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Module Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>User Management &amp; Security Authority</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
              Admin Exclusive Console
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Setup storekeeper accounts, configure usernames, issue initial onboarding PINs, and enforce multi-admin consensus.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Setup New User</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-950/40 px-3 py-1.5 rounded border border-amber-800/60">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Authorization Required</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        {/* User Directory Table */}
        <div className="max-w-6xl mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="font-mono text-xs font-bold text-slate-200">
              Registered System Accounts ({users.length})
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              User PINs are private once changed by storekeepers
            </div>
          </div>

          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="px-4 py-3 text-left">Staff Name</th>
                <th className="px-4 py-3 text-left">Username (Admin Set)</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-center">System Role</th>
                <th className="px-4 py-3 text-center">Security PIN</th>
                <th className="px-4 py-3 text-center">Status</th>
                {isAdmin && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => {
                const isSuperAdmin = u.role === 'ADMIN';
                const isSelf = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 font-sans">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">
                      @{u.username}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-slate-300">{u.department}</td>

                    {/* Role */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuperAdmin
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* PIN Security: Hidden if changed by user! */}
                    <td className="px-4 py-3 text-center">
                      {u.pinChangedByUser ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="text-slate-400 font-mono tracking-widest text-[11px]"
                            title="Private PIN set by user (hidden from Admin)"
                          >
                            ••••
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                            Private
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setResetPinUser(u);
                                setTempNewPin(String(Math.floor(1000 + Math.random() * 9000)));
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono ml-1 cursor-pointer"
                              title="Reset user's PIN to a new temporary PIN"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-emerald-400 font-bold font-mono tracking-wider">
                            {u.pin}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                            Initial
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Active */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          u.active
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950/60 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {u.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isSelf && (
                            confirmDeleteUserId === u.id ? (
                              <div className="inline-flex items-center gap-1 bg-red-950 p-1 rounded border border-red-800 text-[10px]">
                                <span className="text-red-300 font-mono">Delete?</span>
                                <button
                                  onClick={() => {
                                    onDeleteUser(u.id);
                                    setConfirmDeleteUserId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteUserId(null)}
                                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteUserId(u.id)}
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MULTI-ADMIN CONSENSUS SYSTEM RESET SECTION */}
        {isAdmin && (
          <div className="max-w-6xl mx-auto bg-slate-950 border border-red-900/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm font-mono">
                    Multi-Admin Consensus System Reset
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    A complete system reset cannot be executed unilaterally. It requires explicit PIN sign-off from all {adminUsers.length} registered Admin accounts.
                  </p>
                </div>
              </div>

              {!resetProposal ? (
                <button
                  onClick={onProposeReset}
                  className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  Initiate Reset Proposal
                </button>
              ) : (
                <button
                  onClick={onRejectReset}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel Proposal
                </button>
              )}
            </div>

            {/* Active Proposal Voting Panel */}
            {resetProposal && (
              <div className="p-4 rounded-lg bg-red-950/20 border border-red-800/50 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-red-300">
                    <strong>Proposal Active:</strong> Initiated by {resetProposal.requestedByAdminName} at {resetProposal.requestedAt}
                  </div>
                  <div className="text-xs font-mono text-amber-300 font-bold">
                    Consensus: {resetProposal.approvedAdminIds.length} of {adminUsers.length} Admins Approved
                  </div>
                </div>

                {/* Admins Consensus Roster */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {adminUsers.map((a) => {
                    const hasApproved = resetProposal.approvedAdminIds.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between ${
                          hasApproved
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-200">{a.name}</div>
                          <div className="text-[10px]">@{a.username}</div>
                        </div>
                        {hasApproved ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Admin Sign-Off Form */}
                {!hasCurrentUserApproved ? (
                  <form onSubmit={handleApproveWithPin} className="pt-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300">
                      Sign-off as {currentUser.name}:
                    </span>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      placeholder="Enter Your 4-Digit PIN"
                      value={approvalPin}
                      onChange={(e) => setApprovalPin(e.target.value)}
                      className="px-3 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs font-mono w-48 text-center"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-semibold cursor-pointer"
                    >
                      Authorize Reset
                    </button>
                    {resetError && (
                      <span className="text-xs text-red-400 font-mono">{resetError}</span>
                    )}
                  </form>
                ) : (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You have signed off on this reset proposal. Awaiting remaining administrator approvals.</span>
                  </div>
                )}

                {/* Final Execution Button (Visible only when 100% consensus reached) */}
                {allAdminsApproved && (
                  <div className="pt-3 border-t border-red-800/60 flex items-center justify-between">
                    <span className="text-xs text-red-300 font-mono font-bold">
                      100% Admin Consensus Achieved. Ready for factory reset.
                    </span>
                    <button
                      onClick={onExecuteReset}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs font-mono shadow-md cursor-pointer animate-pulse"
                    >
                      Execute Complete System Reset Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Setup / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs text-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                {editingUser ? `Edit Account: @${editingUser.username}` : 'Setup New Storekeeper / Admin Account'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">
                  Unique Username (Admin Set Only) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. kwame.mensah or store.clerk1"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-cyan-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    <option value="STAFF">Staff (Storekeeper)</option>
                    <option value="ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operations, HR, Finance..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-slate-400 font-mono mb-1">
                    Initial 4-Digit Onboarding PIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-emerald-400 font-mono font-bold tracking-widest text-center"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    The user can change their PIN upon logging in; once changed, it is masked from Admin.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save User Updates' : 'Confirm & Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Temporary PIN Modal */}
      {resetPinUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs text-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                Reset Temporary PIN for {resetPinUser.name}
              </h2>
              <button onClick={() => setResetPinUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleAdminResetUserPin} className="p-5 space-y-3.5">
              <p className="text-[11px] text-slate-400 font-mono">
                Assign a new temporary PIN for @{resetPinUser.username}. The user can change this again once logged in.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  New Temporary 4-Digit PIN
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={tempNewPin}
                  onChange={(e) => setTempNewPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-amber-300 text-xs font-mono tracking-widest text-center font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPinUser(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer"
                >
                  Set Temporary PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AuditLogEntry, UserAccount } from '../../types/inventory';
import { History, Search, Calendar, RotateCcw, ShieldCheck, Lock } from 'lucide-react';

interface AuditLogModuleProps {
  auditLogs: AuditLogEntry[];
  currentUser: UserAccount;
  onRevertAction?: (logId: string) => void;
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({
  auditLogs,
  currentUser,
  onRevertAction,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-100 p-6 select-none font-sans">
        <div className="max-w-md bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 font-mono">
            Restricted Admin Console
          </h2>
          <p className="text-xs text-slate-400">
            The System Audit Trail &amp; Rollback console is strictly restricted to Administrator accounts.
          </p>
        </div>
      </div>
    );
  }

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Audit Trail &amp; One-Click Rollback</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
              Admin Exclusive
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Immutable log of all inventory transactions. Admins have super-authority to restore or undo changes made by non-admin users.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          Permanent Ledger • Immutable History
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, entity, action details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="REVERT">REVERT</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Entities</option>
              <option value="RECEIPT">Goods Received</option>
              <option value="ISSUE">Requisitions</option>
              <option value="ADJUSTMENT">Adjustments</option>
              <option value="PRODUCT">Products</option>
              <option value="SUPPLIER">Suppliers</option>
              <option value="DEPARTMENT">Departments</option>
              <option value="USER">Users</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {auditLogs.length} Records
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="px-4 py-3 text-left w-36">Timestamp</th>
                <th className="px-4 py-3 text-left w-44">User / Author</th>
                <th className="px-4 py-3 text-center w-28">Action</th>
                <th className="px-4 py-3 text-left w-32">Target Entity</th>
                <th className="px-4 py-3 text-left">Activity Summary</th>
                <th className="px-4 py-3 text-center w-28">Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No matching activity log records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  let actionBadge = 'bg-slate-800 text-slate-300';
                  if (log.action === 'CREATE') {
                    actionBadge = 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold';
                  } else if (log.action === 'UPDATE') {
                    actionBadge = 'bg-blue-950/80 text-blue-300 border border-blue-800 font-bold';
                  } else if (log.action === 'DELETE') {
                    actionBadge = 'bg-red-950/80 text-red-300 border border-red-800 font-bold';
                  } else if (log.action === 'REVERT') {
                    actionBadge = 'bg-purple-950/80 text-purple-300 border border-purple-800 font-bold';
                  } else if (log.action === 'LOGIN') {
                    actionBadge = 'bg-slate-800 text-slate-400 font-mono';
                  }

                  const isStaff = log.userRole === 'STAFF';
                  const canRevert =
                    isAdmin &&
                    isStaff &&
                    !log.isReverted &&
                    log.action !== 'LOGIN' &&
                    log.action !== 'REVERT';

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isStaff ? 'bg-cyan-400' : 'bg-amber-400'
                            }`}
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-200 font-sans block truncate">
                              {log.userName}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                isStaff
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {log.userRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="px-4 py-3 text-slate-300">
                        <span className="font-bold text-slate-200">{log.entity}</span>
                        {log.entityId && (
                          <div className="text-[10px] text-slate-500">{log.entityId}</div>
                        )}
                      </td>

                      {/* Summary */}
                      <td className="px-4 py-3 text-slate-200 font-sans">
                        <div>{log.summary}</div>
                        {log.isReverted && (
                          <div className="text-[10px] text-purple-400 font-mono mt-0.5 font-bold">
                            ↺ Restored / Reverted by Administrator
                          </div>
                        )}
                      </td>

                      {/* Admin Rollback Action */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {canRevert && onRevertAction ? (
                          confirmRevertId === log.id ? (
                            <div className="inline-flex items-center gap-1 bg-amber-950/80 p-1 rounded border border-amber-800 text-[10px]">
                              <span className="text-amber-300 font-mono">Confirm?</span>
                              <button
                                onClick={() => {
                                  onRevertAction(log.id);
                                  setConfirmRevertId(null);
                                }}
                                className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmRevertId(null)}
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRevertId(log.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                              title="Undo change and restore prior state"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Revert</span>
                            </button>
                          )
                        ) : log.isReverted ? (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Reverted
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

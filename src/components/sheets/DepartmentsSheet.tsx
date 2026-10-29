import React, { useState } from 'react';
import { DepartmentStaff } from '../../types/inventory';
import { Search, Plus, Building2, UserCheck, Trash2 } from 'lucide-react';

interface DepartmentsSheetProps {
  departments: DepartmentStaff[];
  onSelectCell: (coord: string, sheet: string, formula: string, value: string, isLocked: boolean) => void;
  onOpenNewStaff: () => void;
  onDeleteStaff?: (staffName: string) => void;
}

export const DepartmentsSheet: React.FC<DepartmentsSheetProps> = ({
  departments,
  onSelectCell,
  onOpenNewStaff,
  onDeleteStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = departments.filter(
    (d) =>
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.role && d.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Dept or Staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 font-mono text-xs"
            />
          </div>

          <button
            onClick={onOpenNewStaff}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department Staff</span>
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Named Ranges: <span className="text-emerald-400">DeptList</span> = Departments!$A$2:$A$20 |{' '}
          <span className="text-sky-400">StaffList</span> = Departments!$B$2:$B$20
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-xs select-text min-w-[800px]">
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-sm">
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="w-10 px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 sticky left-0 z-30">
                #
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[200px] font-bold text-slate-100">
                A: Department (=DeptList)
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[200px] font-bold text-slate-100">
                B: Staff Name (=StaffList)
              </th>
              <th className="px-3 py-2 text-left border-r border-slate-800 min-w-[200px]">C: Store Authorization Role</th>
              <th className="px-3 py-2 text-center min-w-[100px] sticky right-0 bg-slate-950 z-10 border-l border-slate-800">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
            {filtered.map((d, idx) => {
              const rowNum = idx + 2;

              return (
                <tr key={d.staffName + idx} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-2 py-2 text-center bg-slate-950 border-r border-slate-800 text-slate-500 font-mono sticky left-0 z-10">
                    {rowNum}
                  </td>

                  {/* A: Department */}
                  <td
                    onClick={() => onSelectCell(`A${rowNum}`, 'Departments', '', d.department, false)}
                    className="px-3 py-2 border-r border-slate-800 font-bold text-slate-100 cursor-pointer hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{d.department}</span>
                    </div>
                  </td>

                  {/* B: Staff Name */}
                  <td
                    onClick={() => onSelectCell(`B${rowNum}`, 'Departments', '', d.staffName, false)}
                    className="px-3 py-2 border-r border-slate-800 font-sans text-slate-200 font-medium cursor-pointer hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{d.staffName}</span>
                    </div>
                  </td>

                  {/* C: Role */}
                  <td
                    onClick={() => onSelectCell(`C${rowNum}`, 'Departments', '', d.role || '', false)}
                    className="px-3 py-2 font-sans text-slate-300 cursor-pointer hover:bg-slate-700/50 border-r border-slate-800"
                  >
                    {d.role || 'Authorized Requisitioner'}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 text-center sticky right-0 bg-slate-950 border-l border-slate-800 z-10">
                    {onDeleteStaff && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete staff member ${d.staffName}?`)) {
                            onDeleteStaff(d.staffName);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        title="Delete Staff Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

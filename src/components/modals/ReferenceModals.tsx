import React, { useState } from 'react';
import { Supplier, DepartmentStaff } from '../../types/inventory';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSupplierModal: React.FC<
  ModalProps & {
    onAdd: (s: Supplier) => void;
    initialData?: Supplier | null;
  }
> = ({ isOpen, onClose, onAdd, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [category, setCategory] = useState(initialData?.category || 'General');

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContactPerson(initialData.contactPerson || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setCategory(initialData.category || 'General');
    } else {
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setCategory('General');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      id: initialData?.id || `SUP-${Date.now().toString().slice(-3)}`,
      name,
      contactPerson,
      email,
      phone,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 font-mono">
            {initialData ? `Edit Supplier: ${initialData.name}` : 'Add Supplier (Named Range: SupplierList)'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 font-mono mb-1">Supplier Company Name (Col A)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Industrial Supplies"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. James Smith"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@company.com"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0199"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. PPE & Safety"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddStaffModal: React.FC<ModalProps & { onAdd: (d: DepartmentStaff) => void }> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [department, setDepartment] = useState('Operations');
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState('Requisition Officer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !department) return;
    onAdd({
      department,
      staffName,
      role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 font-mono">
            Sheet 7: Add Department &amp; Staff (Named Range: DeptList &amp; StaffList)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 font-mono mb-1">Department (Col A = DeptList)</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Quality Assurance"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Staff Member Name (Col B = StaffList)</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Tariro Ndlovu"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Authorization Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead QA Inspector"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Add Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  X,
} from 'lucide-react';
import { Employee, Department, SalaryStructure } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const EmployeeManager: React.FC = () => {
  const { showToast, hasPermission } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form State for New Employee
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    positionTitle: '',
    employmentType: 'Full-Time',
    basicSalary: 6500,
    salaryStructureId: '',
    gender: 'Male',
    dateOfBirth: '1992-05-15',
    address: '123 Market St, San Francisco',
    taxIdNumber: 'SSN-991-22-102',
    bankName: 'JPMorgan Chase',
    accountNumber: '992102931',
    routingNumber: '121000358',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const emps = await api.getEmployees();
      const depts = await api.getDepartments();
      const structs = await api.getSalaryStructures();
      setEmployees(emps);
      setDepartments(depts);
      setSalaryStructures(structs);
      if (depts.length > 0) setFormData(prev => ({ ...prev, departmentId: depts[0].id }));
      if (structs.length > 0) setFormData(prev => ({ ...prev, salaryStructureId: structs[0].id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.departmentId === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dept = departments.find(d => d.id === formData.departmentId);
      const newEmp = await api.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        departmentName: dept?.name || 'General',
        positionTitle: formData.positionTitle || 'Specialist',
        employmentType: formData.employmentType as any,
        basicSalary: Number(formData.basicSalary),
        salaryStructureId: formData.salaryStructureId,
        gender: formData.gender as any,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        taxIdNumber: formData.taxIdNumber,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber,
          accountHolderName: `${formData.firstName} ${formData.lastName}`,
        },
      });

      setEmployees([newEmp, ...employees]);
      setShowAddModal(false);
      showToast(`Employee ${newEmp.fullName} onboarded successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create employee', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Human Capital</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              {employees.length} Total Registered
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Employee Directory & Lifecycle</h1>
          <p className="text-xs text-slate-500">Manage employee contracts, departments, banking info & biometric ID mapping.</p>
        </div>

        {hasPermission('employees.create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Onboard Employee</span>
          </button>
        )}
      </div>

      {/* Bento Quick Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Active Workforce</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {employees.filter(e => e.status === 'Active').length}
          </p>
          <span className="text-[11px] font-medium text-emerald-600">100% Verified Biometric Mapped</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Full-Time Staff</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {employees.filter(e => e.employmentType === 'Full-Time').length}
          </p>
          <span className="text-[11px] font-medium text-slate-400">Standard monthly payroll tier</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Departments</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{departments.length}</p>
          <span className="text-[11px] font-medium text-slate-400">Across tenant operations</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Avg. Basic Salary</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ${Math.round(employees.reduce((acc, e) => acc + e.basicSalary, 0) / (employees.length || 1)).toLocaleString()}
          </p>
          <span className="text-[11px] font-medium text-indigo-600">Base salary benchmark</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Bento Grid Employee Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => (
          <div
            key={emp.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={emp.fullName}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{emp.fullName}</h3>
                    <p className="text-[11px] font-medium text-indigo-600">{emp.positionTitle}</p>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">{emp.employeeCode}</span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    emp.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* Data Details */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-800">{emp.departmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Biometric ID</span>
                  <span className="font-mono text-indigo-600 font-semibold">{emp.biometricId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Basic Salary</span>
                  <span className="font-mono font-bold text-slate-900">${emp.basicSalary.toLocaleString()} / mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bank Account</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {emp.bankDetails?.bankName} (•••{emp.bankDetails?.accountNumber?.slice(-4)})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-[11px] text-slate-400">Joined {emp.hireDate}</span>
              <button
                onClick={() => setSelectedEmp(emp)}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Full Profile & Documents →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Onboard New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Position Title</label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={e => setFormData({ ...formData, positionTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Basic Monthly Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Salary Structure Tier</label>
                  <select
                    value={formData.salaryStructureId}
                    onChange={e => setFormData({ ...formData, salaryStructureId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {salaryStructures.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Save & Map Biometric Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Detail Drawer / Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmp.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={selectedEmp.fullName}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedEmp.fullName}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{selectedEmp.positionTitle} • {selectedEmp.employeeCode}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
                <p className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Contact & Location</p>
                <p>Email: {selectedEmp.email}</p>
                <p>Phone: {selectedEmp.phone}</p>
                <p>Address: {selectedEmp.address}</p>
              </div>

              <div className="rounded-xl bg-indigo-50/60 p-3 space-y-1.5 border border-indigo-100">
                <p className="font-semibold text-indigo-900 uppercase text-[10px] tracking-wider">Banking & Payroll Mapping</p>
                <p>Bank: {selectedEmp.bankDetails?.bankName}</p>
                <p>Account #: {selectedEmp.bankDetails?.accountNumber}</p>
                <p>Routing #: {selectedEmp.bankDetails?.routingNumber}</p>
                <p>Tax ID / SSN: {selectedEmp.taxIdNumber}</p>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-3 space-y-1.5 border border-emerald-100">
                <p className="font-semibold text-emerald-900 uppercase text-[10px] tracking-wider">Biometric Terminal Key</p>
                <p className="font-mono font-bold text-emerald-800">Biometric Template Key: {selectedEmp.biometricId}</p>
                <p className="text-[11px] text-emerald-700">Hardware sync active on ZKTeco & Suprema kiosks.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

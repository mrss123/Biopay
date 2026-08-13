import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  FileText,
  UserCheck,
} from 'lucide-react';
import { LeaveRequest, Employee } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const LeaveManager: React.FC = () => {
  const { showToast, hasPermission, user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Maternity' | 'Unpaid' | 'Emergency'>('Annual');
  const [startDate, setStartDate] = useState('2026-08-20');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [reason, setReason] = useState('Family Vacation');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const reqs = await api.getLeaveRequests();
      const emps = await api.getEmployees();
      setLeaves(reqs);
      setEmployees(emps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emp = employees.find(e => e.email === user?.email) || employees[0];
      const newLeave = await api.submitLeaveRequest({
        employeeId: emp.id,
        employeeName: emp.fullName,
        leaveType,
        startDate,
        endDate,
        reason,
        totalDays: 5,
      });

      setLeaves([newLeave, ...leaves]);
      setShowApplyModal(false);
      showToast('Leave request submitted for supervisor approval!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updated = await api.updateLeaveStatus(id, 'Approved');
      setLeaves(leaves.map(l => (l.id === id ? updated : l)));
      showToast('Leave request APPROVED successfully', 'success');
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await api.updateLeaveStatus(id, 'Rejected');
      setLeaves(leaves.map(l => (l.id === id ? updated : l)));
      showToast('Leave request REJECTED', 'info');
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">PTO & Leave Governance</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              Automated Payroll Accrual Sync
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Leave Requests & Accrual Engine</h1>
          <p className="text-xs text-slate-500">Manage vacation requests, sick leaves, maternity leave & unpaid leave deductions.</p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Bento Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Pending Approval</div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {leaves.filter(l => l.status === 'Pending').length}
          </p>
          <span className="text-[11px] font-medium text-slate-400">Awaiting Manager Signoff</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Approved Leaves</div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {leaves.filter(l => l.status === 'Approved').length}
          </p>
          <span className="text-[11px] font-medium text-emerald-600">Synced to Timecard Calendar</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Avg. Annual Accrual Balance</div>
          <p className="text-2xl font-black text-slate-900 mt-2">18.5 Days</p>
          <span className="text-[11px] font-medium text-indigo-600">Per employee quota</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Unpaid Days This Month</div>
          <p className="text-2xl font-black text-red-600 mt-2">4 Days</p>
          <span className="text-[11px] font-medium text-red-600">Auto-deducted in Payroll Engine</span>
        </div>
      </div>

      {/* Leave Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Total Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {leaves.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{req.employeeName}</div>
                    <div className="text-[10px] text-slate-400">ID: {req.employeeId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{req.leaveType}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {req.startDate} → {req.endDate}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {req.totalDays} Days
                  </td>
                  <td className="px-6 py-4 text-slate-600">{req.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' && hasPermission('leave.approve') ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Request Time Off</h3>
            <p className="text-xs text-slate-500 mb-4">Submit leave request to HR & supervisor.</p>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Annual">Annual Paid Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity / Paternity</option>
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

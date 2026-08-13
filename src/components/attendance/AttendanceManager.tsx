import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Building2,
  UserCheck,
  ShieldCheck,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const AttendanceManager: React.FC = () => {
  const { showToast } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-13');

  const [showManualPunchModal, setShowManualPunchModal] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualPunchType, setManualPunchType] = useState<'IN' | 'OUT'>('IN');
  const [manualReason, setManualReason] = useState('Forgot RFID / Biometric Card');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const records = await api.getAttendanceRecords({ date: selectedDate });
      const emps = await api.getEmployees();
      setAttendance(records);
      setEmployees(emps);
      if (emps.length > 0) setManualEmpId(emps[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emp = employees.find(e => e.id === manualEmpId);
      if (!emp) return;

      const updatedRecord = await api.submitManualPunch({
        employeeId: emp.id,
        employeeName: emp.fullName,
        date: selectedDate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: manualPunchType,
        reason: manualReason,
      });

      showToast(`Manual punch adjustment recorded for ${emp.fullName}`, 'success');
      setShowManualPunchModal(false);
      loadAttendance();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit punch', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time & Attendance Engine</span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
              Auto-Calculated Shift Hours & OT
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Attendance & Shift Records</h1>
          <p className="text-xs text-slate-500">Biometric timecards, shift policies, late grace periods & overtime approvals.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualPunchModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Manual Punch Adjustment</span>
          </button>
        </div>
      </div>

      {/* Bento Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Present Today</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {attendance.filter(a => a.status === 'Present' || a.status === 'Late').length}
          </p>
          <span className="text-[11px] font-medium text-emerald-600">
            {Math.round(
              ((attendance.filter(a => a.status === 'Present' || a.status === 'Late').length) /
                (attendance.length || 1)) *
                100
            )}
            % Shift Compliance
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Late Arrivals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {attendance.filter(a => a.status === 'Late').length}
          </p>
          <span className="text-[11px] font-medium text-amber-600">Grace period exceeded</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Absences / Unexcused</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {attendance.filter(a => a.status === 'Absent').length}
          </p>
          <span className="text-[11px] font-medium text-slate-400">Pending Leave Request check</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Total Overtime (Hours)</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {attendance.reduce((acc, a) => acc + (a.overtimeHours || 0), 0)} hrs
          </p>
          <span className="text-[11px] font-medium text-indigo-600">Calculated for 1.5x pay multiplier</span>
        </div>
      </div>

      {/* Filter & Date Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee name or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bento Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Biometric Clock IN</th>
                <th className="px-6 py-4">Biometric Clock OUT</th>
                <th className="px-6 py-4">Total Worked</th>
                <th className="px-6 py-4">OT Hours</th>
                <th className="px-6 py-4">Attendance Status</th>
                <th className="px-6 py-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredAttendance.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{record.employeeName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{record.employeeCode} • {record.departmentName}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {record.checkInTime || '--:--'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {record.checkOutTime || '--:--'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {record.totalHoursWorked ? `${record.totalHoursWorked} hrs` : '--'}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-amber-600">
                    {record.overtimeHours ? `+${record.overtimeHours} hrs` : '0'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        record.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : record.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : record.status === 'On Leave'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-mono text-slate-400">
                      {record.isManualAdjustment ? 'Manual Adj by Admin' : 'Hardware Sync'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {showManualPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Record Manual Punch Adjustment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Admin override for missing hardware punches or field duties.
            </p>

            <form onSubmit={handleManualPunch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={manualEmpId}
                  onChange={e => setManualEmpId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Punch Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualPunchType('IN')}
                    className={`p-2 rounded-lg font-bold border ${
                      manualPunchType === 'IN'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    CLOCK IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPunchType('OUT')}
                    className={`p-2 rounded-lg font-bold border ${
                      manualPunchType === 'OUT'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    CLOCK OUT
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={manualReason}
                  onChange={e => setManualReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualPunchModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Confirm Timecard Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

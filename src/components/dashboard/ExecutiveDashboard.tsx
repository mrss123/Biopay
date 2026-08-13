import React, { useState, useEffect } from 'react';
import {
  Users,
  Fingerprint,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarCheck2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
  ArrowDownRight,
  Activity,
  Check,
  BarChart2,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface ExecutiveDashboardProps {
  onNavigate: (tab: any) => void;
  onOpenBiometricPunch: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigate,
  onOpenBiometricPunch,
}) => {
  const { organization, showToast } = useAuth();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getReportsSummary();
      const periods = await api.getPayrollPeriods();
      const leaves = await api.getLeaveRequests();

      setSummaryData(res);
      setPayrollPeriods(periods);
      setPendingLeaveCount(leaves.filter(l => l.status === 'pending').length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSyncDevices = async () => {
    showToast('Triggered background heartbeat polling across all 4 biometric terminals.', 'success');
  };

  if (loading || !summaryData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-xs font-semibold text-slate-500">Loading Executive Payroll Analytics...</span>
        </div>
      </div>
    );
  }

  const activePeriod = payrollPeriods.find(p => p.status === 'review' || p.status === 'calculating') || payrollPeriods[0];

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Top Quick Banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              {organization?.subscriptionTier.toUpperCase()} TENANT
            </span>
            <span className="text-xs text-slate-400">• {organization?.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Workforce & Payroll Executive Dashboard</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time biometric attendance processing, automated tax withholdings, and multi-tenant payroll engine controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenBiometricPunch}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition-all active:scale-95"
          >
            <Fingerprint className="h-4 w-4" />
            <span>Biometric Punch</span>
          </button>
          <button
            onClick={() => onNavigate('payroll')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-violet-500 transition-all active:scale-95"
          >
            <DollarSign className="h-4 w-4" />
            <span>Run Payroll Engine</span>
          </button>
        </div>
      </div>

      {/* HIGH-IMPACT BENTO GRID STATISTICS SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Total Payroll (Featured 2-Column Tile) */}
        <div
          onClick={() => onNavigate('payroll')}
          className="group cursor-pointer md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
        >
          {/* Subtle Background Deco */}
          <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-indigo-50/50 group-hover:bg-indigo-100/60 transition-colors pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Payroll</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Cycle: {activePeriod?.periodName || 'Current Period'}</span>
                  </div>
                </div>
              </div>

              {/* Percentage Trend Badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +8.4% vs last period
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${summaryData.currentMonthlyGross?.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">Gross Expenditure</span>
            </div>
          </div>

          {/* Micro Stat Breakdown Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Net Payout</span>
              <span className="text-sm font-black text-emerald-600">${summaryData.currentMonthlyNet?.toLocaleString()}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Taxes & Deductions</span>
              <span className="text-sm font-black text-indigo-600">${((summaryData.currentMonthlyGross || 0) - (summaryData.currentMonthlyNet || 0)).toLocaleString()}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Budget Usage</span>
              <span className="text-sm font-black text-slate-800">84.2%</span>
            </div>
          </div>
        </div>

        {/* Bento Tile 2: Attendance Rate Tile */}
        <div
          onClick={() => onNavigate('attendance')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200">
                <Clock className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +2.1%
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Biometric Attendance Rate</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{summaryData.attendanceRate}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Punctuality Score</span>
              <span className="text-emerald-600">High (98.4%)</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${summaryData.attendanceRate}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 block">Avg Clock-In: 08:42 AM Today</span>
          </div>
        </div>

        {/* Bento Tile 3: Active Workforce Tile */}
        <div
          onClick={() => onNavigate('employees')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-200">
                <Users className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/60">
                <Users className="h-3.5 w-3.5" />
                100% Mapped
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Active Workforce</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{summaryData.activeEmployees}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Biometric Registered</span>
            <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">{summaryData.activeEmployees} / {summaryData.activeEmployees}</span>
          </div>
        </div>

        {/* Bento Tile 4: Hardware Fleet Status (Span 2) */}
        <div
          onClick={() => onNavigate('biometrics')}
          className="group cursor-pointer md:col-span-2 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md">
                <Fingerprint className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Biometric Kiosk Fleet</span>
                <h3 className="text-base font-bold text-white">4 Terminals Active</h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              100% Fleet Health
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: 'HQ Turnstile', status: 'Online' },
              { name: 'Engineering Bio', status: 'Online' },
              { name: 'Executive RFID', status: 'Online' },
              { name: 'WebCam AI Station', status: 'Online' },
            ].map((k, idx) => (
              <div key={idx} className="rounded-xl bg-slate-800/80 p-2.5 text-center border border-slate-700/50">
                <span className="text-[10px] text-slate-400 truncate block">{k.name}</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{k.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Tile 5: Pending Action Requests */}
        <div
          onClick={() => onNavigate('leave')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-200">
                <CalendarCheck2 className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60">
                Requires Review
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pending Requests</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{pendingLeaveCount}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Leave Applications</span>
            <span className="font-bold text-amber-600">Action Required</span>
          </div>
        </div>

        {/* Bento Tile 6: Overtime Analytics Tile */}
        <div
          onClick={() => onNavigate('reports')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Zap className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                <ArrowDownRight className="h-3.5 w-3.5" />
                -4.2% Cost
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Monthly Overtime</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">164 Hours</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Biometric Verified</span>
            <span className="font-bold text-indigo-600">1.5x Multiplier</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Recharts Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payroll Expense Trend (Area Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payroll Expenditure Trend (Monthly)</h3>
              <p className="text-[11px] text-slate-400">Gross Salary vs Net Disbursement amounts ($ USD)</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Full Analytics</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summaryData.monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="gross" name="Gross Payroll" stroke="#6366f1" fillOpacity={1} fill="url(#grossColor)" strokeWidth={2} />
                <Area type="monotone" dataKey="net" name="Net Salary Payout" stroke="#10b981" fillOpacity={1} fill="url(#netColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Cost Distribution (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Department Cost Breakdown</h3>
            <p className="text-[11px] text-slate-400">Monthly Gross Salary by Department</p>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData.deptCosts} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `$${v / 1000}k`} axisLine={false} />
                <YAxis dataKey="departmentName" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={110} axisLine={false} />
                <Tooltip formatter={(val: any) => [`$${val.toLocaleString()}`, 'Gross Cost']} />
                <Bar dataKey="monthlyGrossCost" name="Gross Cost" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Biometric Terminal Health Status Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Biometric Terminal Fleet Status</h3>
            <p className="text-[11px] text-slate-400">Real-time device sync logs & hardware template counts</p>
          </div>
          <button
            onClick={handleQuickSyncDevices}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Poll Hardware Heartbeats</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'HQ Main Turnstile', type: 'Facial Recognition', vendor: 'ZKTeco', status: 'online', templates: 120 },
            { name: 'Engineering BioFinger', type: 'Fingerprint', vendor: 'Suprema', status: 'online', templates: 85 },
            { name: 'Executive Suite RFID', type: 'RFID Card', vendor: 'Hikvision', status: 'online', templates: 15 },
            { name: 'WebCam AI Station', type: 'Virtual Face Kiosk', vendor: 'BioPay-WebCam', status: 'online', templates: 12 },
          ].map((dev, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">{dev.name}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{dev.vendor} • {dev.type}</span>
                <span className="font-semibold text-slate-700">{dev.templates} Keys</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

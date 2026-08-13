import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const ReportsAnalyticsView: React.FC = () => {
  const { showToast } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.getReportsSummary().then(setSummary);
  }, []);

  const handleExportCSV = () => {
    showToast('Exported full HR & Payroll audit report to CSV/Excel', 'success');
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enterprise Intelligence</span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">HR & Payroll Reports Analytics</h1>
          <p className="text-xs text-slate-500">Cross-departmental labor costs, overtime analytics, tax withholding metrics & timecard compliance.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export Master CSV / PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Costs Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Gross Payroll by Department</h3>
          <p className="text-xs text-slate-400 mb-4">Gross expenditure breakdown in USD</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.deptCosts || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="departmentName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={(val: any) => [`$${val.toLocaleString()}`, 'Gross Salary']} />
                <Bar dataKey="monthlyGrossCost" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department Headcount Ratio</h3>
          <p className="text-xs text-slate-400 mb-4">Employee distribution across tenant units</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={summary?.deptCosts || []}
                  dataKey="employeeCount"
                  nameKey="departmentName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ departmentName, employeeCount }) => `${departmentName}: ${employeeCount}`}
                >
                  {(summary?.deptCosts || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

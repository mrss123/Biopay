import React from 'react';
import { User, DollarSign, Calendar, Clock, FileText, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const EmployeePortalView: React.FC = () => {
  const { user, showToast } = useAuth();

  return (
    <div className="space-y-6">
      {/* Employee Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt="User"
            className="h-16 w-16 rounded-2xl object-cover ring-4 ring-indigo-500/30"
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Employee Self-Service Portal</span>
            <h1 className="text-xl font-black">{user?.name}</h1>
            <p className="text-xs text-slate-300">{user?.email} • Biometric ID: BIO-FAC-1001</p>
          </div>
        </div>

        <button
          onClick={() => showToast('Downloaded current month payslip PDF', 'success')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download Latest Payslip</span>
        </button>
      </div>

      {/* Bento Grid Self Service */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Net Take-Home Pay (August)</span>
          <p className="text-2xl font-black text-slate-900">$5,142.50</p>
          <span className="text-[11px] font-semibold text-emerald-600">Disbursed to JPMorgan Chase ••9921</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Annual Leave Quota</span>
          <p className="text-2xl font-black text-indigo-600">14.5 Days Available</p>
          <span className="text-[11px] text-slate-400">Out of 20 total allocated days</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">This Month Clock-Ins</span>
          <p className="text-2xl font-black text-emerald-600">22 / 22 Days Present</p>
          <span className="text-[11px] text-emerald-600">100% Punctuality & Attendance</span>
        </div>
      </div>
    </div>
  );
};

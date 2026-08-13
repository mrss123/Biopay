import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Edit2, ShieldCheck, DollarSign, Percent, Layers } from 'lucide-react';
import { SalaryStructure } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const SalaryStructuresView: React.FC = () => {
  const { showToast } = useAuth();
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      setLoading(true);
      const res = await api.getSalaryStructures();
      setStructures(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compensation Architecture</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              Tax Brackets & Benefit Multipliers
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Salary Structures & Tax Rules</h1>
          <p className="text-xs text-slate-500">Configure base bands, housing allowances, transport stipends, overtime rates & statutory tax tiers.</p>
        </div>

        <button
          onClick={() => showToast('New salary tier modal', 'info')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Compensation Band</span>
        </button>
      </div>

      {/* Bento Grid Structures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {structures.map(struct => (
          <div key={struct.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{struct.name}</h3>
                    <p className="text-[11px] text-slate-500">{struct.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Base Salary Range</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${struct.baseSalaryRange.min.toLocaleString()} - ${struct.baseSalaryRange.max.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Housing Allowance</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {struct.housingAllowancePercentage}% of Base
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Transport Stipend</span>
                  <span className="font-mono font-bold text-indigo-600">
                    ${struct.transportAllowanceFixed}/mo
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Overtime Rate</span>
                  <span className="font-mono font-bold text-amber-600">
                    {struct.overtimeRateMultiplier}x Hourly Base
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pension Contribution</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {struct.pensionPercentage}% (Employee Match)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PAYE Income Tax Bracket</span>
                  <span className="font-mono font-bold text-red-600">
                    {struct.taxPercentage}% Statutory
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">Tax ID: {struct.taxBracketId}</span>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Edit Tier Rules →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

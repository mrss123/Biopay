import React from 'react';
import { Download, Printer, X, ShieldCheck, Building2, CreditCard } from 'lucide-react';
import { PayrollItem } from '../../types/index.js';

interface PayslipModalProps {
  item: PayrollItem | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl print:shadow-none print:border-none print:max-w-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Official Payslip Document</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Finalized & Direct Deposited
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Payslip Canvas */}
        <div className="mt-4 space-y-6">
          {/* Org Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  P
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">
                  PRISM<span className="text-indigo-600">PAY</span> HR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Apex Enterprise Corp • SF Office</p>
              <p className="text-[10px] text-slate-400">EIN: 99-8102931 • Tenant Isolation ID: TN-00192</p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                PAYSLIP #PS-{item.id.slice(0, 8).toUpperCase()}
              </span>
              <p className="text-xs font-semibold text-slate-700 mt-1">Pay Period: {item.payPeriod}</p>
              <p className="text-[11px] text-slate-400">Payout Date: 2026-08-30</p>
            </div>
          </div>

          {/* Employee Meta Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Employee Details</span>
              <p className="font-bold text-slate-900 text-sm">{item.employeeName}</p>
              <p className="text-slate-600">{item.departmentName} • {item.employeeCode}</p>
              <p className="text-slate-500">Biometric Key: {item.biometricId}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Bank Account & Tax</span>
              <p className="font-semibold text-slate-800">JPMorgan Chase Bank</p>
              <p className="font-mono text-slate-600">Account: •••• 9921</p>
              <p className="text-slate-500">Tax Status: Married Single-Filing</p>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            {/* Earnings */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-100 pb-2 mb-3">
                Gross Earnings (+)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Monthly Salary</span>
                  <span className="font-mono font-semibold">${item.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Housing Allowance</span>
                  <span className="font-mono font-semibold">${item.housingAllowance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transport Allowance</span>
                  <span className="font-mono font-semibold">${item.transportAllowance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Overtime Pay ({item.overtimeHours} hrs)</span>
                  <span className="font-mono font-semibold">${item.overtimePay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {item.bonusPay > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Performance Bonus</span>
                    <span className="font-mono font-semibold">+${item.bonusPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                  <span>Total Gross Salary</span>
                  <span className="font-mono">${item.grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-100 pb-2 mb-3">
                Deductions (-)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Income Tax (PAYE)</span>
                  <span className="font-mono font-semibold text-red-600">-${item.taxDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Social Security / Pension</span>
                  <span className="font-mono font-semibold text-red-600">-${item.pensionDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Health Insurance Contribution</span>
                  <span className="font-mono font-semibold text-red-600">-${item.healthInsurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {item.unpaidLeaveDeductions > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Unpaid Leave Penalty</span>
                    <span className="font-mono font-semibold">-${item.unpaidLeaveDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-red-600">-${item.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Highlight Net Salary Box */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white shadow-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Net Take-Home Pay</span>
              <p className="text-2xl font-black text-white mt-1">
                ${item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 font-bold text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Cryptographic Sign
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Calculated via PRISM-PAY Automated Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

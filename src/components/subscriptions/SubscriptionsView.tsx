import React from 'react';
import { CreditCard, Check, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const SubscriptionsView: React.FC = () => {
  const { organization, showToast } = useAuth();

  const handleUpgrade = (tier: string) => {
    showToast(`Requested upgrade to ${tier.toUpperCase()} tier! Billing team notified.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SaaS Multi-Tenant Billing</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Tenant Plan & Usage Limits</h1>
        <p className="text-xs text-slate-500">Current Tier: <strong className="text-indigo-600 uppercase">{organization?.subscriptionTier}</strong> • Currency: {organization?.currency}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: 'Starter',
            price: '$99 / mo',
            desc: 'Up to 50 employees and 2 biometric devices.',
            features: ['50 Employees Max', '2 Biometric Kiosks', 'Basic Payroll Engine', 'Standard Tax Rules'],
            current: organization?.subscriptionTier === 'starter',
          },
          {
            name: 'Business',
            price: '$299 / mo',
            desc: 'Up to 250 employees and 10 biometric terminals.',
            features: ['250 Employees Max', '10 Biometric Kiosks', 'Automated Overtime & Tax', 'Custom Salary Structures', 'Gemini AI Assistant'],
            current: organization?.subscriptionTier === 'business',
          },
          {
            name: 'Enterprise',
            price: '$899 / mo',
            desc: 'Unlimited workforce, custom hardware integrations & SLA.',
            features: ['Unlimited Workforce', 'Unlimited Biometric Fleet', 'Dedicated Tenant Vault', '24/7 SLA & Custom ERP Sync', 'Audit Trail Compliance'],
            current: organization?.subscriptionTier === 'enterprise',
          },
        ].map((p, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              p.current
                ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                {p.current && (
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{p.price}</p>
              <p className="text-xs text-slate-500 mt-1">{p.desc}</p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                {p.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade(p.name)}
              disabled={p.current}
              className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                p.current
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
              }`}
            >
              {p.current ? 'Current Plan' : `Upgrade to ${p.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

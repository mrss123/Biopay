import React from 'react';
import {
  LayoutDashboard,
  Users,
  Fingerprint,
  Clock,
  CalendarCheck2,
  DollarSign,
  Layers,
  BarChart3,
  UserCircle,
  FileText,
  CreditCard,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Permission } from '../../types/index.js';

export type NavTab =
  | 'dashboard'
  | 'employees'
  | 'biometrics'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'salary_structures'
  | 'reports'
  | 'portal'
  | 'audit'
  | 'subscriptions';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenBiometricPunchModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBiometricPunchModal,
}) => {
  const { organization, hasPermission } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; permission?: Permission }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users, permission: 'employees.view' },
    { id: 'biometrics', label: 'Biometric Kiosks', icon: Fingerprint, permission: 'biometrics.sync' },
    { id: 'attendance', label: 'Attendance & Shifts', icon: Clock, permission: 'attendance.view' },
    { id: 'leave', label: 'Leave Management', icon: CalendarCheck2, permission: 'leave.view' },
    { id: 'payroll', label: 'Payroll Engine', icon: DollarSign, permission: 'payroll.view' },
    { id: 'salary_structures', label: 'Salary Structures', icon: Layers, permission: 'salary_structures.manage' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, permission: 'reports.view' },
    { id: 'portal', label: 'Employee Self-Service', icon: UserCircle },
    { id: 'audit', label: 'Audit Trail Logs', icon: FileText, permission: 'audit.view' },
    { id: 'subscriptions', label: 'SaaS Plan & Billing', icon: CreditCard, permission: 'subscriptions.manage' },
  ];

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-slate-200 bg-slate-900 text-slate-300 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30">
            <Fingerprint className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-white text-base">BioPay SaaS</span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Enterprise Payroll</span>
          </div>
        </div>

        {/* Live Punch Simulator Quick Trigger Button */}
        <div className="p-4">
          <button
            onClick={onOpenBiometricPunchModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-500 transition-all transform active:scale-95"
          >
            <Fingerprint className="h-4 w-4 text-emerald-200 animate-pulse" />
            <span>Simulate Biometric Punch</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-3 py-2">
          {navItems.map(item => {
            if (item.permission && !hasPermission(item.permission)) return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tenant Plan & Hardware Meters Footer */}
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
            <span>{organization?.subscriptionTier.toUpperCase()} Plan</span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">Active</span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400">
            <div>
              <div className="flex justify-between mb-1">
                <span>Employees</span>
                <span>{organization?.employeeCount} / {organization?.maxEmployees}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, ((organization?.employeeCount || 1) / (organization?.maxEmployees || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Biometric Devices</span>
                <span>{organization?.deviceCount} / {organization?.maxDevices}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, ((organization?.deviceCount || 1) / (organization?.maxDevices || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

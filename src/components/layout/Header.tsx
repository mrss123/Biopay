import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserCheck,
  Bell,
  Search,
  Sparkles,
  ShieldCheck,
  Fingerprint,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole, AppNotification } from '../../types/index.js';
import { api } from '../../services/api.js';

interface HeaderProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleAi, isAiOpen }) => {
  const { user, organization, availableTenants, activeRole, switchTenant, switchRole, toastMessage } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [organization?.id]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // quiet
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'org_owner', label: 'Organization Owner' },
    { role: 'hr_manager', label: 'HR Manager' },
    { role: 'payroll_manager', label: 'Payroll Manager' },
    { role: 'accountant', label: 'Accountant' },
    { role: 'manager', label: 'Department Manager' },
    { role: 'employee', label: 'Employee Portal View' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Search & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, devices, payslips..."
            className="h-9 w-72 rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Live Biometric Pulse Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
          <span>Biometric Kiosks: Active</span>
        </div>
      </div>

      {/* Right Actions: Tenant Switcher, Role Simulator, Notifications, AI Assistant, User */}
      <div className="flex items-center gap-3">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div
            className={`hidden xl:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : toastMessage.type === 'info'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Organization / Tenant Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span className="max-w-[130px] truncate">{organization?.name || 'Select Tenant'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showTenantDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-slate-900/5">
              <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Tenant Isolation Scope
              </div>
              {availableTenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    switchTenant(t.id);
                    setShowTenantDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                    t.id === organization?.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-[10px] text-slate-400">{t.subscriptionTier.toUpperCase()} Plan • {t.currency}</span>
                  </div>
                  {t.id === organization?.id && <Check className="h-4 w-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role Simulator Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-indigo-900 hover:bg-indigo-100/70 transition-all"
          >
            <UserCheck className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold capitalize">{activeRole.replace('_', ' ')}</span>
            <ChevronDown className="h-3.5 w-3.5 text-indigo-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-slate-900/5">
              <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Simulate RBAC User Role
              </div>
              {rolesList.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                    activeRole === r.role ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{r.label}</span>
                  {activeRole === r.role && <Check className="h-4 w-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gemini AI Co-Pilot Toggle */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isAiOpen
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className={`h-4 w-4 ${isAiOpen ? 'text-amber-300' : 'text-violet-600'}`} />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <button
                  onClick={async () => {
                    await api.markNotificationsRead();
                    fetchNotifications();
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2.5 text-xs transition-colors ${
                        n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/60 font-medium text-indigo-950 border border-indigo-100'
                      }`}
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="mt-0.5 text-[11px] opacity-90">{n.message}</p>
                      <span className="mt-1 block text-[10px] opacity-60">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt="Avatar"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

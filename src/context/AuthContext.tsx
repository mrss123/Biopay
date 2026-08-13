import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization, UserRole, Permission } from '../types/index.js';
import { api, setApiTenant } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  availableTenants: Organization[];
  activeRole: UserRole;
  switchTenant: (tenantId: string) => Promise<void>;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS_MAP: Record<UserRole, Permission[]> = {
  super_admin: [
    'employees.view',
    'employees.create',
    'employees.edit',
    'employees.delete',
    'attendance.view',
    'attendance.manage',
    'attendance.approve_correction',
    'biometrics.sync',
    'biometrics.manage_devices',
    'leave.view',
    'leave.request',
    'leave.approve',
    'payroll.view',
    'payroll.process',
    'payroll.approve',
    'payroll.finalize',
    'salary_structures.manage',
    'reports.view',
    'reports.export',
    'settings.manage',
    'audit.view',
    'subscriptions.manage',
  ],
  org_owner: [
    'employees.view',
    'employees.create',
    'employees.edit',
    'employees.delete',
    'attendance.view',
    'attendance.manage',
    'attendance.approve_correction',
    'biometrics.sync',
    'biometrics.manage_devices',
    'leave.view',
    'leave.request',
    'leave.approve',
    'payroll.view',
    'payroll.process',
    'payroll.approve',
    'payroll.finalize',
    'salary_structures.manage',
    'reports.view',
    'reports.export',
    'settings.manage',
    'audit.view',
    'subscriptions.manage',
  ],
  hr_manager: [
    'employees.view',
    'employees.create',
    'employees.edit',
    'attendance.view',
    'attendance.manage',
    'attendance.approve_correction',
    'biometrics.sync',
    'leave.view',
    'leave.approve',
    'payroll.view',
    'reports.view',
  ],
  payroll_manager: [
    'employees.view',
    'attendance.view',
    'payroll.view',
    'payroll.process',
    'payroll.approve',
    'payroll.finalize',
    'salary_structures.manage',
    'reports.view',
    'reports.export',
  ],
  accountant: ['employees.view', 'payroll.view', 'reports.view', 'reports.export'],
  manager: ['employees.view', 'attendance.view', 'attendance.approve_correction', 'leave.view', 'leave.approve'],
  employee: ['attendance.view', 'leave.view', 'leave.request', 'payroll.view'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Organization[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('org_owner');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAuthMe();
      setUser(res.user);
      setOrganization(res.organization);
      setAvailableTenants(res.availableTenants);
      if (res.user?.role) {
        setActiveRole(res.user.role);
      }
    } catch (err) {
      console.error('Failed to load user auth context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchTenant = async (tenantId: string) => {
    setApiTenant(tenantId);
    await loadData();
    showToast(`Switched tenant workspace to ${tenantId}`, 'info');
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (user) {
      setUser({
        ...user,
        role,
        permissions: ROLE_PERMISSIONS_MAP[role] || [],
      });
    }
    showToast(`Role updated to ${role.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS_MAP[activeRole] || user.permissions || [];
    return perms.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        availableTenants,
        activeRole,
        switchTenant,
        switchRole,
        hasPermission,
        refreshUserData: loadData,
        loading,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

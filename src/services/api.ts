import {
  Organization,
  Employee,
  Department,
  BiometricDevice,
  BiometricEvent,
  AttendanceRecord,
  AttendanceCorrectionRequest,
  SalaryStructure,
  LeaveType,
  LeaveRequest,
  PayrollPeriod,
  PayrollEmployeeRecord,
  Payslip,
  AuditLog,
  AppNotification,
  User,
} from '../types/index.js';

let currentTenantId = 'org-acme';

export function setApiTenant(tenantId: string) {
  currentTenantId = tenantId;
}

export function getApiTenant(): string {
  return currentTenantId;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-id': currentTenantId,
    ...(options.headers || {}),
  };

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API Error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth & Tenants
  getAuthMe: () => request<{ user: User; organization: Organization; availableTenants: Organization[] }>('/api/v1/auth/me'),
  getOrganizations: () => request<Organization[]>('/api/v1/organizations'),
  updateOrgSettings: (id: string, settings: any) =>
    request<Organization>(`/api/v1/organizations/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Employees
  getEmployees: () => request<Employee[]>('/api/v1/employees'),
  createEmployee: (data: Partial<Employee>) =>
    request<Employee>('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: string, data: Partial<Employee>) =>
    request<Employee>(`/api/v1/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Departments
  getDepartments: () => request<Department[]>('/api/v1/departments'),

  // Biometrics & Punching
  getBiometricDevices: () => request<BiometricDevice[]>('/api/v1/biometric-devices'),
  createBiometricDevice: (data: Partial<BiometricDevice>) =>
    request<BiometricDevice>('/api/v1/biometric-devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  triggerBiometricPunch: (payload: {
    biometricId: string;
    deviceId: string;
    punchType?: string;
    verificationMode?: string;
    snapshotUrl?: string;
  }) =>
    request<{ message: string; event: BiometricEvent; attendance: AttendanceRecord }>('/api/v1/biometric-events/punch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getBiometricEvents: () => request<BiometricEvent[]>('/api/v1/biometric-events'),

  // Attendance
  getAttendanceRecords: () => request<AttendanceRecord[]>('/api/v1/attendance'),
  getAttendanceCorrections: () => request<AttendanceCorrectionRequest[]>('/api/v1/attendance/corrections'),
  submitAttendanceCorrection: (data: Partial<AttendanceCorrectionRequest>) =>
    request<AttendanceCorrectionRequest>('/api/v1/attendance/corrections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveAttendanceCorrection: (id: string) =>
    request<AttendanceCorrectionRequest>(`/api/v1/attendance/corrections/${id}/approve`, {
      method: 'PUT',
    }),

  // Leave
  getLeaveTypes: () => request<LeaveType[]>('/api/v1/leave/types'),
  getLeaveRequests: () => request<LeaveRequest[]>('/api/v1/leave/requests'),
  submitLeaveRequest: (data: Partial<LeaveRequest>) =>
    request<LeaveRequest>('/api/v1/leave/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveLeaveRequest: (id: string) =>
    request<LeaveRequest>(`/api/v1/leave/requests/${id}/approve`, {
      method: 'PUT',
    }),

  // Salary Structures
  getSalaryStructures: () => request<SalaryStructure[]>('/api/v1/salary-structures'),
  createSalaryStructure: (data: Partial<SalaryStructure>) =>
    request<SalaryStructure>('/api/v1/salary-structures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payroll Engine
  getPayrollPeriods: () => request<PayrollPeriod[]>('/api/v1/payroll/periods'),
  getPayrollDetail: (id: string) => request<{ period: PayrollPeriod; records: PayrollEmployeeRecord[] }>(`/api/v1/payroll/periods/${id}`),
  createPayrollPeriod: (data: Partial<PayrollPeriod>) =>
    request<PayrollPeriod>('/api/v1/payroll/periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  runPayrollCalculation: (id: string) =>
    request<{ period: PayrollPeriod; recordsCount: number }>(`/api/v1/payroll/periods/${id}/run`, {
      method: 'POST',
    }),
  approvePayrollPeriod: (id: string) =>
    request<PayrollPeriod>(`/api/v1/payroll/periods/${id}/approve`, {
      method: 'PUT',
    }),
  finalizePayrollPeriod: (id: string) =>
    request<PayrollPeriod>(`/api/v1/payroll/periods/${id}/finalize`, {
      method: 'PUT',
    }),

  // Payslip
  getPayslip: (employeeRecordId: string) => request<Payslip>(`/api/v1/payslips/${employeeRecordId}`),

  // Reports
  getReportsSummary: () => request<any>('/api/v1/reports/summary'),

  // Audit
  getAuditLogs: () => request<AuditLog[]>('/api/v1/audit-logs'),

  // Notifications
  getNotifications: () => request<AppNotification[]>('/api/v1/notifications'),
  markNotificationsRead: () => request<{ success: boolean }>('/api/v1/notifications/read-all', { method: 'PUT' }),

  // Gemini AI Assistant
  askAiAssistant: (prompt: string, context?: any) =>
    request<{ reply: string }>('/api/v1/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    }),
};

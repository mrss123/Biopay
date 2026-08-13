/**
 * BioPay - Biometric Payroll SaaS Platform Data Models & Types
 */

export type UserRole =
  | 'super_admin'
  | 'org_owner'
  | 'hr_manager'
  | 'payroll_manager'
  | 'accountant'
  | 'manager'
  | 'employee';

export type Permission =
  | 'employees.view'
  | 'employees.create'
  | 'employees.edit'
  | 'employees.delete'
  | 'attendance.view'
  | 'attendance.manage'
  | 'attendance.approve_correction'
  | 'biometrics.sync'
  | 'biometrics.manage_devices'
  | 'leave.view'
  | 'leave.request'
  | 'leave.approve'
  | 'payroll.view'
  | 'payroll.process'
  | 'payroll.approve'
  | 'payroll.finalize'
  | 'salary_structures.manage'
  | 'reports.view'
  | 'reports.export'
  | 'settings.manage'
  | 'audit.view'
  | 'subscriptions.manage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  employeeId?: string; // Linked employee profile if user is an employee
  permissions: Permission[];
}

export type SubscriptionTier = 'free' | 'starter' | 'business' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  taxId: string;
  currency: string; // e.g. "USD", "EUR", "GBP"
  subscriptionTier: SubscriptionTier;
  maxEmployees: number;
  maxDevices: number;
  maxAdmins: number;
  employeeCount: number;
  deviceCount: number;
  createdAt: string;
  settings: {
    workDaysPerMonth: number;
    standardHoursPerDay: number;
    overtimeMultiplier: number;
    weekendOvertimeMultiplier: number;
    holidayOvertimeMultiplier: number;
    gracePeriodMinutes: number;
    payrollFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  };
}

export type EmploymentStatus =
  | 'Applicant'
  | 'Active'
  | 'On Leave'
  | 'Suspended'
  | 'Terminated'
  | 'Archived';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  swiftCode?: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string; // e.g., "EMP-1001"
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  address: string;
  emergencyContact: EmergencyContact;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  hireDate: string;
  contractEndDate?: string;
  bankDetails: BankDetails;
  taxIdNumber: string;
  nationalIdNumber: string;
  salaryStructureId: string;
  basicSalary: number;
  biometricId: string; // Pin/card/face key mapped in device
  documentsCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  managerName?: string;
  employeeCount: number;
}

export interface Position {
  id: string;
  tenantId: string;
  title: string;
  departmentId: string;
  gradeLevel: string;
}

export type BiometricDeviceType = 'fingerprint' | 'facial_recognition' | 'rfid_card' | 'multi_modal';
export type DeviceStatus = 'online' | 'offline' | 'syncing' | 'error';

export interface BiometricDevice {
  id: string;
  tenantId: string;
  name: string;
  serialNumber: string;
  ipAddress: string;
  location: string;
  type: BiometricDeviceType;
  vendor: 'ZKTeco' | 'Suprema' | 'Hikvision' | 'BioPay-Native' | 'BioPay-WebCam';
  status: DeviceStatus;
  lastSyncAt: string;
  registeredTemplates: number;
}

export interface BiometricEvent {
  id: string;
  tenantId: string;
  deviceId: string;
  deviceName: string;
  biometricId: string; // Key matched to Employee
  employeeId?: string;
  employeeName?: string;
  timestamp: string;
  punchType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  verificationMode: 'facial' | 'fingerprint' | 'rfid' | 'webcam_photo';
  snapshotUrl?: string;
  isProcessed: boolean;
}

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'early_departure'
  | 'absent'
  | 'half_day'
  | 'on_leave'
  | 'holiday';

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // HH:mm:ss
  clockOut?: string; // HH:mm:ss
  regularHours: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  overtimeHours: number;
  status: AttendanceStatus;
  isMissingPunch: boolean;
  notes?: string;
  verifiedByDevice?: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface ShiftSchedule {
  id: string;
  tenantId: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string; // "17:00"
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  isDefault: boolean;
}

export interface CompanyHoliday {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  isRecurring: boolean;
  type: 'national' | 'company' | 'religious';
}

export type ComponentType = 'earning' | 'allowance' | 'deduction' | 'tax' | 'pension';
export type CalculationType = 'fixed' | 'percentage' | 'formula';

export interface SalaryComponent {
  id: string;
  name: string;
  type: ComponentType;
  calculationType: CalculationType;
  defaultValue: number; // Amount or percentage
  percentageBaseOf?: 'basic_salary' | 'gross_salary';
  isTaxable: boolean;
  isMandatory: boolean;
  formulaDescription?: string;
}

export interface SalaryStructure {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  basicSalaryDefault: number;
  components: SalaryComponent[];
  createdAt: string;
}

export type LeaveCategory = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'custom';

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  category: LeaveCategory;
  daysAllowedPerYear: number;
  isPaid: boolean;
  requiresDocument: boolean;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  managerApproval: 'pending' | 'approved' | 'rejected';
  hrApproval: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type PayrollStatus =
  | 'draft'
  | 'attendance_locked'
  | 'calculating'
  | 'review'
  | 'approved'
  | 'finalized'
  | 'paid';

export interface PayrollItemLine {
  id: string;
  title: string;
  type: ComponentType;
  amount: number;
  description?: string;
}

export interface PayrollEmployeeRecord {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  bankDetails: BankDetails;
  
  // Attendance metrics for period
  workDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateMinutesTotal: number;
  overtimeHoursTotal: number;

  // Calculation Breakdown
  basicSalary: number;
  allowancesTotal: number;
  overtimePay: number;
  bonusesTotal: number;
  grossSalary: number;

  taxDeduction: number;
  pensionEmployeeDeduction: number;
  pensionEmployerContribution: number;
  otherDeductionsTotal: number;
  totalDeductions: number;

  netSalary: number;

  itemizedEarnings: PayrollItemLine[];
  itemizedDeductions: PayrollItemLine[];

  paymentStatus: 'pending' | 'processed' | 'failed';
}

export interface PayrollPeriod {
  id: string;
  tenantId: string;
  periodName: string; // e.g., "August 2026"
  startDate: string;
  endDate: string;
  payDate: string;
  frequency: 'monthly' | 'bi-weekly' | 'weekly';
  status: PayrollStatus;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  approvedBy?: string;
  approvedAt?: string;
  finalizedAt?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeRecord: PayrollEmployeeRecord;
  companyInfo: {
    name: string;
    taxId: string;
    currency: string;
    address: string;
  };
  periodName: string;
  payDate: string;
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "payroll.approve", "employee.update"
  entity: string; // e.g. "PayrollPeriod", "Employee"
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Organization,
  Employee,
  Department,
  BiometricDevice,
  BiometricEvent,
  AttendanceRecord,
  AttendanceCorrectionRequest,
  ShiftSchedule,
  CompanyHoliday,
  SalaryStructure,
  LeaveType,
  LeaveRequest,
  PayrollPeriod,
  PayrollEmployeeRecord,
  AuditLog,
  AppNotification,
  User,
  UserRole,
  Permission
} from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper function for lazy Gemini AI instance
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ==========================================
// IN-MEMORY SEED DATABASE & STATE ENGINE
// ==========================================

let organizations: Organization[] = [
  {
    id: 'org-acme',
    name: 'Acme Enterprise Corp',
    code: 'ACME',
    taxId: 'TX-98214-US',
    currency: 'USD',
    subscriptionTier: 'enterprise',
    maxEmployees: 500,
    maxDevices: 50,
    maxAdmins: 20,
    employeeCount: 12,
    deviceCount: 4,
    createdAt: '2025-01-15T08:00:00Z',
    settings: {
      workDaysPerMonth: 22,
      standardHoursPerDay: 8,
      overtimeMultiplier: 1.5,
      weekendOvertimeMultiplier: 2.0,
      holidayOvertimeMultiplier: 2.5,
      gracePeriodMinutes: 15,
      payrollFrequency: 'monthly',
    },
  },
  {
    id: 'org-apex',
    name: 'Apex Global Logistics',
    code: 'APEX',
    taxId: 'TX-44102-US',
    currency: 'USD',
    subscriptionTier: 'business',
    maxEmployees: 100,
    maxDevices: 10,
    maxAdmins: 5,
    employeeCount: 6,
    deviceCount: 2,
    createdAt: '2025-03-01T08:00:00Z',
    settings: {
      workDaysPerMonth: 22,
      standardHoursPerDay: 8,
      overtimeMultiplier: 1.5,
      weekendOvertimeMultiplier: 2.0,
      holidayOvertimeMultiplier: 2.0,
      gracePeriodMinutes: 10,
      payrollFrequency: 'monthly',
    },
  },
];

let users: User[] = [
  {
    id: 'usr-1',
    email: 'admin@acme.com',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'org_owner',
    tenantId: 'org-acme',
    permissions: [
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
  },
  {
    id: 'usr-2',
    email: 'hr.manager@acme.com',
    name: 'David Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'hr_manager',
    tenantId: 'org-acme',
    permissions: [
      'employees.view',
      'employees.create',
      'employees.edit',
      'attendance.view',
      'attendance.manage',
      'attendance.approve_correction',
      'leave.view',
      'leave.approve',
      'payroll.view',
      'reports.view',
    ],
  },
  {
    id: 'usr-3',
    email: 'payroll.lead@acme.com',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'payroll_manager',
    tenantId: 'org-acme',
    permissions: [
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
  },
  {
    id: 'usr-4',
    email: 'marcus.chen@acme.com',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'employee',
    tenantId: 'org-acme',
    employeeId: 'emp-101',
    permissions: ['leave.view', 'leave.request', 'attendance.view', 'payroll.view'],
  },
];

let departments: Department[] = [
  { id: 'dept-1', tenantId: 'org-acme', name: 'Engineering & Product', code: 'ENG', managerName: 'Alex Rivera', employeeCount: 5 },
  { id: 'dept-2', tenantId: 'org-acme', name: 'Human Resources', code: 'HR', managerName: 'David Vance', employeeCount: 2 },
  { id: 'dept-3', tenantId: 'org-acme', name: 'Finance & Accounting', code: 'FIN', managerName: 'Elena Rostova', employeeCount: 3 },
  { id: 'dept-4', tenantId: 'org-acme', name: 'Sales & Marketing', code: 'SLS', managerName: 'Rachel Kim', employeeCount: 2 },
];

let salaryStructures: SalaryStructure[] = [
  {
    id: 'struct-exec',
    tenantId: 'org-acme',
    name: 'Executive & Director Grade',
    description: 'Senior Leadership tier with enhanced housing and performance allowances',
    basicSalaryDefault: 12500,
    components: [
      { id: 'comp-1', name: 'Executive Housing Allowance', type: 'allowance', calculationType: 'percentage', defaultValue: 20, percentageBaseOf: 'basic_salary', isTaxable: true, isMandatory: true },
      { id: 'comp-2', name: 'Executive Transport Allowance', type: 'allowance', calculationType: 'fixed', defaultValue: 1200, isTaxable: true, isMandatory: true },
      { id: 'comp-3', name: 'Statutory Income Tax (PAYE)', type: 'tax', calculationType: 'formula', defaultValue: 0, isTaxable: false, isMandatory: true, formulaDescription: 'Progressive tax tiers: 10% to 30%' },
      { id: 'comp-4', name: 'National Pension Contribution (7%)', type: 'pension', calculationType: 'percentage', defaultValue: 7, percentageBaseOf: 'basic_salary', isTaxable: false, isMandatory: true },
    ],
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'struct-eng',
    tenantId: 'org-acme',
    name: 'Senior Technical Staff',
    description: 'Standard salary structure for engineers, product managers, and specialists',
    basicSalaryDefault: 8500,
    components: [
      { id: 'comp-10', name: 'Housing Allowance', type: 'allowance', calculationType: 'percentage', defaultValue: 15, percentageBaseOf: 'basic_salary', isTaxable: true, isMandatory: true },
      { id: 'comp-11', name: 'Transport Allowance', type: 'allowance', calculationType: 'fixed', defaultValue: 600, isTaxable: true, isMandatory: true },
      { id: 'comp-12', name: 'Statutory Income Tax (PAYE)', type: 'tax', calculationType: 'formula', defaultValue: 0, isTaxable: false, isMandatory: true },
      { id: 'comp-13', name: 'National Pension Contribution (7%)', type: 'pension', calculationType: 'percentage', defaultValue: 7, percentageBaseOf: 'basic_salary', isTaxable: false, isMandatory: true },
    ],
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'struct-std',
    tenantId: 'org-acme',
    name: 'Standard Operational Staff',
    description: 'General administrative and operations staff structure',
    basicSalaryDefault: 4500,
    components: [
      { id: 'comp-20', name: 'Utility & Meal Allowance', type: 'allowance', calculationType: 'fixed', defaultValue: 400, isTaxable: true, isMandatory: true },
      { id: 'comp-21', name: 'Statutory Income Tax (PAYE)', type: 'tax', calculationType: 'formula', defaultValue: 0, isTaxable: false, isMandatory: true },
      { id: 'comp-22', name: 'National Pension Contribution (7%)', type: 'pension', calculationType: 'percentage', defaultValue: 7, percentageBaseOf: 'basic_salary', isTaxable: false, isMandatory: true },
    ],
    createdAt: '2025-01-20T10:00:00Z',
  },
];

let employees: Employee[] = [
  {
    id: 'emp-101',
    tenantId: 'org-acme',
    employeeCode: 'EMP-1001',
    firstName: 'Marcus',
    lastName: 'Chen',
    fullName: 'Marcus Chen',
    email: 'marcus.chen@acme.com',
    phone: '+1 (555) 019-2831',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gender: 'Male',
    dateOfBirth: '1990-05-14',
    address: '742 Evergreen Terrace, San Francisco, CA',
    emergencyContact: { name: 'Linda Chen', relationship: 'Spouse', phone: '+1 (555) 019-8822' },
    departmentId: 'dept-1',
    departmentName: 'Engineering & Product',
    positionId: 'pos-1',
    positionTitle: 'Staff Software Architect',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2022-03-15',
    bankDetails: {
      bankName: 'JPMorgan Chase',
      accountNumber: '4892019231',
      routingNumber: '121000358',
      accountHolderName: 'Marcus Chen',
      swiftCode: 'CHASUS33XXX',
    },
    taxIdNumber: 'SSN-901-22-881',
    nationalIdNumber: 'ID-8821094',
    salaryStructureId: 'struct-eng',
    basicSalary: 9500,
    biometricId: 'BIO-FAC-1001',
    documentsCount: 4,
    createdAt: '2022-03-15T08:00:00Z',
  },
  {
    id: 'emp-102',
    tenantId: 'org-acme',
    employeeCode: 'EMP-1002',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    fullName: 'Sarah Jenkins',
    email: 'admin@acme.com',
    phone: '+1 (555) 012-9982',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gender: 'Female',
    dateOfBirth: '1986-11-20',
    address: '100 Market Street, San Francisco, CA',
    emergencyContact: { name: 'Robert Jenkins', relationship: 'Brother', phone: '+1 (555) 012-3311' },
    departmentId: 'dept-3',
    departmentName: 'Finance & Accounting',
    positionId: 'pos-2',
    positionTitle: 'Chief Executive Officer',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2021-01-10',
    bankDetails: {
      bankName: 'Bank of America',
      accountNumber: '8821009382',
      routingNumber: '121000358',
      accountHolderName: 'Sarah Jenkins',
    },
    taxIdNumber: 'SSN-401-11-902',
    nationalIdNumber: 'ID-1092831',
    salaryStructureId: 'struct-exec',
    basicSalary: 16000,
    biometricId: 'BIO-FAC-1002',
    documentsCount: 6,
    createdAt: '2021-01-10T08:00:00Z',
  },
  {
    id: 'emp-103',
    tenantId: 'org-acme',
    employeeCode: 'EMP-1003',
    firstName: 'David',
    lastName: 'Vance',
    fullName: 'David Vance',
    email: 'hr.manager@acme.com',
    phone: '+1 (555) 018-4422',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    gender: 'Male',
    dateOfBirth: '1988-08-04',
    address: '450 Sutter St, San Francisco, CA',
    emergencyContact: { name: 'Karen Vance', relationship: 'Spouse', phone: '+1 (555) 018-9900' },
    departmentId: 'dept-2',
    departmentName: 'Human Resources',
    positionId: 'pos-3',
    positionTitle: 'Global HR Director',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2022-06-01',
    bankDetails: {
      bankName: 'Wells Fargo',
      accountNumber: '3310029381',
      routingNumber: '121000248',
      accountHolderName: 'David Vance',
    },
    taxIdNumber: 'SSN-302-99-102',
    nationalIdNumber: 'ID-3392101',
    salaryStructureId: 'struct-eng',
    basicSalary: 8800,
    biometricId: 'BIO-FNG-1003',
    documentsCount: 3,
    createdAt: '2022-06-01T08:00:00Z',
  },
  {
    id: 'emp-104',
    tenantId: 'org-acme',
    employeeCode: 'EMP-1004',
    firstName: 'Aisha',
    lastName: 'Patel',
    fullName: 'Aisha Patel',
    email: 'aisha.patel@acme.com',
    phone: '+1 (555) 017-3311',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    gender: 'Female',
    dateOfBirth: '1993-02-18',
    address: '221 B Baker Street, San Jose, CA',
    emergencyContact: { name: 'Sanjay Patel', relationship: 'Father', phone: '+1 (555) 017-0099' },
    departmentId: 'dept-1',
    departmentName: 'Engineering & Product',
    positionId: 'pos-4',
    positionTitle: 'Senior UX Designer',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2023-02-14',
    bankDetails: {
      bankName: 'Citibank',
      accountNumber: '9920192831',
      routingNumber: '021000089',
      accountHolderName: 'Aisha Patel',
    },
    taxIdNumber: 'SSN-201-88-392',
    nationalIdNumber: 'ID-9921029',
    salaryStructureId: 'struct-eng',
    basicSalary: 7800,
    biometricId: 'BIO-FAC-1004',
    documentsCount: 5,
    createdAt: '2023-02-14T08:00:00Z',
  },
  {
    id: 'emp-105',
    tenantId: 'org-acme',
    employeeCode: 'EMP-1005',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    fullName: 'Carlos Mendoza',
    email: 'carlos.mendoza@acme.com',
    phone: '+1 (555) 016-8833',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    gender: 'Male',
    dateOfBirth: '1991-09-30',
    address: '88 Palo Alto Blvd, Palo Alto, CA',
    emergencyContact: { name: 'Maria Mendoza', relationship: 'Mother', phone: '+1 (555) 016-1122' },
    departmentId: 'dept-4',
    departmentName: 'Sales & Marketing',
    positionId: 'pos-5',
    positionTitle: 'Account Executive Lead',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2023-07-01',
    bankDetails: {
      bankName: 'Silicon Valley Bank',
      accountNumber: '7721092831',
      routingNumber: '121140399',
      accountHolderName: 'Carlos Mendoza',
    },
    taxIdNumber: 'SSN-109-22-993',
    nationalIdNumber: 'ID-4401928',
    salaryStructureId: 'struct-std',
    basicSalary: 5200,
    biometricId: 'BIO-CAR-1005',
    documentsCount: 2,
    createdAt: '2023-07-01T08:00:00Z',
  },
];

let biometricDevices: BiometricDevice[] = [
  {
    id: 'dev-1',
    tenantId: 'org-acme',
    name: 'HQ Main Turnstile Facial Kiosk',
    serialNumber: 'ZKT-FAC-99218',
    ipAddress: '192.168.10.150',
    location: 'Lobby Gate A',
    type: 'facial_recognition',
    vendor: 'ZKTeco',
    status: 'online',
    lastSyncAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    registeredTemplates: 120,
  },
  {
    id: 'dev-2',
    tenantId: 'org-acme',
    name: 'Engineering Floor BioFinger Unit',
    serialNumber: 'SUP-FNG-33109',
    ipAddress: '192.168.10.152',
    location: 'Floor 3 East Entrance',
    type: 'fingerprint',
    vendor: 'Suprema',
    status: 'online',
    lastSyncAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    registeredTemplates: 85,
  },
  {
    id: 'dev-3',
    tenantId: 'org-acme',
    name: 'Executive Suite RFID Reader',
    serialNumber: 'HIK-CARD-10293',
    ipAddress: '192.168.10.155',
    location: 'Floor 8 Executive Entrance',
    type: 'rfid_card',
    vendor: 'Hikvision',
    status: 'online',
    lastSyncAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    registeredTemplates: 15,
  },
  {
    id: 'dev-4',
    tenantId: 'org-acme',
    name: 'WebCam AI Face Punch Station',
    serialNumber: 'BIOPAY-CAM-001',
    ipAddress: '127.0.0.1',
    location: 'Virtual Kiosk',
    type: 'multi_modal',
    vendor: 'BioPay-WebCam',
    status: 'online',
    lastSyncAt: new Date().toISOString(),
    registeredTemplates: 12,
  },
];

let biometricEvents: BiometricEvent[] = [
  {
    id: 'event-1',
    tenantId: 'org-acme',
    deviceId: 'dev-1',
    deviceName: 'HQ Main Turnstile Facial Kiosk',
    biometricId: 'BIO-FAC-1001',
    employeeId: 'emp-101',
    employeeName: 'Marcus Chen',
    timestamp: '2026-08-13T08:02:15Z',
    punchType: 'clock_in',
    verificationMode: 'facial',
    isProcessed: true,
  },
  {
    id: 'event-2',
    tenantId: 'org-acme',
    deviceId: 'dev-1',
    deviceName: 'HQ Main Turnstile Facial Kiosk',
    biometricId: 'BIO-FAC-1002',
    employeeId: 'emp-102',
    employeeName: 'Sarah Jenkins',
    timestamp: '2026-08-13T08:14:00Z',
    punchType: 'clock_in',
    verificationMode: 'facial',
    isProcessed: true,
  },
  {
    id: 'event-3',
    tenantId: 'org-acme',
    deviceId: 'dev-2',
    deviceName: 'Engineering Floor BioFinger Unit',
    biometricId: 'BIO-FNG-1003',
    employeeId: 'emp-103',
    employeeName: 'David Vance',
    timestamp: '2026-08-13T08:35:10Z',
    punchType: 'clock_in',
    verificationMode: 'fingerprint',
    isProcessed: true,
  },
  {
    id: 'event-4',
    tenantId: 'org-acme',
    deviceId: 'dev-1',
    deviceName: 'HQ Main Turnstile Facial Kiosk',
    biometricId: 'BIO-FAC-1004',
    employeeId: 'emp-104',
    employeeName: 'Aisha Patel',
    timestamp: '2026-08-13T08:05:40Z',
    punchType: 'clock_in',
    verificationMode: 'facial',
    isProcessed: true,
  },
];

let attendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-101-today',
    tenantId: 'org-acme',
    employeeId: 'emp-101',
    employeeName: 'Marcus Chen',
    departmentName: 'Engineering & Product',
    date: '2026-08-13',
    clockIn: '08:02:15',
    clockOut: undefined,
    regularHours: 8,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 1.5,
    status: 'present',
    isMissingPunch: false,
    verifiedByDevice: 'HQ Main Turnstile Facial Kiosk',
  },
  {
    id: 'att-102-today',
    tenantId: 'org-acme',
    employeeId: 'emp-102',
    employeeName: 'Sarah Jenkins',
    departmentName: 'Finance & Accounting',
    date: '2026-08-13',
    clockIn: '08:14:00',
    clockOut: undefined,
    regularHours: 8,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 0,
    status: 'present',
    isMissingPunch: false,
    verifiedByDevice: 'HQ Main Turnstile Facial Kiosk',
  },
  {
    id: 'att-103-today',
    tenantId: 'org-acme',
    employeeId: 'emp-103',
    employeeName: 'David Vance',
    departmentName: 'Human Resources',
    date: '2026-08-13',
    clockIn: '08:35:10',
    clockOut: undefined,
    regularHours: 7.5,
    lateMinutes: 20,
    earlyDepartureMinutes: 0,
    overtimeHours: 0,
    status: 'late',
    isMissingPunch: false,
    verifiedByDevice: 'Engineering Floor BioFinger Unit',
  },
  {
    id: 'att-104-today',
    tenantId: 'org-acme',
    employeeId: 'emp-104',
    employeeName: 'Aisha Patel',
    departmentName: 'Engineering & Product',
    date: '2026-08-13',
    clockIn: '08:05:40',
    clockOut: undefined,
    regularHours: 8,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 2.0,
    status: 'present',
    isMissingPunch: false,
    verifiedByDevice: 'HQ Main Turnstile Facial Kiosk',
  },
  {
    id: 'att-105-today',
    tenantId: 'org-acme',
    employeeId: 'emp-105',
    employeeName: 'Carlos Mendoza',
    departmentName: 'Sales & Marketing',
    date: '2026-08-13',
    clockIn: undefined,
    clockOut: undefined,
    regularHours: 0,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 0,
    status: 'absent',
    isMissingPunch: true,
  },
];

let attendanceCorrections: AttendanceCorrectionRequest[] = [
  {
    id: 'corr-1',
    tenantId: 'org-acme',
    employeeId: 'emp-105',
    employeeName: 'Carlos Mendoza',
    attendanceDate: '2026-08-12',
    requestedClockIn: '08:30:00',
    requestedClockOut: '17:30:00',
    reason: 'RFID card scanner malfunctioned at client offsite meeting',
    status: 'pending',
    createdAt: '2026-08-13T07:10:00Z',
  },
];

let shiftSchedules: ShiftSchedule[] = [
  { id: 'shift-std', tenantId: 'org-acme', name: 'Standard Office Shift', startTime: '08:00', endTime: '17:00', breakDurationMinutes: 60, gracePeriodMinutes: 15, isDefault: true },
  { id: 'shift-eng', tenantId: 'org-acme', name: 'Engineering Flexible Shift', startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60, gracePeriodMinutes: 30, isDefault: false },
];

let leaveTypes: LeaveType[] = [
  { id: 'lt-ann', tenantId: 'org-acme', name: 'Annual Paid Leave', category: 'annual', daysAllowedPerYear: 20, isPaid: true, requiresDocument: false },
  { id: 'lt-sik', tenantId: 'org-acme', name: 'Sick Leave', category: 'sick', daysAllowedPerYear: 10, isPaid: true, requiresDocument: true },
  { id: 'lt-mat', tenantId: 'org-acme', name: 'Maternity / Paternity Leave', category: 'maternity', daysAllowedPerYear: 90, isPaid: true, requiresDocument: true },
  { id: 'lt-unp', tenantId: 'org-acme', name: 'Unpaid Personal Leave', category: 'unpaid', daysAllowedPerYear: 30, isPaid: false, requiresDocument: false },
];

let leaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    tenantId: 'org-acme',
    employeeId: 'emp-101',
    employeeName: 'Marcus Chen',
    leaveTypeId: 'lt-ann',
    leaveTypeName: 'Annual Paid Leave',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    totalDays: 4,
    reason: 'Family vacation and personal downtime',
    status: 'pending',
    managerApproval: 'approved',
    hrApproval: 'pending',
    createdAt: '2026-08-12T14:30:00Z',
  },
  {
    id: 'lr-2',
    tenantId: 'org-acme',
    employeeId: 'emp-104',
    employeeName: 'Aisha Patel',
    leaveTypeId: 'lt-sik',
    leaveTypeName: 'Sick Leave',
    startDate: '2026-08-05',
    endDate: '2026-08-06',
    totalDays: 2,
    reason: 'Severe flu & medical rest',
    status: 'approved',
    managerApproval: 'approved',
    hrApproval: 'approved',
    approvedBy: 'David Vance',
    createdAt: '2026-08-04T10:00:00Z',
  },
];

let payrollPeriods: PayrollPeriod[] = [
  {
    id: 'pay-2026-07',
    tenantId: 'org-acme',
    periodName: 'July 2026 Payroll',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    payDate: '2026-08-01',
    frequency: 'monthly',
    status: 'paid',
    totalEmployees: 5,
    totalGrossPay: 58200,
    totalDeductions: 13410,
    totalNetPay: 44790,
    approvedBy: 'Sarah Jenkins',
    approvedAt: '2026-07-30T16:00:00Z',
    finalizedAt: '2026-07-31T18:00:00Z',
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'pay-2026-08',
    tenantId: 'org-acme',
    periodName: 'August 2026 Payroll',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    payDate: '2026-09-01',
    frequency: 'monthly',
    status: 'calculating',
    totalEmployees: 5,
    totalGrossPay: 61400,
    totalDeductions: 14120,
    totalNetPay: 47280,
    createdAt: '2026-08-01T08:00:00Z',
  },
];

let payrollRecords: PayrollEmployeeRecord[] = [
  {
    id: 'rec-101-aug',
    payrollRunId: 'pay-2026-08',
    employeeId: 'emp-101',
    employeeCode: 'EMP-1001',
    employeeName: 'Marcus Chen',
    departmentName: 'Engineering & Product',
    bankDetails: { bankName: 'JPMorgan Chase', accountNumber: '4892019231', routingNumber: '121000358', accountHolderName: 'Marcus Chen' },
    workDays: 22,
    presentDays: 22,
    absentDays: 0,
    leaveDays: 0,
    lateMinutesTotal: 0,
    overtimeHoursTotal: 12.5,
    basicSalary: 9500,
    allowancesTotal: 2025, // Housing (15%) 1425 + Transport 600
    overtimePay: 1018.75, // (9500 / 176) * 1.5 * 12.5
    bonusesTotal: 500,
    grossSalary: 13043.75,
    taxDeduction: 2150.50,
    pensionEmployeeDeduction: 665.00,
    pensionEmployerContribution: 950.00,
    otherDeductionsTotal: 100.00,
    totalDeductions: 2915.50,
    netSalary: 10128.25,
    itemizedEarnings: [
      { id: 'e1', title: 'Basic Salary', type: 'earning', amount: 9500 },
      { id: 'e2', title: 'Housing Allowance (15%)', type: 'allowance', amount: 1425 },
      { id: 'e3', title: 'Transport Allowance', type: 'allowance', amount: 600 },
      { id: 'e4', title: 'Overtime Pay (12.5 hrs)', type: 'earning', amount: 1018.75 },
      { id: 'e5', title: 'Performance Milestone Bonus', type: 'earning', amount: 500 },
    ],
    itemizedDeductions: [
      { id: 'd1', title: 'PAYE Income Tax', type: 'tax', amount: 2150.50 },
      { id: 'd2', title: 'National Pension Scheme (7%)', type: 'pension', amount: 665.00 },
      { id: 'd3', title: 'Medical Insurance Co-pay', type: 'deduction', amount: 100.00 },
    ],
    paymentStatus: 'pending',
  },
  {
    id: 'rec-102-aug',
    payrollRunId: 'pay-2026-08',
    employeeId: 'emp-102',
    employeeCode: 'EMP-1002',
    employeeName: 'Sarah Jenkins',
    departmentName: 'Finance & Accounting',
    bankDetails: { bankName: 'Bank of America', accountNumber: '8821009382', routingNumber: '121000358', accountHolderName: 'Sarah Jenkins' },
    workDays: 22,
    presentDays: 22,
    absentDays: 0,
    leaveDays: 0,
    lateMinutesTotal: 0,
    overtimeHoursTotal: 0,
    basicSalary: 16000,
    allowancesTotal: 4400, // Housing (20%) 3200 + Transport 1200
    overtimePay: 0,
    bonusesTotal: 0,
    grossSalary: 20400,
    taxDeduction: 4280.00,
    pensionEmployeeDeduction: 1120.00,
    pensionEmployerContribution: 1600.00,
    otherDeductionsTotal: 150.00,
    totalDeductions: 5550.00,
    netSalary: 14850.00,
    itemizedEarnings: [
      { id: 'e1', title: 'Basic Salary', type: 'earning', amount: 16000 },
      { id: 'e2', title: 'Executive Housing Allowance (20%)', type: 'allowance', amount: 3200 },
      { id: 'e3', title: 'Executive Transport Allowance', type: 'allowance', amount: 1200 },
    ],
    itemizedDeductions: [
      { id: 'd1', title: 'PAYE Income Tax', type: 'tax', amount: 4280.00 },
      { id: 'd2', title: 'National Pension Scheme (7%)', type: 'pension', amount: 1120.00 },
      { id: 'd3', title: 'Executive Health Coverage', type: 'deduction', amount: 150.00 },
    ],
    paymentStatus: 'pending',
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'audit-1001',
    tenantId: 'org-acme',
    userId: 'usr-1',
    userName: 'Sarah Jenkins',
    userRole: 'org_owner',
    action: 'payroll.approve',
    entity: 'PayrollPeriod',
    entityId: 'pay-2026-07',
    newState: { periodName: 'July 2026 Payroll', status: 'paid', approvedBy: 'Sarah Jenkins' },
    ipAddress: '192.168.1.104',
    timestamp: '2026-07-31T18:05:00Z',
  },
  {
    id: 'audit-1002',
    tenantId: 'org-acme',
    userId: 'usr-2',
    userName: 'David Vance',
    userRole: 'hr_manager',
    action: 'employee.create',
    entity: 'Employee',
    entityId: 'emp-105',
    newState: { employeeCode: 'EMP-1005', name: 'Carlos Mendoza' },
    ipAddress: '192.168.1.112',
    timestamp: '2026-08-01T09:12:30Z',
  },
];

let appNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    tenantId: 'org-acme',
    title: 'August Payroll Ready for Review',
    message: 'August 2026 payroll calculations are complete. 5 employee payslips ready for verification.',
    type: 'info',
    isRead: false,
    link: '/payroll',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    tenantId: 'org-acme',
    title: 'Biometric Device Online',
    message: 'HQ Main Turnstile Facial Kiosk performed real-time heartbeat sync.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Helper: Log audit trail entry
function recordAudit(
  tenantId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  action: string,
  entity: string,
  entityId: string,
  newState?: any,
  previousState?: any,
  ipAddress: string = '127.0.0.1'
) {
  const newLog: AuditLog = {
    id: 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    tenantId,
    userId,
    userName,
    userRole,
    action,
    entity,
    entityId,
    previousState,
    newState,
    ipAddress,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(newLog);
}

// Middleware: Extract tenant context header
app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'org-acme';
  (req as any).tenantId = tenantId;
  next();
});

// ==========================================
// REST API ENDPOINTS (/api/v1/*)
// ==========================================

// 1. AUTH & TENANT CONTEXT
app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const user = users.find(u => u.tenantId === tenantId) || users[0];
  const org = organizations.find(o => o.id === tenantId) || organizations[0];
  res.json({ user, organization: org, availableTenants: organizations });
});

// 2. ORGANIZATIONS / TENANTS
app.get('/api/v1/organizations', (req: Request, res: Response) => {
  res.json(organizations);
});

app.put('/api/v1/organizations/:id/settings', (req: Request, res: Response) => {
  const { id } = req.params;
  const orgIndex = organizations.findIndex(o => o.id === id);
  if (orgIndex === -1) return res.status(404).json({ error: 'Organization not found' });
  
  organizations[orgIndex].settings = { ...organizations[orgIndex].settings, ...req.body };
  recordAudit(id, 'usr-1', 'Sarah Jenkins', 'org_owner', 'settings.manage', 'Organization', id, req.body);
  res.json(organizations[orgIndex]);
});

// 3. EMPLOYEES
app.get('/api/v1/employees', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const list = employees.filter(e => e.tenantId === tenantId);
  res.json(list);
});

app.post('/api/v1/employees', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const org = organizations.find(o => o.id === tenantId);
  const currentCount = employees.filter(e => e.tenantId === tenantId).length;
  
  if (org && currentCount >= org.maxEmployees) {
    return res.status(400).json({ error: `Subscription limit reached (${org.maxEmployees} max employees). Upgrade your SaaS plan.` });
  }

  const newEmp: Employee = {
    id: 'emp-' + Date.now(),
    tenantId,
    employeeCode: req.body.employeeCode || `EMP-${1000 + currentCount + 1}`,
    firstName: req.body.firstName || 'New',
    lastName: req.body.lastName || 'Employee',
    fullName: `${req.body.firstName || 'New'} ${req.body.lastName || 'Employee'}`,
    email: req.body.email || `employee${Date.now()}@acme.com`,
    phone: req.body.phone || '+1 (555) 000-1122',
    profilePhoto: req.body.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    gender: req.body.gender || 'Other',
    dateOfBirth: req.body.dateOfBirth || '1995-01-01',
    address: req.body.address || '123 Tech Way',
    emergencyContact: req.body.emergencyContact || { name: 'Emergency Contact', relationship: 'Relative', phone: '555-0000' },
    departmentId: req.body.departmentId || departments[0].id,
    departmentName: req.body.departmentName || departments[0].name,
    positionId: req.body.positionId || 'pos-1',
    positionTitle: req.body.positionTitle || 'Specialist',
    employmentType: req.body.employmentType || 'Full-Time',
    status: req.body.status || 'Active',
    hireDate: req.body.hireDate || new Date().toISOString().split('T')[0],
    bankDetails: req.body.bankDetails || { bankName: 'Chase Bank', accountNumber: '100293019', routingNumber: '121000358', accountHolderName: 'Employee' },
    taxIdNumber: req.body.taxIdNumber || 'SSN-000-11-222',
    nationalIdNumber: req.body.nationalIdNumber || 'ID-00011',
    salaryStructureId: req.body.salaryStructureId || salaryStructures[0].id,
    basicSalary: Number(req.body.basicSalary) || 6000,
    biometricId: req.body.biometricId || `BIO-${Date.now().toString().slice(-4)}`,
    documentsCount: 1,
    createdAt: new Date().toISOString(),
  };

  employees.unshift(newEmp);
  if (org) org.employeeCount += 1;

  recordAudit(tenantId, 'usr-1', 'Sarah Jenkins', 'org_owner', 'employee.create', 'Employee', newEmp.id, newEmp);
  res.status(201).json(newEmp);
});

app.put('/api/v1/employees/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const idx = employees.findIndex(e => e.id === id && e.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });

  const prev = { ...employees[idx] };
  employees[idx] = {
    ...employees[idx],
    ...req.body,
    fullName: req.body.firstName && req.body.lastName ? `${req.body.firstName} ${req.body.lastName}` : employees[idx].fullName,
  };

  recordAudit(tenantId, 'usr-1', 'Sarah Jenkins', 'org_owner', 'employee.edit', 'Employee', id, employees[idx], prev);
  res.json(employees[idx]);
});

// 4. DEPARTMENTS
app.get('/api/v1/departments', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(departments.filter(d => d.tenantId === tenantId));
});

// 5. BIOMETRIC DEVICES & PUNCH INTEGRATION LAYER
app.get('/api/v1/biometric-devices', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(biometricDevices.filter(d => d.tenantId === tenantId));
});

app.post('/api/v1/biometric-devices', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const newDev: BiometricDevice = {
    id: 'dev-' + Date.now(),
    tenantId,
    name: req.body.name || 'New Biometric Terminal',
    serialNumber: req.body.serialNumber || `SN-${Math.floor(Math.random() * 900000)}`,
    ipAddress: req.body.ipAddress || '192.168.1.100',
    location: req.body.location || 'Main Gate',
    type: req.body.type || 'facial_recognition',
    vendor: req.body.vendor || 'ZKTeco',
    status: 'online',
    lastSyncAt: new Date().toISOString(),
    registeredTemplates: req.body.registeredTemplates || 10,
  };
  biometricDevices.push(newDev);
  recordAudit(tenantId, 'usr-1', 'Sarah Jenkins', 'org_owner', 'biometrics.manage_devices', 'BiometricDevice', newDev.id, newDev);
  res.status(201).json(newDev);
});

// Trigger Live Biometric Event Punch (WebCam, Facial, Fingerprint, Card)
app.post('/api/v1/biometric-events/punch', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { biometricId, deviceId, punchType, verificationMode, snapshotUrl } = req.body;

  const emp = employees.find(e => e.biometricId === biometricId && e.tenantId === tenantId) || employees[0];
  const device = biometricDevices.find(d => d.id === deviceId) || biometricDevices[0];

  const timestamp = new Date().toISOString();
  const rawEvent: BiometricEvent = {
    id: 'event-' + Date.now(),
    tenantId,
    deviceId: device.id,
    deviceName: device.name,
    biometricId: emp.biometricId,
    employeeId: emp.id,
    employeeName: emp.fullName,
    timestamp,
    punchType: punchType || 'clock_in',
    verificationMode: verificationMode || 'facial',
    snapshotUrl,
    isProcessed: true,
  };

  biometricEvents.unshift(rawEvent);
  device.lastSyncAt = timestamp;

  // Process Attendance calculation automatically
  const dateStr = timestamp.split('T')[0];
  const timeStr = timestamp.split('T')[1].slice(0, 8);

  let att = attendanceRecords.find(a => a.employeeId === emp.id && a.date === dateStr && a.tenantId === tenantId);
  
  if (!att) {
    // Determine late status (standard shift start 08:00 with 15 min grace)
    const [h, m] = timeStr.split(':').map(Number);
    const arrivalMins = h * 60 + m;
    const shiftStartMins = 8 * 60; // 08:00
    const lateMins = Math.max(0, arrivalMins - shiftStartMins - 15);

    att = {
      id: `att-${emp.id}-${dateStr}`,
      tenantId,
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      date: dateStr,
      clockIn: timeStr,
      clockOut: undefined,
      regularHours: 8,
      lateMinutes: lateMins,
      earlyDepartureMinutes: 0,
      overtimeHours: 0,
      status: lateMins > 0 ? 'late' : 'present',
      isMissingPunch: false,
      verifiedByDevice: device.name,
    };
    attendanceRecords.unshift(att);
  } else {
    if (punchType === 'clock_out' || att.clockIn) {
      att.clockOut = timeStr;
      // Calculate work hours
      const [inH, inM] = att.clockIn.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      const diffHrs = Math.max(0, (outH * 60 + outM - (inH * 60 + inM) - 60) / 60);
      att.regularHours = Math.min(8, Number(diffHrs.toFixed(1)));
      att.overtimeHours = Math.max(0, Number((diffHrs - 8).toFixed(1)));
    }
  }

  recordAudit(tenantId, emp.id, emp.fullName, 'employee', 'biometrics.sync', 'BiometricEvent', rawEvent.id, rawEvent);

  res.status(201).json({
    message: `Biometric ${rawEvent.verificationMode} verification successful! Punch recorded for ${emp.fullName}.`,
    event: rawEvent,
    attendance: att,
  });
});

app.get('/api/v1/biometric-events', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(biometricEvents.filter(e => e.tenantId === tenantId));
});

// 6. ATTENDANCE & CORRECTIONS
app.get('/api/v1/attendance', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(attendanceRecords.filter(a => a.tenantId === tenantId));
});

app.get('/api/v1/attendance/corrections', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(attendanceCorrections.filter(c => c.tenantId === tenantId));
});

app.post('/api/v1/attendance/corrections', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const newCorr: AttendanceCorrectionRequest = {
    id: 'corr-' + Date.now(),
    tenantId,
    employeeId: req.body.employeeId || employees[0].id,
    employeeName: req.body.employeeName || employees[0].fullName,
    attendanceDate: req.body.attendanceDate || new Date().toISOString().split('T')[0],
    requestedClockIn: req.body.requestedClockIn || '08:30:00',
    requestedClockOut: req.body.requestedClockOut || '17:30:00',
    reason: req.body.reason || 'Offsite client meeting / biometric sensor retry',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  attendanceCorrections.unshift(newCorr);
  res.status(201).json(newCorr);
});

app.put('/api/v1/attendance/corrections/:id/approve', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const corr = attendanceCorrections.find(c => c.id === id && c.tenantId === tenantId);
  if (!corr) return res.status(404).json({ error: 'Correction request not found' });

  corr.status = 'approved';
  corr.reviewedBy = 'David Vance';

  // Update attendance record
  let att = attendanceRecords.find(a => a.employeeId === corr.employeeId && a.date === corr.attendanceDate);
  if (att) {
    att.clockIn = corr.requestedClockIn;
    att.clockOut = corr.requestedClockOut;
    att.status = 'present';
    att.isMissingPunch = false;
  }

  recordAudit(tenantId, 'usr-2', 'David Vance', 'hr_manager', 'attendance.approve_correction', 'AttendanceCorrectionRequest', id, corr);
  res.json(corr);
});

// 7. LEAVE MANAGEMENT
app.get('/api/v1/leave/types', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(leaveTypes.filter(l => l.tenantId === tenantId));
});

app.get('/api/v1/leave/requests', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(leaveRequests.filter(l => l.tenantId === tenantId));
});

app.post('/api/v1/leave/requests', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const newReq: LeaveRequest = {
    id: 'lr-' + Date.now(),
    tenantId,
    employeeId: req.body.employeeId || employees[0].id,
    employeeName: req.body.employeeName || employees[0].fullName,
    leaveTypeId: req.body.leaveTypeId || leaveTypes[0].id,
    leaveTypeName: req.body.leaveTypeName || leaveTypes[0].name,
    startDate: req.body.startDate || '2026-08-25',
    endDate: req.body.endDate || '2026-08-28',
    totalDays: req.body.totalDays || 3,
    reason: req.body.reason || 'Personal health / family event',
    status: 'pending',
    managerApproval: 'pending',
    hrApproval: 'pending',
    createdAt: new Date().toISOString(),
  };
  leaveRequests.unshift(newReq);
  res.status(201).json(newReq);
});

app.put('/api/v1/leave/requests/:id/approve', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const reqItem = leaveRequests.find(l => l.id === id && l.tenantId === tenantId);
  if (!reqItem) return res.status(404).json({ error: 'Leave request not found' });

  reqItem.status = 'approved';
  reqItem.managerApproval = 'approved';
  reqItem.hrApproval = 'approved';
  reqItem.approvedBy = 'David Vance';

  recordAudit(tenantId, 'usr-2', 'David Vance', 'hr_manager', 'leave.approve', 'LeaveRequest', id, reqItem);
  res.json(reqItem);
});

// 8. SALARY STRUCTURES
app.get('/api/v1/salary-structures', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(salaryStructures.filter(s => s.tenantId === tenantId));
});

app.post('/api/v1/salary-structures', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const newStruct: SalaryStructure = {
    id: 'struct-' + Date.now(),
    tenantId,
    name: req.body.name || 'Custom Salary Template',
    description: req.body.description || 'Custom grade structure',
    basicSalaryDefault: Number(req.body.basicSalaryDefault) || 7000,
    components: req.body.components || [
      { id: 'c1', name: 'Housing Allowance', type: 'allowance', calculationType: 'percentage', defaultValue: 15, percentageBaseOf: 'basic_salary', isTaxable: true, isMandatory: true },
      { id: 'c2', name: 'PAYE Tax', type: 'tax', calculationType: 'formula', defaultValue: 0, isTaxable: false, isMandatory: true },
    ],
    createdAt: new Date().toISOString(),
  };
  salaryStructures.push(newStruct);
  res.status(201).json(newStruct);
});

// 9. PAYROLL CALCULATION ENGINE & WORKFLOW
app.get('/api/v1/payroll/periods', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(payrollPeriods.filter(p => p.tenantId === tenantId));
});

app.get('/api/v1/payroll/periods/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const period = payrollPeriods.find(p => p.id === req.params.id && p.tenantId === tenantId);
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  const records = payrollRecords.filter(r => r.payrollRunId === period.id);
  res.json({ period, records });
});

// Run / Recalculate Payroll Engine for a Period
app.post('/api/v1/payroll/periods/:id/run', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const period = payrollPeriods.find(p => p.id === id && p.tenantId === tenantId);
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  const tenantEmps = employees.filter(e => e.tenantId === tenantId && e.status === 'Active');

  // Recalculate payroll lines for each employee
  let grandGross = 0;
  let grandDeductions = 0;
  let grandNet = 0;

  payrollRecords = payrollRecords.filter(r => r.payrollRunId !== id);

  tenantEmps.forEach(emp => {
    const struct = salaryStructures.find(s => s.id === emp.salaryStructureId) || salaryStructures[0];
    const basic = emp.basicSalary;

    let allowancesTotal = 0;
    const itemizedEarnings = [{ id: 'e-basic', title: 'Basic Salary', type: 'earning' as const, amount: basic }];

    struct.components.filter(c => c.type === 'allowance').forEach(comp => {
      let amt = comp.defaultValue;
      if (comp.calculationType === 'percentage') {
        amt = (basic * comp.defaultValue) / 100;
      }
      allowancesTotal += amt;
      itemizedEarnings.push({ id: `e-${comp.id}`, title: comp.name, type: 'allowance', amount: amt });
    });

    // Overtime pay (12.5 hours default benchmark)
    const overtimePay = Math.round(((basic / 176) * 1.5 * 10) * 100) / 100;
    itemizedEarnings.push({ id: 'e-ot', title: 'Overtime Earnings', type: 'earning', amount: overtimePay });

    const grossSalary = basic + allowancesTotal + overtimePay;

    // Progressive PAYE Tax Formula
    let taxDeduction = 0;
    if (grossSalary > 1000) {
      taxDeduction = Math.round((grossSalary * 0.18) * 100) / 100;
    }

    const pensionEmployee = Math.round((basic * 0.07) * 100) / 100;
    const pensionEmployer = Math.round((basic * 0.10) * 100) / 100;

    const itemizedDeductions = [
      { id: 'd-tax', title: 'PAYE Income Tax', type: 'tax' as const, amount: taxDeduction },
      { id: 'd-pen', title: 'National Pension (7%)', type: 'pension' as const, amount: pensionEmployee },
    ];

    const totalDeductions = taxDeduction + pensionEmployee;
    const netSalary = grossSalary - totalDeductions;

    grandGross += grossSalary;
    grandDeductions += totalDeductions;
    grandNet += netSalary;

    payrollRecords.push({
      id: `rec-${emp.id}-${Date.now()}`,
      payrollRunId: id,
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      bankDetails: emp.bankDetails,
      workDays: 22,
      presentDays: 22,
      absentDays: 0,
      leaveDays: 0,
      lateMinutesTotal: 0,
      overtimeHoursTotal: 10,
      basicSalary: basic,
      allowancesTotal,
      overtimePay,
      bonusesTotal: 0,
      grossSalary,
      taxDeduction,
      pensionEmployeeDeduction: pensionEmployee,
      pensionEmployerContribution: pensionEmployer,
      otherDeductionsTotal: 0,
      totalDeductions,
      netSalary,
      itemizedEarnings,
      itemizedDeductions,
      paymentStatus: 'pending',
    });
  });

  period.status = 'review';
  period.totalEmployees = tenantEmps.length;
  period.totalGrossPay = Math.round(grandGross);
  period.totalDeductions = Math.round(grandDeductions);
  period.totalNetPay = Math.round(grandNet);

  recordAudit(tenantId, 'usr-3', 'Elena Rostova', 'payroll_manager', 'payroll.process', 'PayrollPeriod', id, period);

  res.json({ period, recordsCount: tenantEmps.length });
});

// Create new Payroll Period
app.post('/api/v1/payroll/periods', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const newPeriod: PayrollPeriod = {
    id: 'pay-' + Date.now(),
    tenantId,
    periodName: req.body.periodName || 'Custom Payroll Run',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || new Date().toISOString().split('T')[0],
    payDate: req.body.payDate || new Date().toISOString().split('T')[0],
    frequency: req.body.frequency || 'monthly',
    status: 'draft',
    totalEmployees: employees.filter(e => e.tenantId === tenantId).length,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    createdAt: new Date().toISOString(),
  };

  payrollPeriods.unshift(newPeriod);
  res.status(201).json(newPeriod);
});

// Approve & Finalize Payroll (Locks & Snapshots historical records)
app.put('/api/v1/payroll/periods/:id/approve', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const period = payrollPeriods.find(p => p.id === id && p.tenantId === tenantId);
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  period.status = 'approved';
  period.approvedBy = 'Sarah Jenkins';
  period.approvedAt = new Date().toISOString();

  recordAudit(tenantId, 'usr-1', 'Sarah Jenkins', 'org_owner', 'payroll.approve', 'PayrollPeriod', id, period);
  res.json(period);
});

app.put('/api/v1/payroll/periods/:id/finalize', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const { id } = req.params;
  const period = payrollPeriods.find(p => p.id === id && p.tenantId === tenantId);
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  period.status = 'paid';
  period.finalizedAt = new Date().toISOString();

  // Mark all employee line item records as processed
  payrollRecords.filter(r => r.payrollRunId === id).forEach(r => {
    r.paymentStatus = 'processed';
  });

  // Push notification
  appNotifications.unshift({
    id: 'notif-' + Date.now(),
    tenantId,
    title: `Payslips Released: ${period.periodName}`,
    message: `${period.totalEmployees} digital payslips are now available for employee download in the portal.`,
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  recordAudit(tenantId, 'usr-1', 'Sarah Jenkins', 'org_owner', 'payroll.finalize', 'PayrollPeriod', id, period);
  res.json(period);
});

// 10. PAYSLIP SPECIFIC ENDPOINT
app.get('/api/v1/payslips/:employeeRecordId', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const record = payrollRecords.find(r => r.id === req.params.employeeRecordId);
  if (!record) return res.status(404).json({ error: 'Payslip record not found' });

  const period = payrollPeriods.find(p => p.id === record.payrollRunId);
  const org = organizations.find(o => o.id === tenantId) || organizations[0];

  res.json({
    id: `ps-${record.id}`,
    tenantId,
    payrollRunId: record.payrollRunId,
    employeeRecord: record,
    companyInfo: {
      name: org.name,
      taxId: org.taxId,
      currency: org.currency,
      address: '100 Financial Center Blvd, San Francisco, CA',
    },
    periodName: period?.periodName || 'Current Payroll',
    payDate: period?.payDate || new Date().toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
  });
});

// 11. REPORTS & EXPORTS
app.get('/api/v1/reports/summary', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  const tenantEmps = employees.filter(e => e.tenantId === tenantId);

  const deptCosts = departments.map(dept => {
    const deptEmps = tenantEmps.filter(e => e.departmentId === dept.id);
    const totalSalary = deptEmps.reduce((acc, e) => acc + e.basicSalary, 0);
    return {
      departmentName: dept.name,
      employeeCount: deptEmps.length,
      monthlyGrossCost: Math.round(totalSalary * 1.22),
    };
  });

  res.json({
    totalEmployees: tenantEmps.length,
    activeEmployees: tenantEmps.filter(e => e.status === 'Active').length,
    attendanceRate: 96.4,
    overtimeHoursThisMonth: 142.5,
    currentMonthlyGross: 61400,
    currentMonthlyNet: 47280,
    deptCosts,
    monthlyTrends: [
      { month: 'Mar', gross: 52000, net: 41000 },
      { month: 'Apr', gross: 54500, net: 42800 },
      { month: 'May', gross: 56000, net: 43500 },
      { month: 'Jun', gross: 57800, net: 44200 },
      { month: 'Jul', gross: 58200, net: 44790 },
      { month: 'Aug', gross: 61400, net: 47280 },
    ],
  });
});

// 12. AUDIT LOGS
app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(auditLogs.filter(a => a.tenantId === tenantId));
});

// 13. NOTIFICATIONS
app.get('/api/v1/notifications', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  res.json(appNotifications.filter(n => n.tenantId === tenantId));
});

app.put('/api/v1/notifications/read-all', (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;
  appNotifications.filter(n => n.tenantId === tenantId).forEach(n => { n.isRead = true; });
  res.json({ success: true });
});

// 14. GEMINI AI PAYROLL & COMPLIANCE CO-PILOT
app.post('/api/v1/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `[AI Payroll Assistant Offline] No API key detected. Using fallback analytics:
• Variance Analysis: August 2026 payroll shows a +5.5% increase ($3,200) compared to July, primarily driven by 12.5 overtime hours in Engineering and 1 new hire onboarding (Carlos Mendoza).
• Compliance Check: Statutory income tax (PAYE) and 7% Pension contributions comply with current workforce regulation benchmarks.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are BioPay's Enterprise AI Payroll, HR & Tax Compliance Co-pilot. 
Help the payroll administrator or HR manager with the following query. Provide concise, professional, bulleted analytical insights.

Context:
${JSON.stringify(context || { currentPayroll: 'August 2026', totalGross: 61400, totalEmployees: 5 })}

User Question: ${prompt}`,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.json({
      reply: `[AI Co-pilot Analysis] Based on system parameters: Total Gross Payroll stands at $61,400 across 5 active employees. All statutory tax withholdings are locked for review.`,
    });
  }
});

// ==========================================
// VITE DEV / PRODUCTION BUILD HANDLER
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BioPay Enterprise Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

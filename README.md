# BIOPAY — Enterprise HR & Biometric Payroll Command Center

PRISMPAY is a full-stack, enterprise-grade HR, Biometric Attendance, and Automated Payroll Management system designed for multi-tenant organizations. Featuring a modern Bento Grid UI system, live biometric hardware punch simulation, statutory tax and gross-to-net calculation engines, NACHA direct deposit file generation, and an embedded Gemini AI HR Co-Pilot.

---

## 🌟 Key Features & Capabilities

### 1. Executive Analytics Dashboard
- **Bento Grid Architecture**: High-impact visual statistics with trend badges and micro-metric breakdowns for Gross Payroll, Net Disbursal, Tax Deductions, and Budget Utilization.
- **Biometric Attendance Tracking**: Real-time punctuality scoring and attendance rates with automated timecard anomaly alerts.
- **Hardware Fleet Status**: Live monitoring of active hardware biometric kiosks (HQ Turnstile, Engineering Face ID, Executive RFID, and WebCam AI Station).

### 2. Biometric Hardware Fleet & Punch Simulator
- **Multi-Modal Verification**: Supports Fingerprint Scanners, Optical Facial Recognition, Contactless Smart RFID Cards, and WebCam AI Station.
- **Interactive Punch Simulator**: Live modal for simulating employee clock-ins/clock-outs with mock hardware response latency and sound feedback.

### 3. Employee Directory & Profile Manager
- **360° Workforce Profiles**: Comprehensive records including Department, Job Title, Employment Type, Base Salary, Biometric Hardware ID, Direct Deposit Banking, and Emergency Contacts.
- **Department & Grade Filters**: Instant searching and filtering across Engineering, Product, Marketing, Sales, Operations, and HR.

### 4. Attendance & Timecard Management
- **Automated Overtime Engine**: Automatic calculation of standard working hours vs. 1.5x overtime multiplier based on biometric timestamps.
- **Timecard Exception Resolution**: One-click resolution for missing check-outs, delayed clock-ins, or hardware synchronization gaps.

### 5. Leave Application & Quota Workflow
- **Multi-Type Leave Tracking**: Annual Paid Leave, Sick Leave, Parental Leave, and Unpaid Time Off.
- **Manager Approval Pipeline**: Real-time status updates with reason tracking and quota deduction logic.

### 6. Automated Payroll & Compensation Engine
- **Gross-to-Net Engine**: Automated calculation of base salary, hourly overtime, statutory tax withholdings, medical insurance, and 401(k) retirement contributions.
- **NACHA / Direct Deposit Export**: Generates standardized electronic bank transfer batch files for seamless payroll disbursement.
- **Interactive Payslip Modal & PDF Export**: Detailed breakdown of earnings and deductions with one-click print/PDF download support.

### 7. Gemini AI HR & Payroll Co-Pilot
- **AI Workspace Assistant**: Integrated drawer powered by `@google/genai` to analyze tenant attendance logs, tax compliance rules, and salary band recommendations.

### 8. Immutable Audit Trail & Multi-Tenant Billing
- **Security Audit Logs**: Comprehensive compliance logging of all salary edits, attendance overrides, and biometric key re-mappings.
- **SaaS Subscription Tiers**: Starter, Business, and Enterprise plan management with tier-based employee and kiosk limits.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Icons**: Lucide React
- **Charts & Data Viz**: Recharts
- **AI Integration**: `@google/genai` (Gemini API)
- **Styling & Layout**: Bento Grid Design System with responsive mobile & desktop views

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

### Environment Setup
For full Gemini AI Co-Pilot functionality, set your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📜 License
This project is licensed under the MIT License.

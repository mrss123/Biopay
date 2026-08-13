import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { Header } from './components/layout/Header.js';
import { Sidebar, NavTab } from './components/layout/Sidebar.js';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard.js';
import { EmployeeManager } from './components/employees/EmployeeManager.js';
import { BiometricKiosksView } from './components/biometrics/BiometricKiosksView.js';
import { BiometricPunchSimulator } from './components/biometrics/BiometricPunchSimulator.js';
import { AttendanceManager } from './components/attendance/AttendanceManager.js';
import { LeaveManager } from './components/leave/LeaveManager.js';
import { PayrollEngineView } from './components/payroll/PayrollEngineView.js';
import { SalaryStructuresView } from './components/payroll/SalaryStructuresView.js';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView.js';
import { EmployeePortalView } from './components/portal/EmployeePortalView.js';
import { AuditTrailView } from './components/audit/AuditTrailView.js';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView.js';
import { AiCoPilotDrawer } from './components/copilot/AiCoPilotDrawer.js';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showBiometricPunchModal, setShowBiometricPunchModal] = useState(false);
  const [showAiCoPilot, setShowAiCoPilot] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBiometricPunchModal={() => setShowBiometricPunchModal(true)}
      />

      {/* Main Content Layout Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleAi={() => setShowAiCoPilot(!showAiCoPilot)}
          isAiOpen={showAiCoPilot}
        />

        {/* Dynamic Bento View Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              onNavigate={setActiveTab}
              onOpenBiometricPunch={() => setShowBiometricPunchModal(true)}
            />
          )}

          {activeTab === 'employees' && <EmployeeManager />}

          {activeTab === 'biometrics' && (
            <BiometricKiosksView
              onOpenPunchSimulator={() => setShowBiometricPunchModal(true)}
            />
          )}

          {activeTab === 'attendance' && <AttendanceManager />}

          {activeTab === 'leave' && <LeaveManager />}

          {activeTab === 'payroll' && <PayrollEngineView />}

          {activeTab === 'salary_structures' && <SalaryStructuresView />}

          {activeTab === 'reports' && <ReportsAnalyticsView />}

          {activeTab === 'portal' && <EmployeePortalView />}

          {activeTab === 'audit' && <AuditTrailView />}

          {activeTab === 'subscriptions' && <SubscriptionsView />}
        </main>
      </div>

      {/* Modals & AI Assistant Overlay */}
      <BiometricPunchSimulator
        isOpen={showBiometricPunchModal}
        onClose={() => setShowBiometricPunchModal(false)}
      />

      <AiCoPilotDrawer
        isOpen={showAiCoPilot}
        onClose={() => setShowAiCoPilot(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

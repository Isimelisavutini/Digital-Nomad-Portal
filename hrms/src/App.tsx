import React, { useState } from 'react';
import { Menu, X, Bell } from 'lucide-react';
import type { NavSection } from './types';
import { NAV, SectionHeader } from './components/ui';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { RecruitmentView } from './components/RecruitmentView';
import { OnboardingView } from './components/OnboardingView';
import { AttendanceView } from './components/AttendanceView';
import { LeaveView } from './components/LeaveView';
import { PayrollView } from './components/PayrollView';
import { PerformanceView } from './components/PerformanceView';
import { TrainingView } from './components/TrainingView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [section, setSection] = useState<NavSection>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <DashboardView onNavigate={setSection} />;
      case 'employees': return <EmployeesView />;
      case 'recruitment': return <RecruitmentView />;
      case 'onboarding': return <OnboardingView />;
      case 'attendance': return <AttendanceView />;
      case 'leave': return <LeaveView />;
      case 'payroll': return <PayrollView />;
      case 'performance': return <PerformanceView />;
      case 'training': return <TrainingView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView onNavigate={setSection} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">HR</div>
          <div>
            <p className="font-semibold text-sm leading-tight">HRMS</p>
            <p className="text-[10px] text-slate-400 leading-tight">Human Resources</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">PS</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Priya Sharma</p>
              <p className="text-[10px] text-slate-400">HR Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

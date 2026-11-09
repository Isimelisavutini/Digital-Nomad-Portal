import React, { Activity, useState } from 'react';
import type { NavSection } from '../../hrms/src/types';
import { LEAVE_REQUESTS } from '../../hrms/src/data';
import { NAV } from '../../hrms/src/components/ui';
import { DashboardView } from '../../hrms/src/components/DashboardView';
import { EmployeesView } from '../../hrms/src/components/EmployeesView';
import { RecruitmentView } from '../../hrms/src/components/RecruitmentView';
import { OnboardingView } from '../../hrms/src/components/OnboardingView';
import { AttendanceView } from '../../hrms/src/components/AttendanceView';
import { LeaveView } from '../../hrms/src/components/LeaveView';
import { PayrollView } from '../../hrms/src/components/PayrollView';
import { PerformanceView } from '../../hrms/src/components/PerformanceView';
import { TrainingView } from '../../hrms/src/components/TrainingView';
import { SettingsView } from '../../hrms/src/components/SettingsView';

// Portal-owned shell; the standalone HRMS entry point remains available.
export default function Workspace() {
  const [leaves, setLeaves] = useState(LEAVE_REQUESTS);
  const [section, setSection] = useState<NavSection>('dashboard');
  const [visited, setVisited] = useState<NavSection[]>(['dashboard']);
  const navigate = (next: NavSection) => {
    setSection(next);
    setVisited(previous => previous.includes(next) ? previous : [...previous, next]);
  };
  const views: Record<NavSection, React.ReactNode> = {
    dashboard: <DashboardView onNavigate={navigate} leaves={leaves} />,
    employees: <EmployeesView />,
    recruitment: <RecruitmentView />,
    onboarding: <OnboardingView />,
    attendance: <AttendanceView />,
    leave: <LeaveView leaves={leaves} onChange={setLeaves} />,
    payroll: <PayrollView />,
    performance: <PerformanceView />,
    training: <TrainingView />,
    settings: <SettingsView />,
  };

  return (
    <section className="hr-workspace min-w-0 space-y-5" aria-label="HR Management">
      <div>
        <h1 className="text-2xl font-bold text-brand-blue">HR Management</h1>
        <p className="text-sm text-slate-500">Your workforce, from hire to exit.</p>
      </div>
      <nav aria-label="HR modules" className="flex flex-wrap gap-2">
        {NAV.map(item => (
          <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined}
            onClick={() => navigate(item.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${section === item.id ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {item.icon}{item.id === 'settings' ? 'HR Settings' : item.label}
          </button>
        ))}
      </nav>
      {visited.map(id => (
        <Activity key={id} mode={id === section ? 'visible' : 'hidden'}>
          <div>{views[id]}</div>
        </Activity>
      ))}
    </section>
  );
}

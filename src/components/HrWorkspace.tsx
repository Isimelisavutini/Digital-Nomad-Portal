import React, { Activity } from 'react';
import type { NavSection } from '../../hrms/src/types';
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
export default function Workspace({ section, onNavigate }: { section: NavSection; onNavigate: (section: NavSection) => void }) {
  const views: Record<NavSection, React.ReactNode> = {
    dashboard: <DashboardView onNavigate={onNavigate} />,
    employees: <EmployeesView />,
    recruitment: <RecruitmentView />,
    onboarding: <OnboardingView />,
    attendance: <AttendanceView />,
    leave: <LeaveView />,
    payroll: <PayrollView />,
    performance: <PerformanceView />,
    training: <TrainingView />,
    settings: <SettingsView />,
  };

  return (
    <section className="hr-workspace min-w-0 space-y-5" aria-label="HR Management">
      {(Object.keys(views) as NavSection[]).map(id => (
        <Activity key={id} mode={id === section ? 'visible' : 'hidden'}>
          <div>{views[id]}</div>
        </Activity>
      ))}
    </section>
  );
}

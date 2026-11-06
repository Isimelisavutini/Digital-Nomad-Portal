import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, Clock, CalendarDays,
  Wallet, Target, GraduationCap, Settings, Search, Bell, Menu, X,
  ChevronRight, Plus, Filter, CheckCircle2, XCircle, AlertCircle,
  Briefcase, Building2, Mail, Phone, MapPin, MoreHorizontal
} from 'lucide-react';
import type {
  NavSection, Employee, LeaveRequest, LeaveStatus, Candidate,
  CandidateStatus, AttendanceRecord, OnboardingTask
} from './types';
import {
  EMPLOYEES, LEAVE_REQUESTS, LEAVE_BALANCES, ATTENDANCE,
  JOB_OPENINGS, CANDIDATES, ONBOARDING_TASKS, PAYROLL_RUNS,
  PERFORMANCE_GOALS, TRAINING_COURSES, TRAINING_ASSIGNMENTS,
  DEPARTMENTS, getEmployeeName, getInitials
} from './data';
import { formatCurrency, formatDate, statusColor, labelize, daysBetween } from './utils';

/* UI helpers */
function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(status)}`}>
      {labelize(status)}
    </span>
  );
}

function Avatar({ first, last, color, size = 'md' }: { first: string; last: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full flex items-center justify-center text-white font-semibold shrink-0`} style={{ backgroundColor: color }}>
      {getInitials(first, last)}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const NAV: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'employees', label: 'Employees', icon: <Users className="w-5 h-5" /> },
  { id: 'recruitment', label: 'Recruitment', icon: <UserPlus className="w-5 h-5" /> },
  { id: 'onboarding', label: 'Onboarding', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'attendance', label: 'Attendance', icon: <Clock className="w-5 h-5" /> },
  { id: 'leave', label: 'Leave', icon: <CalendarDays className="w-5 h-5" /> },
  { id: 'payroll', label: 'Payroll', icon: <Wallet className="w-5 h-5" /> },
  { id: 'performance', label: 'Performance', icon: <Target className="w-5 h-5" /> },
  { id: 'training', label: 'Training', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

/* NOTE: Full module views are in the complete App.tsx on the local build.
 * This placeholder ensures the repo structure is complete.
 * Please replace this file with the full App.tsx from the project build
 * (all modules: Dashboard, Employees, Recruitment, Onboarding, Attendance,
 * Leave, Payroll, Performance, Training, Settings).
 * Local path: /home/workdir/artifacts/hrms-app/src/App.tsx
 */

function PlaceholderView({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
      <p className="text-sm text-slate-500 mt-2">
        Full interactive UI available. Replace App.tsx with the complete build from the project.
      </p>
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState<NavSection>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const titles: Record<NavSection, string> = {
    dashboard: 'Dashboard', employees: 'Employees', recruitment: 'Recruitment',
    onboarding: 'Onboarding', attendance: 'Attendance', leave: 'Leave',
    payroll: 'Payroll', performance: 'Performance', training: 'Training', settings: 'Settings',
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
                section === item.id ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          <SectionHeader title={titles[section]} subtitle="HRMS module" />
          <PlaceholderView name={titles[section]} />
        </main>
      </div>
    </div>
  );
}

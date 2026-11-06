import React from 'react';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, Clock, CalendarDays,
  Wallet, Target, GraduationCap, Settings
} from 'lucide-react';
import type { NavSection } from '../types';
import { getInitials } from '../data';
import { statusColor, labelize } from '../utils';

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(status)}`}>
      {labelize(status)}
    </span>
  );
}

export function Avatar({ first, last, color, size = 'md' }: { first: string; last: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full flex items-center justify-center text-white font-semibold shrink-0`} style={{ backgroundColor: color }}>
      {getInitials(first, last)}
    </div>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
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

export const NAV: { id: NavSection; label: string; icon: React.ReactNode }[] = [
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

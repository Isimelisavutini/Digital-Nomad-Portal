import React from 'react';
import type { NavSection, LeaveRequest } from '../types';
import { EMPLOYEES, LEAVE_REQUESTS, ATTENDANCE, CANDIDATES, JOB_OPENINGS, DEPARTMENTS, getEmployeeName } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, StatCard, SectionHeader } from './ui';

export function DashboardView({ onNavigate, leaves = LEAVE_REQUESTS }: { onNavigate: (s: NavSection) => void; leaves?: LeaveRequest[] }) {
  const active = EMPLOYEES.filter(e => e.status === 'active' || e.status === 'probation').length;
  const pendingLeave = leaves.filter(l => l.status === 'pending').length;
  const openJobs = JOB_OPENINGS.filter(j => j.status === 'open').length;
  const candidates = CANDIDATES.filter(c => !['hired', 'rejected'].includes(c.status)).length;
  const today = '2026-11-06';
  const todayAtt = ATTENDANCE.filter(a => a.date === today);
  const present = todayAtt.filter(a => a.status === 'present' || a.status === 'late').length;

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Overview of your workforce" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Employees" value={active} sub={`${EMPLOYEES.filter(e => e.status === 'probation').length} on probation`} accent="text-brand-700" />
        <StatCard label="Present Today" value={`${present}/${todayAtt.length || active}`} sub="Attendance rate" />
        <StatCard label="Pending Leave" value={pendingLeave} sub="Awaiting approval" accent={pendingLeave > 0 ? 'text-amber-600' : undefined} />
        <StatCard label="Open Positions" value={openJobs} sub={`${candidates} candidates in pipeline`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Leave Requests</h2>
            <button onClick={() => onNavigate('leave')} className="text-xs text-brand-600 font-medium hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {leaves.slice(0, 4).map(lr => (
              <div key={lr.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{getEmployeeName(lr.employeeId)}</p>
                  <p className="text-xs text-slate-500">{labelize(lr.leaveType)} · {formatDate(lr.startDate)} – {formatDate(lr.endDate)}</p>
                </div>
                <Badge status={lr.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recruitment Pipeline</h2>
            <button onClick={() => onNavigate('recruitment')} className="text-xs text-brand-600 font-medium hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {CANDIDATES.filter(c => !['rejected'].includes(c.status)).slice(0, 4).map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-slate-500">{c.position}</p>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Headcount by Department</h2>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DEPARTMENTS.map(d => {
              const count = EMPLOYEES.filter(e => e.department === d.name && e.status !== 'terminated').length;
              return (
                <div key={d.id} className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500 mt-1">{d.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Users, Clock, CalendarDays, Briefcase, ArrowUpRight, ArrowRight } from 'lucide-react';
import type { NavSection, LeaveRequest } from '../types';
import { EMPLOYEES, LEAVE_REQUESTS, ATTENDANCE, CANDIDATES, JOB_OPENINGS, DEPARTMENTS, getEmployeeName } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, Avatar } from './ui';

export function DashboardView({ onNavigate, leaves = LEAVE_REQUESTS }: { onNavigate: (s: NavSection) => void; leaves?: LeaveRequest[] }) {
  const active = EMPLOYEES.filter(e => e.status === 'active' || e.status === 'probation').length;
  const pendingLeave = leaves.filter(l => l.status === 'pending').length;
  const openJobs = JOB_OPENINGS.filter(j => j.status === 'open').length;
  const candidates = CANDIDATES.filter(c => !['hired', 'rejected'].includes(c.status));
  const latestDate = ATTENDANCE.reduce((latest, record) => record.date > latest ? record.date : latest, '');
  const attendance = ATTENDANCE.filter(record => record.date === latestDate);
  const present = attendance.filter(record => record.status === 'present' || record.status === 'late').length;
  const departments = DEPARTMENTS.map(department => ({ ...department, count: EMPLOYEES.filter(employee => employee.department === department.name && employee.status !== 'terminated').length }));
  const maxHeadcount = Math.max(1, ...departments.map(department => department.count));
  const metrics = [
    { label: 'Active employees', value: active, detail: `${EMPLOYEES.filter(e => e.status === 'probation').length} on probation`, icon: Users, section: 'employees' as const },
    { label: 'Attendance', value: `${present}/${attendance.length}`, detail: latestDate ? `Latest recorded day · ${formatDate(latestDate)}` : 'No attendance recorded', icon: Clock, section: 'attendance' as const },
    { label: 'Pending leave', value: pendingLeave, detail: 'Awaiting approval', icon: CalendarDays, section: 'leave' as const },
    { label: 'Open positions', value: openJobs, detail: `${candidates.length} active candidates`, icon: Briefcase, section: 'recruitment' as const },
  ];
  const previewLeaves = [...leaves].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending')).slice(0, 4);
  const panel = 'rounded-xl border border-slate-200 bg-white';
  const link = 'inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-[#194b91] hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600';

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">Workforce overview</h1><p className="mt-1 text-sm text-slate-500">A clear view of your people and priorities.</p></div>
      <button type="button" onClick={() => onNavigate('employees')} className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#194b91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#143d77] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"><Users className="h-4 w-4" />View employees</button>
    </div>
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4">
      {metrics.map(metric => <button type="button" key={metric.label} onClick={() => onNavigate(metric.section)} className={`${panel} group p-5 text-left transition-colors hover:border-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600`}>
        <div className="mb-4 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><metric.icon className="h-[18px] w-[18px]" /></span><ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600" /></div>
        <p className="text-xs font-medium text-slate-500">{metric.label}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{metric.detail}</p>
      </button>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <section className={panel} aria-label="Leave requests">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Leave requests</h2><p className="mt-0.5 text-xs text-slate-500">{pendingLeave ? `${pendingLeave} ${pendingLeave === 1 ? "request needs" : "requests need"} your attention` : 'All requests reviewed'}</p></div><button type="button" onClick={() => onNavigate('leave')} className={link}>View all<ArrowRight className="h-3.5 w-3.5" /></button></div>
        <div className="divide-y divide-slate-100">{previewLeaves.map(leave => {
          const employee = EMPLOYEES.find(employee => employee.id === leave.employeeId);
          return <div key={leave.id} className="flex items-center gap-3 px-5 py-4">
            {employee && <Avatar first={employee.firstName} last={employee.lastName} color={employee.avatarColor} size="sm" />}
            <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-900">{getEmployeeName(leave.employeeId)}</p><p className="mt-0.5 text-xs text-slate-500">{labelize(leave.leaveType)} · {leave.days} {leave.days === 1 ? "day" : "days"}</p><p className="mt-0.5 text-[11px] text-slate-400">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p></div><Badge status={leave.status} />
          </div>;
        })}{previewLeaves.length === 0 && <p className="p-5 text-sm text-slate-500">No leave requests yet.</p>}</div>
      </section>
      <section className={panel} aria-label="Headcount by department"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Headcount by department</h2><p className="mt-0.5 text-xs text-slate-500">Your workforce at a glance</p></div>
        <div className="space-y-5 p-5">{departments.map(department => <div key={department.id}><div className="mb-2 flex justify-between text-xs"><span className="text-slate-600">{department.name}</span><span className="font-semibold tabular-nums text-slate-900">{department.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#19A7A0]" style={{width: `${department.count / maxHeadcount * 100}%`}} /></div></div>)}</div>
      </section>
    </div>
    <section className={`${panel} overflow-hidden`} aria-label="Recruitment pipeline">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Recruitment pipeline</h2><p className="mt-0.5 text-xs text-slate-500">Follow your candidates through the hiring process</p></div><button type="button" onClick={() => onNavigate('recruitment')} className={`${link} shrink-0`}>View all<ArrowRight className="h-3.5 w-3.5" /></button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Position</th><th className="px-5 py-3 font-medium">Stage</th></tr></thead><tbody className="divide-y divide-slate-100">{candidates.slice(0, 4).map(candidate => <tr key={candidate.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-900">{candidate.firstName} {candidate.lastName}</td><td className="px-5 py-4 text-slate-500">{candidate.position}</td><td className="px-5 py-4"><Badge status={candidate.status} /></td></tr>)}</tbody></table>{candidates.length === 0 && <p className="p-5 text-sm text-slate-500">No active candidates.</p>}</div>
    </section>
  </div>;
}

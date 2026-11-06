import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { EMPLOYEES, ONBOARDING_TASKS, getInitials } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, Avatar, SectionHeader } from './ui';

export function OnboardingView() {
  const newHires = EMPLOYEES.filter(e => e.status === 'probation');
  return (
    <div>
      <SectionHeader title="Onboarding" subtitle="New hire checklists and progress" />
      <div className="space-y-6">
        {newHires.map(emp => {
          const tasks = ONBOARDING_TASKS.filter(t => t.employeeId === emp.id);
          const done = tasks.filter(t => t.status === 'completed').length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <div key={emp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Avatar first={emp.firstName} last={emp.lastName} color={emp.avatarColor} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-slate-500">{emp.position} · Joined {formatDate(emp.joinDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{pct}%</p>
                  <p className="text-xs text-slate-500">{done}/{tasks.length} tasks</p>
                </div>
              </div>
              <div className="px-5 py-2">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="divide-y divide-slate-50">
                  {tasks.map(t => (
                    <div key={t.id} className="py-2.5 flex items-center gap-3">
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : t.status === 'in_progress' ? (
                        <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${t.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{t.title}</p>
                        <p className="text-xs text-slate-400">Due {formatDate(t.dueDate)} · {labelize(t.assignee)}</p>
                      </div>
                      <Badge status={t.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {newHires.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No employees currently in onboarding.
          </div>
        )}
      </div>
    </div>
  );
}

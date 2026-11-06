import React from 'react';
import { GraduationCap } from 'lucide-react';
import { TRAINING_COURSES, TRAINING_ASSIGNMENTS, getEmployeeName } from '../data';
import { formatDate } from '../utils';
import { Badge, SectionHeader } from './ui';

export function TrainingView() {
  return (
    <div>
      <SectionHeader title="Training" subtitle="Courses and assignments" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Course Catalog</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {TRAINING_COURSES.map(c => (
              <div key={c.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{c.title}</p>
                    {c.mandatory && <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700">Required</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.category} · {c.durationHours}h · {c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Assignments</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {TRAINING_ASSIGNMENTS.map(a => {
              const course = TRAINING_COURSES.find(c => c.id === a.courseId);
              return (
                <div key={a.id} className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{course?.title}</p>
                    <p className="text-xs text-slate-500">{getEmployeeName(a.employeeId)} · Due {formatDate(a.dueDate)}</p>
                  </div>
                  <Badge status={a.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

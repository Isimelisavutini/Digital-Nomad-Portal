import React from 'react';
import { PERFORMANCE_GOALS, PERFORMANCE_REVIEWS, getEmployeeName } from '../data';
import { formatDate } from '../utils';
import { Badge, SectionHeader } from './ui';

export function PerformanceView() {
  return (
    <div>
      <SectionHeader title="Performance" subtitle="Goals and reviews" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Active Goals</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {PERFORMANCE_GOALS.map(g => (
              <div key={g.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{g.title}</p>
                    <p className="text-xs text-slate-500">{getEmployeeName(g.employeeId)} · Due {formatDate(g.targetDate)}</p>
                  </div>
                  <Badge status={g.status} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-8">{g.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {PERFORMANCE_REVIEWS.map(r => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900">{getEmployeeName(r.employeeId)}</p>
                  <Badge status={r.status} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{r.period} · Reviewer: {getEmployeeName(r.reviewerId)}</p>
                <div className="flex gap-4 text-sm">
                  <span>Self: <strong>{r.selfRating}/5</strong></span>
                  <span>Manager: <strong>{r.managerRating}/5</strong></span>
                  <span>Overall: <strong>{r.overallRating}/5</strong></span>
                </div>
                {r.strengths && <p className="text-xs text-slate-600 mt-2"><strong>Strengths:</strong> {r.strengths}</p>}
              </div>
            ))}
            {PERFORMANCE_REVIEWS.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No reviews yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

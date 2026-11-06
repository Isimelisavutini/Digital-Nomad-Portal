import React, { useState } from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import type { LeaveStatus } from '../types';
import { LEAVE_REQUESTS, getEmployeeName } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, SectionHeader } from './ui';

export function LeaveView() {
  const [leaves, setLeaves] = useState(LEAVE_REQUESTS);
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all');

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  const handleAction = (id: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status, reviewedAt: '2026-11-06', reviewedBy: 'e2' } : l));
  };

  return (
    <div>
      <SectionHeader
        title="Leave Management"
        subtitle="Requests, balances, and approvals"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 shadow-sm">
            <Plus className="w-4 h-4" /> Request Leave
          </button>
        }
      />
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            {labelize(f)}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Employee</th>
              <th className="text-left px-5 py-3 font-medium">Type</th>
              <th className="text-left px-5 py-3 font-medium">Dates</th>
              <th className="text-left px-5 py-3 font-medium">Days</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(lr => (
              <tr key={lr.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{getEmployeeName(lr.employeeId)}</td>
                <td className="px-5 py-3"><Badge status={lr.leaveType} /></td>
                <td className="px-5 py-3 text-slate-600">{formatDate(lr.startDate)} – {formatDate(lr.endDate)}</td>
                <td className="px-5 py-3 text-slate-600">{lr.days}</td>
                <td className="px-5 py-3"><Badge status={lr.status} /></td>
                <td className="px-5 py-3">
                  {lr.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleAction(lr.id, 'approved')} className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Approve">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(lr.id, 'rejected')} className="p-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">No leave requests in this filter.</div>}
      </div>
    </div>
  );
}

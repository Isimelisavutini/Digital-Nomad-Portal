import React, { useState } from 'react';
import { EMPLOYEES, ATTENDANCE, getInitials } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, Avatar, SectionHeader } from './ui';

export function AttendanceView() {
  const dates = [...new Set(ATTENDANCE.map(a => a.date))].sort().reverse().slice(0, 7);
  const [selectedDate, setSelectedDate] = useState(dates[0] || '2026-11-06');
  const records = ATTENDANCE.filter(a => a.date === selectedDate);

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="Daily time & attendance records" />
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {dates.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDate === d ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {formatDate(d)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {(['present', 'late', 'on_leave', 'absent'] as const).map(s => (
          <div key={s} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{records.filter(r => r.status === s).length}</p>
            <p className="text-xs text-slate-500">{labelize(s)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Employee</th>
              <th className="text-left px-5 py-3 font-medium">Clock In</th>
              <th className="text-left px-5 py-3 font-medium">Clock Out</th>
              <th className="text-left px-5 py-3 font-medium">Hours</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map(r => {
              const emp = EMPLOYEES.find(e => e.id === r.employeeId);
              if (!emp) return null;
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar first={emp.firstName} last={emp.lastName} color={emp.avatarColor} size="sm" />
                      <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.clockIn || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{r.clockOut || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{r.hoursWorked?.toFixed(1) ?? '—'}</td>
                  <td className="px-5 py-3"><Badge status={r.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

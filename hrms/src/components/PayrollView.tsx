import React from 'react';
import { Plus } from 'lucide-react';
import { EMPLOYEES, PAYROLL_RUNS } from '../data';
import { formatCurrency, formatDate } from '../utils';
import { Badge, StatCard, SectionHeader } from './ui';

export function PayrollView() {
  const totalMonthly = EMPLOYEES.filter(e => e.status !== 'terminated').reduce((s, e) => s + e.salary / 12, 0);

  return (
    <div>
      <SectionHeader
        title="Payroll"
        subtitle="Salary runs and payslips"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 shadow-sm">
            <Plus className="w-4 h-4" /> Run Payroll
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Est. Monthly Gross" value={formatCurrency(totalMonthly)} />
        <StatCard label="Last Run" value={PAYROLL_RUNS[0]?.period || '—'} sub={PAYROLL_RUNS[0] ? formatDate(PAYROLL_RUNS[0].runDate) : undefined} />
        <StatCard label="Last Net Paid" value={formatCurrency(PAYROLL_RUNS[0]?.totalNet || 0)} accent="text-emerald-600" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Payroll History</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Period</th>
              <th className="text-left px-5 py-3 font-medium">Run Date</th>
              <th className="text-left px-5 py-3 font-medium">Employees</th>
              <th className="text-left px-5 py-3 font-medium">Gross</th>
              <th className="text-left px-5 py-3 font-medium">Deductions</th>
              <th className="text-left px-5 py-3 font-medium">Net</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PAYROLL_RUNS.map(pr => (
              <tr key={pr.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{pr.period}</td>
                <td className="px-5 py-3 text-slate-600">{formatDate(pr.runDate)}</td>
                <td className="px-5 py-3 text-slate-600">{pr.employeeCount}</td>
                <td className="px-5 py-3 text-slate-600">{formatCurrency(pr.totalGross)}</td>
                <td className="px-5 py-3 text-slate-600">{formatCurrency(pr.totalDeductions)}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{formatCurrency(pr.totalNet)}</td>
                <td className="px-5 py-3"><Badge status={pr.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Salary Register</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Employee</th>
              <th className="text-left px-5 py-3 font-medium">Department</th>
              <th className="text-left px-5 py-3 font-medium">Annual</th>
              <th className="text-left px-5 py-3 font-medium">Monthly</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {EMPLOYEES.filter(e => e.status !== 'terminated').map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{e.firstName} {e.lastName}</td>
                <td className="px-5 py-3 text-slate-600">{e.department}</td>
                <td className="px-5 py-3 text-slate-600">{formatCurrency(e.salary)}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(e.salary / 12)}</td>
                <td className="px-5 py-3"><Badge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

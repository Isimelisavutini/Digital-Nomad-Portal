import React, { useState, useMemo } from 'react';
import { Search, Mail, Phone, MapPin, Building2, Briefcase, Plus } from 'lucide-react';
import type { Employee } from '../../../src/data/model';
import { EmployeeEditor } from '../../../src/components/EmployeeEditor';
import { useHrData } from '../../../src/data/BusinessProvider';
import { formatDate, formatCurrency } from '../utils';
import { Badge, Avatar, SectionHeader } from './ui';

function EmployeesView() {
  const { EMPLOYEES, DEPARTMENTS } = useHrData();
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    return EMPLOYEES.filter(e => {
      const q = search.toLowerCase();
      const matchQ = !q || e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
      const matchD = deptFilter === 'all' || e.department === deptFilter;
      return matchQ && matchD;
    });
  }, [search, deptFilter, EMPLOYEES]);

  if (selected) {
    return (
      <div>
        {editing && <EmployeeEditor employee={selected} onClose={() => { setEditing(false); setSelected(null); }} />}
        <button onClick={() => setSelected(null)} className="text-sm text-brand-600 font-medium mb-4 hover:underline flex items-center gap-1">
          ← Back to employees
        </button>
        <button type="button" onClick={() => setEditing(true)} className="mb-4 ml-4 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">Edit employee & pay</button>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <Avatar first={selected.firstName} last={selected.lastName} color={selected.avatarColor} size="lg" />
              <div>
                <h2 className="text-xl font-bold">{selected.firstName} {selected.lastName}</h2>
                <p className="text-brand-100 text-sm">{selected.position} · {selected.department}</p>
                <div className="mt-2"><Badge status={selected.status} /></div>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selected.email}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selected.phone}</p>
                {selected.address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selected.address}</p>}
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide pt-2">Emergency</h3>
              <p className="text-sm">{selected.emergencyContact} · {selected.emergencyPhone}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Employment</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500">Code</dt><dd className="font-medium">{selected.employeeCode}</dd></div>
                <div><dt className="text-slate-500">Type</dt><dd><Badge status={selected.employmentType} /></dd></div>
                <div><dt className="text-slate-500">Join Date</dt><dd className="font-medium">{formatDate(selected.joinDate)}</dd></div>
                <div><dt className="text-slate-500">Salary</dt><dd className="font-medium">{formatCurrency(selected.salary)}</dd></div>
                <div><dt className="text-slate-500">Tax ID</dt><dd className="font-medium">{selected.taxId || '—'}</dd></div>
                <div><dt className="text-slate-500">Bank</dt><dd className="font-medium">{selected.bankAccount || '—'}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {editing && <EmployeeEditor onClose={() => setEditing(false)} />}
      <SectionHeader
        title="Employees"
        subtitle={`${EMPLOYEES.length} total records`}
        action={
          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 shadow-sm">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        }
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, code, role…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Employee</th>
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-left px-5 py-3 font-medium">Position</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Join Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar first={e.firstName} last={e.lastName} color={e.avatarColor} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{e.firstName} {e.lastName}</p>
                        <p className="text-xs text-slate-500">{e.employeeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{e.department}</td>
                  <td className="px-5 py-3 text-slate-600">{e.position}</td>
                  <td className="px-5 py-3"><Badge status={e.status} /></td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(e.joinDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">No employees match your filters.</div>
        )}
      </div>
    </div>
  );
}

export { EmployeesView };

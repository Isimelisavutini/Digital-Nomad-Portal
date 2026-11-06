import React from 'react';
import { Building2, CalendarDays } from 'lucide-react';
import { DEPARTMENTS } from '../data';
import { SectionHeader } from './ui';

export function SettingsView() {
  return (
    <div>
      <SectionHeader title="Settings" subtitle="System configuration" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company</h2>
          <div className="space-y-3 text-sm">
            <div><label className="text-xs text-slate-500">Company Name</label><input defaultValue="Acme Corporation" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
            <div><label className="text-xs text-slate-500">Timezone</label><input defaultValue="America/Chicago" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
            <div><label className="text-xs text-slate-500">Fiscal Year Start</label><input defaultValue="January" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Leave Policy</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span>Annual Leave</span><span className="font-medium">18 days</span></div>
            <div className="flex justify-between items-center"><span>Sick Leave</span><span className="font-medium">10 days</span></div>
            <div className="flex justify-between items-center"><span>Carry Forward</span><span className="font-medium">Up to 5 days</span></div>
            <div className="flex justify-between items-center"><span>Approval Chain</span><span className="font-medium">Manager → HR</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 md:col-span-2">
          <h2 className="font-semibold text-slate-900">Departments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEPARTMENTS.map(d => (
              <div key={d.id} className="px-3 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700">{d.name}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { CANDIDATES, JOB_OPENINGS } from '../data';
import { formatDate, labelize } from '../utils';
import { Badge, SectionHeader } from './ui';

export function RecruitmentView() {
  const [tab, setTab] = useState<'jobs' | 'candidates'>('candidates');

  return (
    <div>
      <SectionHeader
        title="Recruitment"
        subtitle="Job openings and candidate pipeline"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 shadow-sm">
            <Plus className="w-4 h-4" /> Post Job
          </button>
        }
      />
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {(['candidates', 'jobs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t === 'candidates' ? `Candidates (${CANDIDATES.length})` : `Jobs (${JOB_OPENINGS.length})`}
          </button>
        ))}
      </div>

      {tab === 'candidates' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Candidate</th>
                <th className="text-left px-5 py-3 font-medium">Position</th>
                <th className="text-left px-5 py-3 font-medium">Source</th>
                <th className="text-left px-5 py-3 font-medium">Applied</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CANDIDATES.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.position}</td>
                  <td className="px-5 py-3 text-slate-600">{c.source}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(c.appliedAt)}</td>
                  <td className="px-5 py-3"><Badge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_OPENINGS.map(j => (
            <div key={j.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-brand-600" />
                </div>
                <Badge status={j.status} />
              </div>
              <h3 className="font-semibold text-slate-900">{j.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{j.department} · {j.location}</p>
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">{j.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{j.openings} opening{j.openings > 1 ? 's' : ''}</span>
                <span>Posted {formatDate(j.postedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

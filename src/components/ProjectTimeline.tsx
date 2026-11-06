import React, { useState } from 'react';
import { ProjectScope, TimelineWeek } from '../types';
import { TIMELINE_SCOPES, STANDARD_6_WEEK_TIMELINE } from '../constants';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Shield,
  Database,
  Server,
  Layout,
  Globe2,
  Zap,
  Network,
  Waves,
} from 'lucide-react';

export const ProjectTimeline: React.FC = () => {
  const [selectedScope, setSelectedScope] = useState<ProjectScope>('standard');
  const [weeksData, setWeeksData] = useState<TimelineWeek[]>(STANDARD_6_WEEK_TIMELINE);
  const [activeTab, setActiveTab] = useState<'sprints' | 'blueprint'>('sprints');

  const toggleDeliverable = (weekIndex: number, deliverableId: string) => {
    setWeeksData((prev) => {
      const next = [...prev];
      const week = { ...next[weekIndex] };
      week.deliverables = week.deliverables.map((d) =>
        d.id === deliverableId ? { ...d, completed: !d.completed } : d
      );
      next[weekIndex] = week;
      return next;
    });
  };

  // Compute total hours & completed hours
  const totalPlannedHours = weeksData.reduce((acc, w) => acc + w.totalHours, 0);
  const completedHours = weeksData.reduce((acc, w) => {
    const weekDone = w.deliverables
      .filter((d) => d.completed)
      .reduce((sub, d) => sub + d.hours, 0);
    return acc + weekDone;
  }, 0);

  const completionPercentage = Math.round((completedHours / totalPlannedHours) * 100);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'database':
        return <span className="text-[#164B91] bg-[#D9F1EC] border border-[#19A7A0]/30 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">DB / RLS (Reef Teal)</span>;
      case 'security':
        return <span className="text-[#F28C28] bg-[#F28C28]/15 border border-[#F28C28]/30 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">Security (Orange)</span>;
      case 'devops':
        return <span className="text-[#164B91] bg-[#EAF4F8] border border-[#164B91]/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">DevOps (Blue)</span>;
      case 'backend':
        return <span className="text-[#164B91] bg-[#EAF4F8] border border-[#164B91]/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">Backend (Blue)</span>;
      case 'frontend':
        return <span className="text-[#6941A5] bg-[#6941A5]/10 border border-[#6941A5]/25 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">Frontend (Purple)</span>;
      default:
        return <span className="text-[#24344D]/70 bg-[#F5F7FA] border border-[#D9F1EC] px-2 py-0.5 rounded text-[10px] font-mono font-semibold">{category}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Scope Selector & Progress Header */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#164B91]" />
              <h2 className="text-base font-bold text-[#24344D] font-heading flex items-center gap-1.5">
                <span>Architecture Sprints & Latency Blueprint</span>
                <Waves className="w-4 h-4 text-[#19A7A0]" />
              </h2>
            </div>
            <p className="text-xs text-[#24344D]/70 mt-1">
              Structured 200-Hour implementation lifecycle for Pacific Cloud & AI systems.
            </p>
          </div>

          {/* Sub-view toggle: Sprints vs Architecture Blueprint */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA] rounded-lg border border-[#D9F1EC] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('sprints')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-heading ${
                activeTab === 'sprints'
                  ? 'bg-[#164B91] text-white shadow-xs'
                  : 'text-[#24344D]/70 hover:text-[#164B91]'
              }`}
            >
              6-Week Sprint Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-heading ${
                activeTab === 'blueprint'
                  ? 'bg-[#164B91] text-white shadow-xs'
                  : 'text-[#24344D]/70 hover:text-[#164B91]'
              }`}
            >
              Architecture & Latency
            </button>
          </div>
        </div>

        {/* Scope Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {(Object.keys(TIMELINE_SCOPES) as ProjectScope[]).map((scopeKey) => {
            const scope = TIMELINE_SCOPES[scopeKey];
            const isSelected = selectedScope === scopeKey;
            return (
              <button
                key={scopeKey}
                type="button"
                onClick={() => setSelectedScope(scopeKey)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#164B91] bg-[#EAF4F8] text-[#24344D] ring-1 ring-[#164B91]/30 shadow-xs font-semibold'
                    : 'border-[#D9F1EC] bg-[#F5F7FA]/50 text-[#24344D]/80 hover:border-[#19A7A0] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24344D] font-heading">{scope.name}</span>
                  <span className="text-[11px] font-mono font-semibold text-[#164B91] bg-[#D9F1EC] px-2 py-0.5 rounded border border-[#19A7A0]/30">
                    {scope.duration}
                  </span>
                </div>
                <div className="text-xs text-[#24344D]/70 mt-1.5 leading-relaxed">
                  {scope.description}
                </div>
                <div className="text-[11px] text-[#24344D]/60 mt-2 font-mono flex items-center justify-between">
                  <span>Target: {scope.hours} Hours</span>
                  <span className="text-[#164B91] font-semibold">{scopeKey === 'standard' ? 'Reference Spec' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Progress Bar */}
        <div className="pt-2 border-t border-[#EAF4F8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#24344D] font-heading">Sprint Deliverables Progress:</span>
            <span className="font-mono text-[#164B91] font-bold">
              {completedHours} / {totalPlannedHours} Hours ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full sm:w-64 bg-[#D9F1EC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#164B91] h-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* VIEW A: 6-WEEK SPRINTS VIEW */}
      {activeTab === 'sprints' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeksData.map((week, idx) => {
              const weekCompletedHours = week.deliverables
                .filter((d) => d.completed)
                .reduce((acc, d) => acc + d.hours, 0);
              const weekProgress = Math.round((weekCompletedHours / week.totalHours) * 100);
              const isFullyDone = weekProgress === 100;

              return (
                <div
                  key={week.weekNumber}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-3 ${
                    isFullyDone ? 'border-[#19A7A0] bg-[#D9F1EC]/20' : 'border-[#D9F1EC]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#EAF4F8] pb-2.5">
                    <div>
                      <div className="text-xs font-bold text-[#164B91] uppercase tracking-wide font-heading">
                        {week.weekNumber} · {week.phase}
                      </div>
                      <div className="text-sm font-extrabold text-[#24344D] font-heading">
                        {week.title}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EAF4F8] text-[#164B91] border border-[#164B91]/15">
                      {week.totalHours}h
                    </span>
                  </div>

                  <p className="text-xs text-[#24344D]/75 leading-relaxed">
                    {week.focus}
                  </p>

                  {/* Checklist of deliverables */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-[#24344D]/60 uppercase tracking-wider font-heading">
                      Key Deliverables & Hours
                    </div>
                    <div className="space-y-1.5">
                      {week.deliverables.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleDeliverable(idx, item.id)}
                          className={`p-2 rounded-lg border text-xs flex items-start gap-2 cursor-pointer transition-colors ${
                            item.completed
                              ? 'bg-[#D9F1EC]/40 border-[#19A7A0]/40 text-[#24344D]'
                              : 'bg-[#F5F7FA]/70 border-[#D9F1EC] text-[#24344D]/80 hover:bg-white'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#19A7A0]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#24344D]/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`font-medium ${
                                  item.completed ? 'line-through text-[#24344D]/50' : 'text-[#24344D]'
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="font-mono text-[10px] text-[#24344D]/60 shrink-0">
                                {item.hours}h
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              {getCategoryBadge(item.category)}
                              <span className="text-[10px] text-[#24344D]/50 font-mono">
                                {week.weekNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Week Progress Footer */}
                  <div className="pt-2 border-t border-[#EAF4F8] flex items-center justify-between text-[11px] font-mono text-[#24344D]/70">
                    <span>
                      {weekCompletedHours} of {week.totalHours} hrs done
                    </span>
                    <span className="font-bold text-[#164B91]">{weekProgress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW B: ARCHITECTURE & LATENCY BLUEPRINT */}
      {activeTab === 'blueprint' && (
        <div className="space-y-6">
          {/* Australia East vs US West Latency Card */}
          <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAF4F8] pb-3">
              <Globe2 className="w-5 h-5 text-[#164B91]" />
              <div>
                <h3 className="text-base font-bold text-[#24344D] font-heading">
                  Pacific Latency Optimization (Australia East vs US West)
                </h3>
                <p className="text-xs text-[#24344D]/70">
                  Regional network routing strategy for Fiji, Australia, and New Zealand users.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Recommended Sydney Region */}
              <div className="p-4 rounded-xl border-2 border-[#19A7A0] bg-[#D9F1EC]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#19A7A0] animate-pulse" />
                    <span className="text-sm font-bold text-[#164B91] font-heading">
                      Australia East (Sydney / ap-southeast-2)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#D9F1EC] text-[#164B91] border border-[#19A7A0]/30">
                    Recommended (48ms)
                  </span>
                </div>
                <div className="text-2xl font-black text-[#164B91] font-mono">
                  ~48 ms <span className="text-xs font-normal text-[#24344D]/70">round-trip ping from Fiji</span>
                </div>
                <ul className="text-xs text-[#24344D]/80 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Direct subsea cable routing via Southern Cross Cable Network (Suva to Sydney).</li>
                  <li>Azure Australia East + Supabase Sydney co-location gives under 2ms inter-service latency.</li>
                  <li>Real-time chat & websocket presence responsive for Pacific clients.</li>
                </ul>
              </div>

              {/* Option B: Standard US West Region */}
              <div className="p-4 rounded-xl border border-[#D9F1EC] bg-[#F5F7FA]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#24344D]/40" />
                    <span className="text-sm font-bold text-[#24344D] font-heading">
                      US West (Oregon / California)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-[#24344D]/70">
                    Trans-Pacific (142ms)
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#24344D]/70 font-mono">
                  ~142 ms <span className="text-xs font-normal text-[#24344D]/60">round-trip ping from Fiji</span>
                </div>
                <ul className="text-xs text-[#24344D]/70 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Crosses the Pacific Ocean to West Coast US datacenters.</li>
                  <li>Noticeable typing latency and query delay for users across the Pacific Islands.</li>
                  <li>Ideal only for North American exclusive user bases.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Database Connection Pooling Blueprint (Port 6543 vs Port 5432) */}
          <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAF4F8] pb-3">
              <Network className="w-5 h-5 text-[#164B91]" />
              <div>
                <h3 className="text-base font-bold text-[#24344D] font-heading">
                  Supavisor Connection Pooling Blueprint (Port 6543)
                </h3>
                <p className="text-xs text-[#24344D]/70">
                  Critical connection management architecture preventing Azure App Service connection exhaustion.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#EAF4F8]/70 border border-[#164B91]/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#164B91] font-heading">
                  <span>Port 6543: Supavisor Transaction Pool</span>
                  <span className="px-2 py-0.5 rounded bg-[#164B91] text-white">Active Production</span>
                </div>
                <p className="text-xs text-[#24344D]/80 leading-relaxed">
                  Azure Linux App Service and serverless functions connect via Port 6543. Supavisor holds thousands of idle connections while multiplexing active SQL queries over a compact pool of physical Postgres connections.
                </p>
                <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-[#D9F1EC] text-[#164B91]">
                  postgres://[user]:[pwd]@[host].pooler.supabase.com:6543/postgres?pgbouncer=true
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#24344D]/80 font-heading">
                  <span>Port 5432: Direct Session Connection</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[#24344D]/70">Migrations Only</span>
                </div>
                <p className="text-xs text-[#24344D]/70 leading-relaxed">
                  Used solely for DDL schema migrations, Prisma/Drizzle CLI schema push, and temporary psql admin sessions. Connecting high-concurrency Node.js web workers to Port 5432 causes Postgres <code className="text-red-600 font-mono">FATAL: remaining connection slots are reserved</code> errors.
                </p>
                <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-[#D9F1EC] text-[#24344D]/70">
                  postgres://[user]:[pwd]@[host].supabase.co:5432/postgres
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

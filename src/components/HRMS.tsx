import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { hrmsApi, num, fmtDate } from '../hrms/api';
import {
  Users, UserPlus, Briefcase, ClipboardCheck, Clock, CalendarDays,
  TrendingUp, GraduationCap, LogOut, ShieldCheck, RefreshCw, Download,
  CheckCircle2, AlertCircle,
} from 'lucide-react';

/* Lean row types (numeric PG columns arrive as strings — normalize with num()) */
interface Employee { id: number; fullName: string; email: string; phone?: string | null; department?: string | null; position?: string | null; managerId?: number | null; joinDate?: string | null; employmentType?: string | null; tinNumber?: string | null; fnpfNumber?: string | null; bankName?: string | null; bankAccountNumber?: string | null; grossPayFjd?: string | number | null; payType?: string | null; status?: string | null; tags?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null; address?: string | null; }
interface Candidate { id: number; requisitionTitle: string; department?: string | null; candidateName: string; candidateEmail: string; candidatePhone?: string | null; resumeSummary?: string | null; source?: string | null; stage?: string | null; interviewDate?: string | null; interviewNotes?: string | null; offerAmountFjd?: string | number | null; convertedEmployeeId?: number | null; }
interface OnTask { id: number; employeeId: number; title: string; category?: string | null; assignee?: string | null; dueDate?: string | null; status?: string | null; notes?: string | null; }
interface Attendance { id: number; employeeId: number; workDate: string; clockIn?: string | null; clockOut?: string | null; hoursWorked?: string | number | null; overtimeHours?: string | number | null; shift?: string | null; flag?: string | null; }
interface LeaveType { id: number; name: string; annualEntitlementDays?: string | number | null; carryForwardMaxDays?: string | number | null; encashable?: boolean | null; }
interface LeaveReq { id: number; employeeId: number; leaveTypeId: number; startDate: string; endDate: string; daysRequested?: string | number | null; reason?: string | null; status?: string | null; approver?: string | null; }
interface Review { id: number; employeeId: number; reviewPeriod: string; goals?: string | null; selfAssessment?: string | null; managerFeedback?: string | null; rating?: number | null; developmentPlan?: string | null; status?: string | null; }
interface Course { id: number; title: string; provider?: string | null; category?: string | null; durationHours?: string | number | null; expiryMonths?: number | null; }
interface Assignment { id: number; courseId: number; employeeId: number; assignedDate: string; dueDate?: string | null; status?: string | null; completedDate?: string | null; scorePercent?: number | null; }
interface Offboard { id: number; employeeId: number; initiatedDate: string; lastWorkingDate?: string | null; reason?: string | null; exitInterviewNotes?: string | null; assetsRecovered?: boolean | null; accessRevoked?: boolean | null; finalSettlementFjd?: string | number | null; status?: string | null; }
interface AuditRow { id: number; actorName?: string | null; action?: string | null; entityType?: string | null; entityId?: string | null; details?: string | null; createdAt?: string | null; }

type TabId = 'overview' | 'directory' | 'recruitment' | 'onboarding' | 'attendance' | 'leave' | 'performance' | 'training' | 'offboarding' | 'audit';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'HR Overview', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'directory', label: 'Directory', icon: <UserPlus className="w-3.5 h-3.5" /> },
  { id: 'recruitment', label: 'Recruitment', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'onboarding', label: 'Onboarding', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
  { id: 'attendance', label: 'Attendance', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'leave', label: 'Leave', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'training', label: 'Training', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'offboarding', label: 'Offboarding', icon: <LogOut className="w-3.5 h-3.5" /> },
  { id: 'audit', label: 'Audit & Reports', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

const card = 'bg-white border border-stone-200 rounded-xl shadow-sm';
const inputCls = 'w-full text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#164B91]';
const btnPrimary = 'text-xs font-bold px-3 py-1.5 rounded-lg bg-[#164B91] text-white hover:bg-[#123c75] transition-all cursor-pointer';
const btnGhost = 'text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-all cursor-pointer';

function exportCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const HRMS: React.FC = () => {
  const [tab, setTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [onTasks, setOnTasks] = useState<OnTask[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveReqs, setLeaveReqs] = useState<LeaveReq[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [offboards, setOffboards] = useState<Offboard[]>([]);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [stats, setStats] = useState<{ employees: number; candidates: number; pendingLeave: number; openOnboarding: number; activeOffboarding: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e, c, o, a, lt, lr, r, co, as, ob, au] = await Promise.all([
        hrmsApi.overview().catch(() => null),
        hrmsApi.list<Employee>('employees'),
        hrmsApi.list<Candidate>('candidates'),
        hrmsApi.list<OnTask>('onboarding'),
        hrmsApi.list<Attendance>('attendance'),
        hrmsApi.list<LeaveType>('leave-types'),
        hrmsApi.list<LeaveReq>('leave-requests'),
        hrmsApi.list<Review>('reviews'),
        hrmsApi.list<Course>('courses'),
        hrmsApi.list<Assignment>('assignments'),
        hrmsApi.list<Offboard>('offboarding'),
        hrmsApi.list<AuditRow>('audit'),
      ]);
      setStats(s ? { employees: s.employees, candidates: s.candidates, pendingLeave: s.pendingLeave, openOnboarding: s.openOnboarding, activeOffboarding: s.activeOffboarding } : null);
      setEmployees(e); setCandidates(c); setOnTasks(o); setAttendance(a);
      setLeaveTypes(lt); setLeaveReqs(lr); setReviews(r); setCourses(co);
      setAssignments(as); setOffboards(ob); setAuditRows(au);
      setOffline(false);
    } catch (err) {
      setOffline(true);
      setError(err instanceof Error ? err.message : 'Could not reach the HRMS API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const empName = useCallback((id?: number | null) => employees.find((e) => e.id === id)?.fullName ?? `#${id ?? '—'}`, [employees]);
  const leaveTypeName = useCallback((id?: number | null) => leaveTypes.find((t) => t.id === id)?.name ?? `#${id ?? '—'}`, [leaveTypes]);
  const courseName = useCallback((id?: number | null) => courses.find((c) => c.id === id)?.title ?? `#${id ?? '—'}`, [courses]);

  const leaveBalances = useMemo(() => {
    // entitlement minus approved days, per employee + leave type
    const used: Record<string, number> = {};
    for (const r of leaveReqs) {
      if (r.status !== 'approved') continue;
      const k = `${r.employeeId}:${r.leaveTypeId}`;
      used[k] = (used[k] ?? 0) + num(r.daysRequested);
    }
    return used;
  }, [leaveReqs]);

  const onboardingProgress = useMemo(() => {
    const map: Record<number, { total: number; done: number }> = {};
    for (const t of onTasks) {
      const e = map[t.employeeId] ?? { total: 0, done: 0 };
      e.total += 1;
      if (t.status === 'done') e.done += 1;
      map[t.employeeId] = e;
    }
    return map;
  }, [onTasks]);

  /* ---------- shared small forms ---------- */
  const [empForm, setEmpForm] = useState({ fullName: '', email: '', department: 'Engineering', position: 'Team Member', grossPayFjd: '4500', status: 'active' });
  const [candForm, setCandForm] = useState({ requisitionTitle: '', candidateName: '', candidateEmail: '', department: 'Engineering' });
  const [leaveForm, setLeaveForm] = useState({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [attForm, setAttForm] = useState({ employeeId: '', workDate: new Date().toISOString().slice(0, 10), clockIn: '08:00', clockOut: '16:30' });
  const [reviewForm, setReviewForm] = useState({ employeeId: '', reviewPeriod: 'H2 2026', goals: '', rating: '3' });
  const [courseForm, setCourseForm] = useState({ title: '', provider: 'Internal', category: 'compliance' });
  const [assignForm, setAssignForm] = useState({ courseId: '', employeeId: '', assignedDate: new Date().toISOString().slice(0, 10) });
  const [offForm, setOffForm] = useState({ employeeId: '', initiatedDate: new Date().toISOString().slice(0, 10), reason: 'resignation' });
  const [onForm, setOnForm] = useState({ employeeId: '', title: '' });
  const [dirQuery, setDirQuery] = useState('');
  const [dirStatus, setDirStatus] = useState('all');

  const refresh = async (fn: () => Promise<void>) => { try { await fn(); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); } };

  const filteredEmployees = employees.filter((e) => {
    const q = dirQuery.toLowerCase();
    const matchQ = !q || e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.department ?? '').toLowerCase().includes(q);
    const matchS = dirStatus === 'all' || e.status === dirStatus;
    return matchQ && matchS;
  });

  if (loading) {
    return (
      <div className={`${card} p-10 text-center text-sm text-slate-500`}>
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading HRMS workspace…
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#164B91]" /> HRMS · Hire-to-Exit Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Basic modules plan: directory, recruitment, onboarding, attendance, leave, performance, training, offboarding, audit.
            Payroll runs in <strong>Bookkeeping → Payroll &amp; FNPF</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void load()} className={btnGhost}>
            <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</span>
          </button>
          <button type="button" onClick={() => exportCsv('hrms_employees.csv', employees as unknown as Array<Record<string, unknown>>)} className={btnGhost}>
            <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Directory CSV</span>
          </button>
        </div>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span><strong>HRMS API unreachable</strong> — {error ?? 'showing empty workspace'}. Data persists in Netlify Database once deployed; local dev needs <code>netlify dev</code> for functions.</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`${card} p-2 flex flex-wrap gap-1.5`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${tab === t.id ? 'bg-[#164B91] text-white border-[#164B91]' : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Employees', value: stats?.employees ?? employees.length },
              { label: 'Candidates in ATS', value: stats?.candidates ?? candidates.length },
              { label: 'Pending Leave', value: stats?.pendingLeave ?? leaveReqs.filter((r) => r.status === 'pending').length },
              { label: 'Open Onboarding Tasks', value: stats?.openOnboarding ?? onTasks.filter((t) => t.status !== 'done').length },
              { label: 'Active Offboardings', value: stats?.activeOffboarding ?? offboards.filter((o) => o.status !== 'completed').length },
            ].map((k) => (
              <div key={k.label} className={`${card} p-4`}>
                <div className="text-2xl font-bold text-slate-900">{k.value}</div>
                <div className="text-[11px] font-semibold text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${card} p-4`}>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Headcount by Status</h3>
              {employees.length === 0 && <p className="text-xs text-slate-400">No employees yet — add the first record in Directory.</p>}
              {Object.entries(employees.reduce<Record<string, number>>((m, e) => { m[e.status ?? 'active'] = (m[e.status ?? 'active'] ?? 0) + 1; return m; }, {})).map(([s, c]) => (
                <div key={s} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                  <span className="font-semibold text-slate-600 capitalize">{s.replace('_', ' ')}</span>
                  <span className="font-mono font-bold text-slate-900">{c}</span>
                </div>
              ))}
            </div>
            <div className={`${card} p-4`}>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Leave Requests by Status</h3>
              {leaveReqs.length === 0 && <p className="text-xs text-slate-400">No leave requests yet.</p>}
              {Object.entries(leaveReqs.reduce<Record<string, number>>((m, r) => { m[r.status ?? 'pending'] = (m[r.status ?? 'pending'] ?? 0) + 1; return m; }, {})).map(([s, c]) => (
                <div key={s} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                  <span className="font-semibold text-slate-600 capitalize">{s}</span>
                  <span className="font-mono font-bold text-slate-900">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY — Module 1 */}
      {tab === 'directory' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Add Employee (single source of truth)</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <input className={inputCls} placeholder="Full name *" value={empForm.fullName} onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })} />
              <input className={inputCls} placeholder="Email *" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
              <input className={inputCls} placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} />
              <input className={inputCls} placeholder="Position" value={empForm.position} onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })} />
              <input className={inputCls} placeholder="Gross FJD/mo" value={empForm.grossPayFjd} onChange={(e) => setEmpForm({ ...empForm, grossPayFjd: e.target.value })} />
              <select className={inputCls} value={empForm.status} onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}>
                {['active', 'probation', 'on_leave', 'suspended', 'terminated'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-2">
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('employees', empForm); setEmpForm({ fullName: '', email: '', department: 'Engineering', position: 'Team Member', grossPayFjd: '4500', status: 'active' }); })}>Add Employee</button>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input className={inputCls} placeholder="Search name, email, department…" value={dirQuery} onChange={(e) => setDirQuery(e.target.value)} />
              <select className={`${inputCls} sm:max-w-[180px]`} value={dirStatus} onChange={(e) => setDirStatus(e.target.value)}>
                <option value="all">All statuses</option>
                {['active', 'probation', 'on_leave', 'suspended', 'terminated'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Name</th><th className="py-1.5 pr-2">Dept / Position</th><th className="py-1.5 pr-2">Status</th><th className="py-1.5 pr-2">Gross FJD</th><th className="py-1.5 pr-2">Onboarding</th><th className="py-1.5">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredEmployees.map((e) => {
                    const p = onboardingProgress[e.id];
                    const pct = p && p.total ? Math.round((p.done / p.total) * 100) : null;
                    return (
                      <tr key={e.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-2 pr-2"><div className="font-bold text-slate-900">{e.fullName}</div><div className="text-slate-400 font-mono text-[10px]">{e.email}</div></td>
                        <td className="py-2 pr-2 text-slate-600">{e.department} · {e.position}</td>
                        <td className="py-2 pr-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef5fb] text-[#164B91] border border-[#b7d1ec] capitalize">{(e.status ?? 'active').replace('_', ' ')}</span></td>
                        <td className="py-2 pr-2 font-mono">${num(e.grossPayFjd).toLocaleString()}</td>
                        <td className="py-2 pr-2 text-slate-500">{pct === null ? '—' : `${pct}% (${p.done}/${p.total})`}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button type="button" className={btnGhost} title="Clock in" onClick={() => void refresh(async () => { await hrmsApi.clock(e.id, 'in'); })}>In</button>
                            <button type="button" className={btnGhost} title="Clock out" onClick={() => void refresh(async () => { await hrmsApi.clock(e.id, 'out'); })}>Out</button>
                            <button type="button" className={btnGhost} title="Suspend / reactivate" onClick={() => void refresh(async () => { await hrmsApi.update('employees', e.id, { status: e.status === 'suspended' ? 'active' : 'suspended' }); })}>{e.status === 'suspended' ? 'Unsuspend' : 'Suspend'}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No matching employees.</p>}
            </div>
          </div>
        </div>
      )}

      {/* RECRUITMENT — Module 2 */}
      {tab === 'recruitment' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">New Requisition / Candidate</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input className={inputCls} placeholder="Requisition title *" value={candForm.requisitionTitle} onChange={(e) => setCandForm({ ...candForm, requisitionTitle: e.target.value })} />
              <input className={inputCls} placeholder="Candidate name *" value={candForm.candidateName} onChange={(e) => setCandForm({ ...candForm, candidateName: e.target.value })} />
              <input className={inputCls} placeholder="Candidate email *" value={candForm.candidateEmail} onChange={(e) => setCandForm({ ...candForm, candidateEmail: e.target.value })} />
              <input className={inputCls} placeholder="Department" value={candForm.department} onChange={(e) => setCandForm({ ...candForm, department: e.target.value })} />
            </div>
            <div className="mt-2">
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('candidates', candForm); setCandForm({ requisitionTitle: '', candidateName: '', candidateEmail: '', department: 'Engineering' }); })}>Add Candidate</button>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Pipeline: Applied → Screening → Interview → Offer → Hired</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Candidate</th><th className="py-1.5 pr-2">Requisition</th><th className="py-1.5 pr-2">Stage</th><th className="py-1.5 pr-2">Interview</th><th className="py-1.5">Actions</th>
                </tr></thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 pr-2"><div className="font-bold text-slate-900">{c.candidateName}</div><div className="text-slate-400 font-mono text-[10px]">{c.candidateEmail}</div></td>
                      <td className="py-2 pr-2 text-slate-600">{c.requisitionTitle} · {c.department}</td>
                      <td className="py-2 pr-2">
                        <select className={inputCls} value={c.stage ?? 'applied'} onChange={(e) => void refresh(async () => { await hrmsApi.update('candidates', c.id, { stage: e.target.value }); })}>
                          {['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2 text-slate-500 font-mono">{fmtDate(c.interviewDate)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button type="button" className={btnGhost} title="Schedule interview next week" onClick={() => void refresh(async () => { const d = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10); await hrmsApi.update('candidates', c.id, { stage: 'interview', interviewDate: d }); })}>Interview</button>
                          <button type="button" className={btnPrimary} title="Hire: create employee + onboarding checklist" disabled={c.stage === 'hired'} onClick={() => void refresh(async () => { await hrmsApi.convertCandidate(c.id); })}>Hire → Employee</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {candidates.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No candidates yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING — Module 3 */}
      {tab === 'onboarding' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Assign Onboarding Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select className={inputCls} value={onForm.employeeId} onChange={(e) => setOnForm({ ...onForm, employeeId: e.target.value })}>
                <option value="">Select employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <input className={inputCls} placeholder="Task title *" value={onForm.title} onChange={(e) => setOnForm({ ...onForm, title: e.target.value })} />
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('onboarding', { employeeId: Number(onForm.employeeId), title: onForm.title }); setOnForm({ employeeId: '', title: '' }); })}>Assign</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {employees.map((e) => {
              const tasks = onTasks.filter((t) => t.employeeId === e.id);
              if (!tasks.length) return null;
              const done = tasks.filter((t) => t.status === 'done').length;
              return (
                <div key={e.id} className={`${card} p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900">{e.fullName}</h3>
                    <span className="text-[11px] font-mono text-slate-500">{done}/{tasks.length} complete</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full mb-3"><div className="h-1.5 bg-[#19A7A0] rounded-full" style={{ width: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%` }} /></div>
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0">
                      <span className={t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}>{t.title} <span className="text-slate-400">· {t.assignee ?? 'HR Officer'}</span></span>
                      <button type="button" className={btnGhost} onClick={() => void refresh(async () => { await hrmsApi.update('onboarding', t.id, { status: t.status === 'done' ? 'todo' : 'done' }); })}>
                        {t.status === 'done' ? 'Reopen' : 'Complete'}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          {onTasks.length === 0 && <div className={`${card} p-6 text-center text-xs text-slate-400`}>No onboarding tasks. Hiring a candidate auto-creates the standard 5-item checklist.</div>}
        </div>
      )}

      {/* ATTENDANCE — Module 4 */}
      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Manual Timesheet Entry (web / mobile / manual)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <select className={inputCls} value={attForm.employeeId} onChange={(e) => setAttForm({ ...attForm, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <input type="date" className={inputCls} value={attForm.workDate} onChange={(e) => setAttForm({ ...attForm, workDate: e.target.value })} />
              <input className={inputCls} placeholder="In 08:00" value={attForm.clockIn} onChange={(e) => setAttForm({ ...attForm, clockIn: e.target.value })} />
              <input className={inputCls} placeholder="Out 16:30" value={attForm.clockOut} onChange={(e) => setAttForm({ ...attForm, clockOut: e.target.value })} />
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => {
                const [h1, m1] = attForm.clockIn.split(':').map(Number); const [h2, m2] = attForm.clockOut.split(':').map(Number);
                const h = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
                await hrmsApi.create('attendance', { employeeId: Number(attForm.employeeId), workDate: attForm.workDate, clockIn: attForm.clockIn, clockOut: attForm.clockOut, hoursWorked: h.toFixed(2), overtimeHours: Math.max(0, h - 8).toFixed(2) });
              })}>Log Day</button>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Recent Timesheets (overtime auto-calculated past 8h)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Employee</th><th className="py-1.5 pr-2">Date</th><th className="py-1.5 pr-2">In → Out</th><th className="py-1.5 pr-2">Hours</th><th className="py-1.5 pr-2">Overtime</th><th className="py-1.5">Flag</th>
                </tr></thead>
                <tbody>
                  {attendance.slice(0, 60).map((a) => (
                    <tr key={a.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 pr-2 font-semibold text-slate-800">{empName(a.employeeId)}</td>
                      <td className="py-2 pr-2 font-mono">{fmtDate(a.workDate)}</td>
                      <td className="py-2 pr-2 font-mono text-slate-600">{a.clockIn ?? '—'} → {a.clockOut ?? '—'}</td>
                      <td className="py-2 pr-2 font-mono">{num(a.hoursWorked).toFixed(2)}</td>
                      <td className="py-2 pr-2 font-mono text-orange-700">+{num(a.overtimeHours).toFixed(2)}</td>
                      <td className="py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">{a.flag ?? 'present'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No attendance records — use In/Out in Directory or log a day above.</p>}
            </div>
          </div>
        </div>
      )}

      {/* LEAVE — Module 5 */}
      {tab === 'leave' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Leave Types (configurable policy · Fiji defaults seeded)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {leaveTypes.map((t) => (
                <div key={t.id} className="border border-stone-200 rounded-lg p-2.5">
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{num(t.annualEntitlementDays)} days/yr · carry {num(t.carryForwardMaxDays)}{t.encashable ? ' · encashable' : ''}</div>
                </div>
              ))}
              {leaveTypes.length === 0 && <p className="text-xs text-slate-400">Leave types seed on first deploy migration.</p>}
            </div>
          </div>
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Request Leave</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <select className={inputCls} value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <select className={inputCls} value={leaveForm.leaveTypeId} onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}>
                <option value="">Type…</option>
                {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="date" className={inputCls} value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
              <input type="date" className={inputCls} value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
              <input className={inputCls} placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('leave-requests', { ...leaveForm, employeeId: Number(leaveForm.employeeId), leaveTypeId: Number(leaveForm.leaveTypeId) }); setLeaveForm({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', reason: '' }); })}>Submit</button>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Approvals &amp; Balances (entitlement − approved)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Employee</th><th className="py-1.5 pr-2">Type</th><th className="py-1.5 pr-2">Dates</th><th className="py-1.5 pr-2">Days</th><th className="py-1.5 pr-2">Balance Left</th><th className="py-1.5 pr-2">Status</th><th className="py-1.5">Actions</th>
                </tr></thead>
                <tbody>
                  {leaveReqs.map((r) => {
                    const lt = leaveTypes.find((t) => t.id === r.leaveTypeId);
                    const bal = num(lt?.annualEntitlementDays) - (leaveBalances[`${r.employeeId}:${r.leaveTypeId}`] ?? 0);
                    return (
                      <tr key={r.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-2 pr-2 font-semibold text-slate-800">{empName(r.employeeId)}</td>
                        <td className="py-2 pr-2 text-slate-600">{leaveTypeName(r.leaveTypeId)}</td>
                        <td className="py-2 pr-2 font-mono text-[11px]">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</td>
                        <td className="py-2 pr-2 font-mono">{num(r.daysRequested)}</td>
                        <td className="py-2 pr-2 font-mono text-slate-600">{bal.toFixed(1)}</td>
                        <td className="py-2 pr-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600 capitalize">{r.status}</span></td>
                        <td className="py-2">
                          {r.status === 'pending' ? (
                            <div className="flex gap-1">
                              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.update('leave-requests', r.id, { status: 'approved' }); })}>Approve</button>
                              <button type="button" className={btnGhost} onClick={() => void refresh(async () => { await hrmsApi.update('leave-requests', r.id, { status: 'rejected' }); })}>Reject</button>
                            </div>
                          ) : <span className="text-[11px] text-slate-400">decided</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {leaveReqs.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No leave requests yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE — Module 7 */}
      {tab === 'performance' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">New Review Cycle (goals + rating + development plan)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select className={inputCls} value={reviewForm.employeeId} onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <input className={inputCls} placeholder="Period e.g. H2 2026" value={reviewForm.reviewPeriod} onChange={(e) => setReviewForm({ ...reviewForm, reviewPeriod: e.target.value })} />
              <input className={inputCls} placeholder="Goals summary" value={reviewForm.goals} onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })} />
              <div className="flex gap-2">
                <select className={inputCls} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                </select>
                <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('reviews', { ...reviewForm, employeeId: Number(reviewForm.employeeId), rating: Number(reviewForm.rating) }); setReviewForm({ employeeId: '', reviewPeriod: 'H2 2026', goals: '', rating: '3' }); })}>Start</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className={`${card} p-4`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-900">{empName(r.employeeId)} · {r.reviewPeriod}</h3>
                  <span className="text-[11px] font-mono font-bold text-[#164B91]">★ {r.rating ?? 3}/5</span>
                </div>
                <p className="text-xs text-slate-600 mb-2"><strong>Goals:</strong> {r.goals || '—'}</p>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" className={`text-[11px] font-bold py-1 rounded-md border cursor-pointer ${num(r.rating) === n ? 'bg-[#164B91] text-white border-[#164B91]' : 'bg-white text-slate-500 border-stone-200'}`} onClick={() => void refresh(async () => { await hrmsApi.update('reviews', r.id, { rating: n }); })}>{n}</button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <select className={inputCls} value={r.status ?? 'draft'} onChange={(e) => void refresh(async () => { await hrmsApi.update('reviews', r.id, { status: e.target.value }); })}>
                    {['draft', 'in_progress', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="button" className={btnGhost} onClick={() => exportCsv(`review_${r.id}.csv`, [{ employee: empName(r.employeeId), period: r.reviewPeriod, goals: r.goals, rating: r.rating, status: r.status }])}>Export</button>
                </div>
              </div>
            ))}
          </div>
          {reviews.length === 0 && <div className={`${card} p-6 text-center text-xs text-slate-400`}>No review cycles yet.</div>}
        </div>
      )}

      {/* TRAINING — Module 8 */}
      {tab === 'training' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Training Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input className={inputCls} placeholder="Course title *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              <input className={inputCls} placeholder="Provider" value={courseForm.provider} onChange={(e) => setCourseForm({ ...courseForm, provider: e.target.value })} />
              <input className={inputCls} placeholder="Category" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} />
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('courses', courseForm); setCourseForm({ title: '', provider: 'Internal', category: 'compliance' }); })}>Add Course</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {courses.map((c) => (
                <div key={c.id} className="border border-stone-200 rounded-lg p-2.5">
                  <div className="text-xs font-bold text-slate-900">{c.title}</div>
                  <div className="text-[11px] text-slate-500">{c.provider} · {num(c.durationHours)}h{c.expiryMonths ? ` · renews ${c.expiryMonths}mo` : ''}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Assignments &amp; Completion Certificates</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <select className={inputCls} value={assignForm.courseId} onChange={(e) => setAssignForm({ ...assignForm, courseId: e.target.value })}>
                <option value="">Course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select className={inputCls} value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <input type="date" className={inputCls} value={assignForm.assignedDate} onChange={(e) => setAssignForm({ ...assignForm, assignedDate: e.target.value })} />
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('assignments', { ...assignForm, courseId: Number(assignForm.courseId), employeeId: Number(assignForm.employeeId) }); })}>Assign</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Course</th><th className="py-1.5 pr-2">Employee</th><th className="py-1.5 pr-2">Due</th><th className="py-1.5 pr-2">Status</th><th className="py-1.5">Action</th>
                </tr></thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 pr-2 font-semibold text-slate-800">{courseName(a.courseId)}</td>
                      <td className="py-2 pr-2 text-slate-600">{empName(a.employeeId)}</td>
                      <td className="py-2 pr-2 font-mono">{fmtDate(a.dueDate)}</td>
                      <td className="py-2 pr-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600 capitalize">{a.status}</span></td>
                      <td className="py-2">
                        {a.status !== 'completed'
                          ? <button type="button" className={btnGhost} onClick={() => void refresh(async () => { await hrmsApi.update('assignments', a.id, { status: 'completed' }); })}>Mark Complete</button>
                          : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Certified {fmtDate(a.completedDate)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assignments.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No assignments yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* OFFBOARDING — Module 9 */}
      {tab === 'offboarding' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Initiate Exit (resignation / termination)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select className={inputCls} value={offForm.employeeId} onChange={(e) => setOffForm({ ...offForm, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.filter((e) => e.status !== 'terminated').map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <input type="date" className={inputCls} value={offForm.initiatedDate} onChange={(e) => setOffForm({ ...offForm, initiatedDate: e.target.value })} />
              <select className={inputCls} value={offForm.reason} onChange={(e) => setOffForm({ ...offForm, reason: e.target.value })}>
                {['resignation', 'termination', 'contract_end', 'redundancy'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" className={btnPrimary} onClick={() => void refresh(async () => { await hrmsApi.create('offboarding', { ...offForm, employeeId: Number(offForm.employeeId) }); })}>Initiate</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {offboards.map((o) => (
              <div key={o.id} className={`${card} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900">{empName(o.employeeId)} · {o.reason}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600 capitalize">{o.status}</span>
                </div>
                {(['assetsRecovered', 'accessRevoked'] as const).map((flag) => (
                  <label key={flag} className="flex items-center gap-2 text-xs text-slate-600 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(o[flag])}
                      onChange={() => void refresh(async () => { await hrmsApi.update('offboarding', o.id, { [flag]: !o[flag] }); })}
                    />
                    {flag === 'assetsRecovered' ? 'Assets recovered (laptop, keys, docs)' : 'System access revoked'}
                  </label>
                ))}
                <div className="flex gap-1.5 mt-2">
                  <select className={inputCls} value={o.status ?? 'initiated'} onChange={(e) => void refresh(async () => { await hrmsApi.update('offboarding', o.id, { status: e.target.value }); })}>
                    {['initiated', 'in_progress', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Completing auto-transitions the employee to Terminated (archived, payroll-excluded). Settlement FJD {num(o.finalSettlementFjd).toFixed(2)}.</p>
              </div>
            ))}
          </div>
          {offboards.length === 0 && <div className={`${card} p-6 text-center text-xs text-slate-400`}>No exits in progress.</div>}
        </div>
      )}

      {/* AUDIT & REPORTS — Module 10 */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Role-Based Access (basic scope)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200">
                  <th className="py-1.5 pr-2">Role</th><th className="py-1.5">Access</th>
                </tr></thead>
                <tbody>
                  {[
                    ['Super Admin / HR Admin', 'Full configuration, user management, all records'],
                    ['HR Officer', 'Directory, recruitment, onboarding, leave, reports'],
                    ['Manager', 'Team attendance, leave approvals, performance reviews'],
                    ['Employee (self-service)', 'Own profile, leave requests, payslips, goals, training'],
                    ['Finance / Payroll', 'Payroll execution (Bookkeeping), statutory reports, bank files'],
                  ].map(([r, a]) => (
                    <tr key={r} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 pr-2 font-bold text-slate-800">{r}</td>
                      <td className="py-2 text-slate-600">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900">Immutable Audit Log ({auditRows.length})</h3>
              <button type="button" className={btnGhost} onClick={() => exportCsv('hrms_audit_log.csv', auditRows as unknown as Array<Record<string, unknown>>)}>
                <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export CSV</span>
              </button>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-stone-200 sticky top-0 bg-white">
                  <th className="py-1.5 pr-2">When</th><th className="py-1.5 pr-2">Action</th><th className="py-1.5 pr-2">Entity</th><th className="py-1.5">Details</th>
                </tr></thead>
                <tbody>
                  {auditRows.slice(0, 200).map((a) => (
                    <tr key={a.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-1.5 pr-2 font-mono text-[11px] text-slate-500">{a.createdAt ? String(a.createdAt).slice(0, 16).replace('T', ' ') : '—'}</td>
                      <td className="py-1.5 pr-2 font-semibold text-slate-700">{a.action}</td>
                      <td className="py-1.5 pr-2 text-slate-500 font-mono text-[11px]">{a.entityType} #{a.entityId}</td>
                      <td className="py-1.5 text-slate-600">{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditRows.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No audit entries yet — every HRMS write is logged here.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRMS;

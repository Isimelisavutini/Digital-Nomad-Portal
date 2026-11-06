export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    probation: 'bg-amber-100 text-amber-800',
    on_leave: 'bg-sky-100 text-sky-800',
    suspended: 'bg-orange-100 text-orange-800',
    terminated: 'bg-slate-200 text-slate-600',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-600',
    present: 'bg-emerald-100 text-emerald-800',
    late: 'bg-amber-100 text-amber-800',
    absent: 'bg-red-100 text-red-800',
    half_day: 'bg-sky-100 text-sky-800',
    holiday: 'bg-violet-100 text-violet-800',
    applied: 'bg-slate-100 text-slate-700',
    screening: 'bg-sky-100 text-sky-800',
    interview: 'bg-violet-100 text-violet-800',
    offer: 'bg-emerald-100 text-emerald-800',
    hired: 'bg-emerald-200 text-emerald-900',
    open: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-slate-100 text-slate-600',
    on_hold: 'bg-amber-100 text-amber-800',
    draft: 'bg-slate-100 text-slate-600',
    processed: 'bg-sky-100 text-sky-800',
    paid: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-sky-100 text-sky-800',
    not_started: 'bg-slate-100 text-slate-600',
    assigned: 'bg-slate-100 text-slate-700',
    overdue: 'bg-red-100 text-red-800',
    full_time: 'bg-brand-100 text-brand-800',
    part_time: 'bg-violet-100 text-violet-800',
    contract: 'bg-amber-100 text-amber-800',
    intern: 'bg-pink-100 text-pink-800',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function labelize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

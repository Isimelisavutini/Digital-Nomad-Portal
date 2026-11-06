// Typed REST client for the HRMS Netlify Function (GET/POST/PATCH/DELETE).
// Falls back to bundled seed data when the API is unreachable (e.g. static preview).

export type HrmsStatus = string;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `HRMS request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export const hrmsApi = {
  overview: () =>
    request<{
      employees: number;
      candidates: number;
      pendingLeave: number;
      openOnboarding: number;
      activeOffboarding: number;
      headcountByStatus: Array<{ status: string; count: number }>;
      leaveByStatus: Array<{ status: string; count: number }>;
    }>(`/api/hrms/overview`),

  list: <T>(resource: string, query = "") =>
    request<T[]>(`/api/hrms/${resource}${query}`),

  get: <T>(resource: string, id: number | string) =>
    request<T>(`/api/hrms/${resource}/${id}`),

  create: <T>(resource: string, body: Record<string, unknown>) =>
    request<T>(`/api/hrms/${resource}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: <T>(resource: string, id: number | string, body: Record<string, unknown>) =>
    request<T>(`/api/hrms/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (resource: string, id: number | string) =>
    request<{ ok: boolean }>(`/api/hrms/${resource}/${id}`, {
      method: "DELETE",
    }),

  convertCandidate: (id: number | string) =>
    request<{
      id: number;
      fullName: string;
      email: string;
    }>(`/api/hrms/candidates/${id}/convert`, { method: "POST", body: "{}" }),

  clock: (employeeId: number, mode: "in" | "out") =>
    request<Record<string, unknown>>(`/api/hrms/attendance/clock`, {
      method: "POST",
      body: JSON.stringify({ employeeId, mode }),
    }),
};

export const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  return String(d).slice(0, 10);
};

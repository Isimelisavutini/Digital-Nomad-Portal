import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import {
  hrmsEmployees,
  hrmsCandidates,
  hrmsOnboardingTasks,
  hrmsAttendance,
  hrmsLeaveTypes,
  hrmsLeaveRequests,
  hrmsPerformanceReviews,
  hrmsTrainingCourses,
  hrmsTrainingAssignments,
  hrmsOffboardingChecklists,
  hrmsAuditLogs,
} from "../../db/schema.js";
import { eq, desc, and, count } from "drizzle-orm";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const bad = (message: string, status = 400) => json({ error: message }, status);

async function audit(
  action: string,
  entityType: string,
  entityId: string,
  details: string
) {
  try {
    await db.insert(hrmsAuditLogs).values({
      action,
      entityType,
      entityId: String(entityId ?? ""),
      details: String(details ?? "").slice(0, 2000),
    });
  } catch {
    // audit must never break the primary write
  }
}

async function overview() {
  const tableCount = async (table: never) => {
    try {
      const rows = await db.select({ c: count() }).from(table);
      return Number(rows?.[0]?.c ?? 0);
    } catch {
      return 0;
    }
  };
  const [employees, candidates, pendingLeave, openOnboarding, activeOffboarding] =
    await Promise.all([
      tableCount(hrmsEmployees as never),
      tableCount(hrmsCandidates as never),
      (async () => {
        try {
          const rows = await db
            .select({ c: count() })
            .from(hrmsLeaveRequests)
            .where(eq(hrmsLeaveRequests.status, "pending"));
          return Number(rows?.[0]?.c ?? 0);
        } catch {
          return 0;
        }
      })(),
      (async () => {
        try {
          const all = await db.select({ id: hrmsOnboardingTasks.id, status: hrmsOnboardingTasks.status }).from(hrmsOnboardingTasks).limit(5000);
          return all.filter((t) => t.status !== "done").length;
        } catch {
          return 0;
        }
      })(),
      (async () => {
        try {
          const all = await db.select({ id: hrmsOffboardingChecklists.id, status: hrmsOffboardingChecklists.status }).from(hrmsOffboardingChecklists).limit(1000);
          return all.filter((t) => t.status !== "completed").length;
        } catch {
          return 0;
        }
      })(),
    ]);

  let headcountByStatus: Array<{ status: string; count: number }> = [];
  let leaveByStatus: Array<{ status: string; count: number }> = [];
  try {
    headcountByStatus = await db
      .select({ status: hrmsEmployees.status, count: count() })
      .from(hrmsEmployees)
      .groupBy(hrmsEmployees.status);
  } catch {
    headcountByStatus = [];
  }
  try {
    leaveByStatus = await db
      .select({ status: hrmsLeaveRequests.status, count: count() })
      .from(hrmsLeaveRequests)
      .groupBy(hrmsLeaveRequests.status);
  } catch {
    leaveByStatus = [];
  }

  return json({
    employees,
    candidates,
    pendingLeave,
    openOnboarding,
    activeOffboarding,
    headcountByStatus,
    leaveByStatus,
  });
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  // path is /api/hrms/<resource>[/<id>[/<action>]] thanks to config below
  const segs = url.pathname.replace(/^\/api\/hrms\/?/, "").split("/").filter(Boolean);
  const [resource, id, action] = segs;
  const method = req.method.toUpperCase();

  try {
    if (!resource || resource === "overview") {
      if (method !== "GET") return bad("Method not allowed", 405);
      return overview();
    }

    // ---------- READ ----------
    if (method === "GET") {
      const limit = Math.min(
        Number(url.searchParams.get("limit") ?? "200") || 200,
        500
      );
      const orderById = (t: { id: unknown }) =>
        db
          .select()
          .from(t as never)
          .orderBy(desc((t as { id: { [k: string]: unknown } }).id as never))
          .limit(limit);

      switch (resource) {
        case "employees": {
          if (id) {
            const rows = await db
              .select()
              .from(hrmsEmployees)
              .where(eq(hrmsEmployees.id, Number(id)));
            return json(rows[0] ?? null);
          }
          const status = url.searchParams.get("status");
          if (status) {
            return json(
              await db
                .select()
                .from(hrmsEmployees)
                .where(eq(hrmsEmployees.status, status as never))
                .limit(limit)
            );
          }
          return json(await orderById(hrmsEmployees));
        }
        case "candidates": {
          if (id) {
            const rows = await db
              .select()
              .from(hrmsCandidates)
              .where(eq(hrmsCandidates.id, Number(id)));
            return json(rows[0] ?? null);
          }
          const stage = url.searchParams.get("stage");
          if (stage) {
            return json(
              await db
                .select()
                .from(hrmsCandidates)
                .where(eq(hrmsCandidates.stage, stage as never))
                .limit(limit)
            );
          }
          return json(await orderById(hrmsCandidates));
        }
        case "onboarding": {
          const employeeId = url.searchParams.get("employeeId");
          if (employeeId) {
            return json(
              await db
                .select()
                .from(hrmsOnboardingTasks)
                .where(eq(hrmsOnboardingTasks.employeeId, Number(employeeId)))
                .limit(limit)
            );
          }
          return json(await orderById(hrmsOnboardingTasks));
        }
        case "attendance": {
          const employeeId = url.searchParams.get("employeeId");
          if (employeeId) {
            return json(
              await db
                .select()
                .from(hrmsAttendance)
                .where(eq(hrmsAttendance.employeeId, Number(employeeId)))
                .orderBy(desc(hrmsAttendance.workDate))
                .limit(limit)
            );
          }
          return json(
            await db
              .select()
              .from(hrmsAttendance)
              .orderBy(desc(hrmsAttendance.workDate))
              .limit(limit)
          );
        }
        case "leave-types":
          return json(await db.select().from(hrmsLeaveTypes));
        case "leave-requests": {
          const employeeId = url.searchParams.get("employeeId");
          const status = url.searchParams.get("status");
          const conds = [];
          if (employeeId)
            conds.push(eq(hrmsLeaveRequests.employeeId, Number(employeeId)));
          if (status)
            conds.push(eq(hrmsLeaveRequests.status, status as never));
          if (conds.length) {
            return json(
              await db
                .select()
                .from(hrmsLeaveRequests)
                .where(conds.length === 1 ? conds[0] : and(...conds))
                .orderBy(desc(hrmsLeaveRequests.id))
                .limit(limit)
            );
          }
          return json(await orderById(hrmsLeaveRequests));
        }
        case "reviews": {
          const employeeId = url.searchParams.get("employeeId");
          if (employeeId) {
            return json(
              await db
                .select()
                .from(hrmsPerformanceReviews)
                .where(eq(hrmsPerformanceReviews.employeeId, Number(employeeId)))
                .limit(limit)
            );
          }
          return json(await orderById(hrmsPerformanceReviews));
        }
        case "courses":
          return json(await db.select().from(hrmsTrainingCourses).limit(limit));
        case "assignments": {
          const employeeId = url.searchParams.get("employeeId");
          if (employeeId) {
            return json(
              await db
                .select()
                .from(hrmsTrainingAssignments)
                .where(
                  eq(hrmsTrainingAssignments.employeeId, Number(employeeId))
                )
                .limit(limit)
            );
          }
          return json(await orderById(hrmsTrainingAssignments));
        }
        case "offboarding": {
          const employeeId = url.searchParams.get("employeeId");
          if (employeeId) {
            return json(
              await db
                .select()
                .from(hrmsOffboardingChecklists)
                .where(
                  eq(hrmsOffboardingChecklists.employeeId, Number(employeeId))
                )
                .limit(limit)
            );
          }
          return json(await orderById(hrmsOffboardingChecklists));
        }
        case "audit":
          return json(await orderById(hrmsAuditLogs));
        default:
          return bad(`Unknown resource: ${resource}`, 404);
      }
    }

    // ---------- CREATE ----------
    if (method === "POST") {
      const body = await req.json().catch(() => ({}));

      // Candidate -> employee conversion (one-click onboarding handoff)
      if (resource === "candidates" && id && action === "convert") {
        const rows = await db
          .select()
          .from(hrmsCandidates)
          .where(eq(hrmsCandidates.id, Number(id)));
        const cand = rows[0];
        if (!cand) return bad("Candidate not found", 404);
        const [emp] = await db
          .insert(hrmsEmployees)
          .values({
            fullName: cand.candidateName,
            email: cand.candidateEmail,
            phone: cand.candidatePhone ?? null,
            department: cand.department ?? "General",
            position: cand.requisitionTitle ?? "Team Member",
            joinDate: new Date().toISOString().slice(0, 10),
            status: "probation",
            grossPayFjd: String(cand.offerAmountFjd ?? "0"),
          })
          .returning();
        await db
          .update(hrmsCandidates)
          .set({ stage: "hired", convertedEmployeeId: emp.id })
          .where(eq(hrmsCandidates.id, Number(id)));
        // seed a standard onboarding checklist
        const today = new Date().toISOString().slice(0, 10);
        const seeds = [
          "Sign employment contract",
          "Collect tax (TIN) & FNPF details",
          "Collect bank account details",
          "Issue equipment & system access",
          "Role induction with manager",
        ];
        for (const title of seeds) {
          await db.insert(hrmsOnboardingTasks).values({
            employeeId: emp.id,
            title,
            dueDate: today,
          });
        }
        await audit("convert_candidate", "candidate", String(id), `Hired as employee #${emp.id}`);
        return json(emp, 201);
      }

      // Clock in/out upsert: same employee + date shares one row
      if (resource === "attendance" && action === "clock") {
        const { employeeId, mode } = body as {
          employeeId: number;
          mode: "in" | "out";
        };
        if (!employeeId) return bad("employeeId is required");
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toTimeString().slice(0, 5);
        const existing = await db
          .select()
          .from(hrmsAttendance)
          .where(
            and(
              eq(hrmsAttendance.employeeId, Number(employeeId)),
              eq(hrmsAttendance.workDate, today)
            )
          );
        if (!existing.length) {
          if (mode === "out") return bad("No clock-in record for today");
          const [row] = await db
            .insert(hrmsAttendance)
            .values({
              employeeId: Number(employeeId),
              workDate: today,
              clockIn: now,
              flag: "present",
              source: "web",
            })
            .returning();
          await audit("clock_in", "attendance", String(row.id), `Employee #${employeeId} clocked in ${now}`);
          return json(row, 201);
        }
        const rec = existing[0];
        if (mode === "in") return json(rec);
        const [h1, m1] = String(rec.clockIn ?? "09:00").split(":").map(Number);
        const [h2, m2] = now.split(":").map(Number);
        const hours = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
        const [updated] = await db
          .update(hrmsAttendance)
          .set({
            clockOut: now,
            hoursWorked: hours.toFixed(2),
            overtimeHours: Math.max(0, hours - 8).toFixed(2),
            flag: hours <= 0 ? "absent" : rec.flag,
          })
          .where(eq(hrmsAttendance.id, rec.id))
          .returning();
        await audit("clock_out", "attendance", String(rec.id), `Employee #${employeeId} clocked out ${now}`);
        return json(updated);
      }

      const clean = (v: unknown) => (v === "" ? null : (v as never));
      switch (resource) {
        case "employees": {
          if (!body.fullName || !body.email)
            return bad("fullName and email are required");
          const [row] = await db
            .insert(hrmsEmployees)
            .values({
              fullName: body.fullName,
              preferredName: clean(body.preferredName),
              email: body.email,
              phone: clean(body.phone),
              dateOfBirth: clean(body.dateOfBirth),
              address: clean(body.address),
              emergencyContactName: clean(body.emergencyContactName),
              emergencyContactPhone: clean(body.emergencyContactPhone),
              department: body.department ?? "General",
              position: body.position ?? "Team Member",
              managerId: body.managerId ? Number(body.managerId) : null,
              joinDate: body.joinDate ?? new Date().toISOString().slice(0, 10),
              employmentType: body.employmentType ?? "full_time",
              contractEndDate: clean(body.contractEndDate),
              tinNumber: clean(body.tinNumber),
              fnpfNumber: clean(body.fnpfNumber),
              bankName: clean(body.bankName),
              bankAccountNumber: clean(body.bankAccountNumber),
              grossPayFjd: String(body.grossPayFjd ?? "0"),
              payType: body.payType ?? "monthly",
              status: body.status ?? "active",
              tags: body.tags ?? "",
            })
            .returning();
          await audit("create_employee", "employee", String(row.id), row.fullName);
          return json(row, 201);
        }
        case "candidates": {
          if (!body.requisitionTitle || !body.candidateName || !body.candidateEmail)
            return bad("requisitionTitle, candidateName and candidateEmail are required");
          const [row] = await db
            .insert(hrmsCandidates)
            .values({
              requisitionTitle: body.requisitionTitle,
              department: body.department ?? "General",
              candidateName: body.candidateName,
              candidateEmail: body.candidateEmail,
              candidatePhone: clean(body.candidatePhone),
              resumeSummary: clean(body.resumeSummary),
              source: body.source ?? "referral",
              stage: body.stage ?? "applied",
              interviewDate: clean(body.interviewDate),
              interviewNotes: clean(body.interviewNotes),
              offerAmountFjd: body.offerAmountFjd
                ? String(body.offerAmountFjd)
                : null,
            })
            .returning();
          await audit("create_candidate", "candidate", String(row.id), row.candidateName);
          return json(row, 201);
        }
        case "onboarding": {
          if (!body.employeeId || !body.title)
            return bad("employeeId and title are required");
          const [row] = await db
            .insert(hrmsOnboardingTasks)
            .values({
              employeeId: Number(body.employeeId),
              title: body.title,
              category: body.category ?? "documents",
              assignee: body.assignee ?? "HR Officer",
              dueDate: clean(body.dueDate),
              notes: clean(body.notes),
            })
            .returning();
          await audit("create_onboarding_task", "onboarding", String(row.id), row.title);
          return json(row, 201);
        }
        case "attendance": {
          if (!body.employeeId || !body.workDate)
            return bad("employeeId and workDate are required");
          const [row] = await db
            .insert(hrmsAttendance)
            .values({
              employeeId: Number(body.employeeId),
              workDate: body.workDate,
              clockIn: clean(body.clockIn),
              clockOut: clean(body.clockOut),
              hoursWorked: String(body.hoursWorked ?? "0"),
              overtimeHours: String(body.overtimeHours ?? "0"),
              shift: body.shift ?? "day",
              flag: body.flag ?? "present",
              source: body.source ?? "web",
              notes: clean(body.notes),
            })
            .returning();
          await audit("create_attendance", "attendance", String(row.id), `Employee #${body.employeeId} ${body.workDate}`);
          return json(row, 201);
        }
        case "leave-requests": {
          if (!body.employeeId || !body.leaveTypeId || !body.startDate || !body.endDate)
            return bad("employeeId, leaveTypeId, startDate and endDate are required");
          const days =
            Number(body.daysRequested) ||
            Math.max(
              1,
              Math.round(
                (new Date(body.endDate).getTime() -
                  new Date(body.startDate).getTime()) /
                  86400000
              ) + 1
            );
          const [row] = await db
            .insert(hrmsLeaveRequests)
            .values({
              employeeId: Number(body.employeeId),
              leaveTypeId: Number(body.leaveTypeId),
              startDate: body.startDate,
              endDate: body.endDate,
              daysRequested: String(days),
              reason: clean(body.reason),
              approver: body.approver ?? "Direct Manager",
            })
            .returning();
          await audit("create_leave_request", "leave", String(row.id), `Employee #${body.employeeId} ${days}d`);
          return json(row, 201);
        }
        case "reviews": {
          if (!body.employeeId || !body.reviewPeriod)
            return bad("employeeId and reviewPeriod are required");
          const [row] = await db
            .insert(hrmsPerformanceReviews)
            .values({
              employeeId: Number(body.employeeId),
              reviewPeriod: body.reviewPeriod,
              goals: body.goals ?? "",
              selfAssessment: clean(body.selfAssessment),
              managerFeedback: clean(body.managerFeedback),
              rating: Number(body.rating ?? 3),
              developmentPlan: clean(body.developmentPlan),
              status: body.status ?? "draft",
            })
            .returning();
          await audit("create_review", "review", String(row.id), body.reviewPeriod);
          return json(row, 201);
        }
        case "courses": {
          if (!body.title) return bad("title is required");
          const [row] = await db
            .insert(hrmsTrainingCourses)
            .values({
              title: body.title,
              provider: body.provider ?? "Internal",
              category: body.category ?? "compliance",
              durationHours: String(body.durationHours ?? "2"),
              expiryMonths: body.expiryMonths
                ? Number(body.expiryMonths)
                : null,
              certificateIssued: body.certificateIssued ?? true,
            })
            .returning();
          await audit("create_course", "course", String(row.id), row.title);
          return json(row, 201);
        }
        case "assignments": {
          if (!body.courseId || !body.employeeId || !body.assignedDate)
            return bad("courseId, employeeId and assignedDate are required");
          const [row] = await db
            .insert(hrmsTrainingAssignments)
            .values({
              courseId: Number(body.courseId),
              employeeId: Number(body.employeeId),
              assignedDate: body.assignedDate,
              dueDate: clean(body.dueDate),
              status: body.status ?? "assigned",
            })
            .returning();
          await audit("assign_training", "assignment", String(row.id), `Course #${body.courseId} -> employee #${body.employeeId}`);
          return json(row, 201);
        }
        case "offboarding": {
          if (!body.employeeId || !body.initiatedDate)
            return bad("employeeId and initiatedDate are required");
          const [row] = await db
            .insert(hrmsOffboardingChecklists)
            .values({
              employeeId: Number(body.employeeId),
              initiatedDate: body.initiatedDate,
              lastWorkingDate: clean(body.lastWorkingDate),
              reason: body.reason ?? "resignation",
              exitInterviewNotes: clean(body.exitInterviewNotes),
              finalSettlementFjd: String(body.finalSettlementFjd ?? "0"),
            })
            .returning();
          await audit("initiate_offboarding", "offboarding", String(row.id), `Employee #${body.employeeId}`);
          return json(row, 201);
        }
        default:
          return bad(`Unknown resource: ${resource}`, 404);
      }
    }

    // ---------- UPDATE ----------
    if (method === "PATCH" || method === "PUT") {
      if (!id) return bad("id is required");
      const body = await req.json().catch(() => ({}));
      const numId = Number(id);
      const touch = { updatedAt: new Date() };

      const patchMap: Record<string, () => Promise<unknown>> = {
        employees: async () => {
          const allowed = [
            "fullName", "preferredName", "email", "phone", "dateOfBirth",
            "address", "emergencyContactName", "emergencyContactPhone",
            "department", "position", "employmentType", "contractEndDate",
            "tinNumber", "fnpfNumber", "bankName", "bankAccountNumber",
            "payType", "status", "terminationDate", "terminationReason", "tags",
          ];
          const patch: Record<string, unknown> = { ...touch };
          for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k] === "" ? null : body[k];
          if (body.managerId !== undefined)
            patch.managerId = body.managerId ? Number(body.managerId) : null;
          if (body.joinDate !== undefined) patch.joinDate = body.joinDate;
          if (body.grossPayFjd !== undefined)
            patch.grossPayFjd = String(body.grossPayFjd);
          const [row] = await db.update(hrmsEmployees).set(patch as never).where(eq(hrmsEmployees.id, numId)).returning();
          if (body.status === "terminated") {
            await db.update(hrmsEmployees).set({ terminationDate: new Date().toISOString().slice(0, 10) } as never).where(eq(hrmsEmployees.id, numId));
          }
          return row;
        },
        candidates: async () => {
          const [row] = await db.update(hrmsCandidates).set({ ...body, ...touch } as never).where(eq(hrmsCandidates.id, numId)).returning();
          return row;
        },
        onboarding: async () => {
          const patch: Record<string, unknown> = {};
          for (const k of ["title", "category", "assignee", "dueDate", "status", "notes"])
            if (body[k] !== undefined) patch[k] = body[k] === "" ? null : body[k];
          if (body.status === "done") patch.completedAt = new Date();
          const [row] = await db.update(hrmsOnboardingTasks).set(patch as never).where(eq(hrmsOnboardingTasks.id, numId)).returning();
          return row;
        },
        attendance: async () => {
          const [row] = await db.update(hrmsAttendance).set(body as never).where(eq(hrmsAttendance.id, numId)).returning();
          return row;
        },
        "leave-requests": async () => {
          const patch: Record<string, unknown> = {};
          for (const k of ["startDate", "endDate", "daysRequested", "reason", "status", "approver"])
            if (body[k] !== undefined) patch[k] = body[k];
          if (body.status === "approved" || body.status === "rejected")
            patch.decidedAt = new Date();
          const [row] = await db.update(hrmsLeaveRequests).set(patch as never).where(eq(hrmsLeaveRequests.id, numId)).returning();
          return row;
        },
        reviews: async () => {
          const [row] = await db.update(hrmsPerformanceReviews).set({ ...body, ...touch } as never).where(eq(hrmsPerformanceReviews.id, numId)).returning();
          return row;
        },
        courses: async () => {
          const [row] = await db.update(hrmsTrainingCourses).set(body as never).where(eq(hrmsTrainingCourses.id, numId)).returning();
          return row;
        },
        assignments: async () => {
          const patch: Record<string, unknown> = { ...body };
          if (body.status === "completed" && !body.completedDate)
            patch.completedDate = new Date().toISOString().slice(0, 10);
          const [row] = await db.update(hrmsTrainingAssignments).set(patch as never).where(eq(hrmsTrainingAssignments.id, numId)).returning();
          return row;
        },
        offboarding: async () => {
          const [row] = await db.update(hrmsOffboardingChecklists).set({ ...body, ...touch } as never).where(eq(hrmsOffboardingChecklists.id, numId)).returning();
          if (body.status === "completed" && row) {
            await db.update(hrmsEmployees).set({ status: "terminated" } as never).where(eq(hrmsEmployees.id, (row as { employeeId: number }).employeeId));
          }
          return row;
        },
      };

      const handler = patchMap[resource];
      if (!handler) return bad(`Unknown resource: ${resource}`, 404);
      const row = await handler();
      if (!row) return bad("Not found", 404);
      await audit(`update_${resource}`, resource, String(id), `${method} ${resource}/${id}`);
      return json(row);
    }

    // ---------- DELETE ----------
    if (method === "DELETE") {
      if (!id) return bad("id is required");
      const numId = Number(id);
      const delMap: Record<string, () => Promise<void>> = {
        employees: async () => { await db.delete(hrmsEmployees).where(eq(hrmsEmployees.id, numId)); },
        candidates: async () => { await db.delete(hrmsCandidates).where(eq(hrmsCandidates.id, numId)); },
        onboarding: async () => { await db.delete(hrmsOnboardingTasks).where(eq(hrmsOnboardingTasks.id, numId)); },
        attendance: async () => { await db.delete(hrmsAttendance).where(eq(hrmsAttendance.id, numId)); },
        "leave-requests": async () => { await db.delete(hrmsLeaveRequests).where(eq(hrmsLeaveRequests.id, numId)); },
        reviews: async () => { await db.delete(hrmsPerformanceReviews).where(eq(hrmsPerformanceReviews.id, numId)); },
        courses: async () => { await db.delete(hrmsTrainingCourses).where(eq(hrmsTrainingCourses.id, numId)); },
        assignments: async () => { await db.delete(hrmsTrainingAssignments).where(eq(hrmsTrainingAssignments.id, numId)); },
        offboarding: async () => { await db.delete(hrmsOffboardingChecklists).where(eq(hrmsOffboardingChecklists.id, numId)); },
      };
      const handler = delMap[resource];
      if (!handler) return bad(`Unknown resource: ${resource}`, 404);
      await handler();
      await audit(`delete_${resource}`, resource, String(id), `Deleted ${resource}/${id}`);
      return json({ ok: true });
    }

    return bad("Method not allowed", 405);
  } catch (e) {
    console.error("hrms function error:", e);
    return json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
};

export const config: Config = {
  path: "/api/hrms/:resource?/:id?/:action?",
};

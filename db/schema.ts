import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---- Enums (stored as text with app-level validation; pg enums for key lifecycles) ----
export const employeeStatusEnum = pgEnum("hrms_employee_status", [
  "active",
  "probation",
  "on_leave",
  "suspended",
  "terminated",
]);

export const candidateStageEnum = pgEnum("hrms_candidate_stage", [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
]);

export const leaveRequestStatusEnum = pgEnum("hrms_leave_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("hrms_task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const reviewStatusEnum = pgEnum("hrms_review_status", [
  "draft",
  "in_progress",
  "completed",
]);

export const assignmentStatusEnum = pgEnum("hrms_assignment_status", [
  "assigned",
  "in_progress",
  "completed",
  "expired",
]);

export const offboardingStatusEnum = pgEnum("hrms_offboarding_status", [
  "initiated",
  "in_progress",
  "completed",
]);

// ---- Module 1: Employee Information Management (Core) ----
export const hrmsEmployees = pgTable("hrms_employees", {
  id: serial().primaryKey(),
  fullName: text("full_name").notNull(),
  preferredName: text("preferred_name"),
  email: text().notNull().unique(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  department: text().notNull().default("General"),
  position: text().notNull().default("Team Member"),
  managerId: integer("manager_id"),
  joinDate: date("join_date").notNull().default("2026-01-01"),
  employmentType: text("employment_type").notNull().default("full_time"),
  contractEndDate: date("contract_end_date"),
  tinNumber: text("tin_number"),
  fnpfNumber: text("fnpf_number"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  grossPayFjd: numeric("gross_pay_fjd", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  payType: text("pay_type").notNull().default("monthly"),
  status: employeeStatusEnum().notNull().default("active"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  tags: text("tags").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- Module 2: Recruitment / ATS ----
export const hrmsCandidates = pgTable("hrms_candidates", {
  id: serial().primaryKey(),
  requisitionTitle: text("requisition_title").notNull(),
  department: text().notNull().default("General"),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidatePhone: text("candidate_phone"),
  resumeSummary: text("resume_summary"),
  source: text().notNull().default("referral"),
  stage: candidateStageEnum().notNull().default("applied"),
  interviewDate: date("interview_date"),
  interviewNotes: text("interview_notes"),
  offerAmountFjd: numeric("offer_amount_fjd", { precision: 12, scale: 2 }),
  convertedEmployeeId: integer("converted_employee_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- Module 3: Onboarding ----
export const hrmsOnboardingTasks = pgTable("hrms_onboarding_tasks", {
  id: serial().primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  title: text().notNull(),
  category: text().notNull().default("documents"),
  assignee: text().notNull().default("HR Officer"),
  dueDate: date("due_date"),
  status: taskStatusEnum().notNull().default("todo"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- Module 4: Attendance & Time Tracking ----
export const hrmsAttendance = pgTable("hrms_attendance", {
  id: serial().primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  workDate: date("work_date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }).default("0"),
  overtimeHours: numeric("overtime_hours", { precision: 5, scale: 2 }).default(
    "0"
  ),
  shift: text().notNull().default("day"),
  flag: text().notNull().default("present"),
  source: text().notNull().default("web"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- Module 5: Leave Management ----
export const hrmsLeaveTypes = pgTable("hrms_leave_types", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  annualEntitlementDays: numeric("annual_entitlement_days", {
    precision: 5,
    scale: 1,
  })
    .notNull()
    .default("0"),
  carryForwardMaxDays: numeric("carry_forward_max_days", {
    precision: 5,
    scale: 1,
  })
    .notNull()
    .default("0"),
  encashable: boolean().notNull().default(false),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  active: boolean().notNull().default(true),
});

export const hrmsLeaveRequests = pgTable("hrms_leave_requests", {
  id: serial().primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  leaveTypeId: integer("leave_type_id")
    .notNull()
    .references(() => hrmsLeaveTypes.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  daysRequested: numeric("days_requested", { precision: 5, scale: 1 }).notNull(),
  reason: text("reason"),
  status: leaveRequestStatusEnum().notNull().default("pending"),
  approver: text().notNull().default("Direct Manager"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- Module 7: Performance Management (Lightweight) ----
export const hrmsPerformanceReviews = pgTable("hrms_performance_reviews", {
  id: serial().primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  reviewPeriod: text("review_period").notNull(),
  goals: text().notNull().default(""),
  selfAssessment: text("self_assessment"),
  managerFeedback: text("manager_feedback"),
  rating: integer().notNull().default(3),
  developmentPlan: text("development_plan"),
  status: reviewStatusEnum().notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- Module 8: Training & Development (Basic) ----
export const hrmsTrainingCourses = pgTable("hrms_training_courses", {
  id: serial().primaryKey(),
  title: text().notNull(),
  provider: text().notNull().default("Internal"),
  category: text().notNull().default("compliance"),
  durationHours: numeric("duration_hours", { precision: 5, scale: 1 })
    .notNull()
    .default("2"),
  expiryMonths: integer("expiry_months"),
  certificateIssued: boolean("certificate_issued").notNull().default(true),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hrmsTrainingAssignments = pgTable("hrms_training_assignments", {
  id: serial().primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => hrmsTrainingCourses.id),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  assignedDate: date("assigned_date").notNull(),
  dueDate: date("due_date"),
  status: assignmentStatusEnum().notNull().default("assigned"),
  completedDate: date("completed_date"),
  scorePercent: integer("score_percent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- Module 9: Offboarding ----
export const hrmsOffboardingChecklists = pgTable("hrms_offboarding_checklists", {
  id: serial().primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => hrmsEmployees.id),
  initiatedDate: date("initiated_date").notNull(),
  lastWorkingDate: date("last_working_date"),
  reason: text().notNull().default("resignation"),
  exitInterviewNotes: text("exit_interview_notes"),
  assetsRecovered: boolean("assets_recovered").notNull().default(false),
  accessRevoked: boolean("access_revoked").notNull().default(false),
  finalSettlementFjd: numeric("final_settlement_fjd", {
    precision: 12,
    scale: 2,
  }).default("0"),
  status: offboardingStatusEnum().notNull().default("initiated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- Module 10: Administration, Security & Reporting ----
export const hrmsAuditLogs = pgTable("hrms_audit_logs", {
  id: serial().primaryKey(),
  actorRole: text("actor_role").notNull().default("hr_officer"),
  actorName: text("actor_name").notNull().default("HR Officer"),
  action: text().notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull().default(""),
  details: text().notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

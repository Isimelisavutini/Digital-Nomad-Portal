CREATE TYPE "hrms_assignment_status" AS ENUM('assigned', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "hrms_candidate_stage" AS ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');--> statement-breakpoint
CREATE TYPE "hrms_employee_status" AS ENUM('active', 'probation', 'on_leave', 'suspended', 'terminated');--> statement-breakpoint
CREATE TYPE "hrms_leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "hrms_offboarding_status" AS ENUM('initiated', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "hrms_review_status" AS ENUM('draft', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "hrms_task_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "hrms_attendance" (
	"id" serial PRIMARY KEY,
	"employee_id" integer NOT NULL,
	"work_date" date NOT NULL,
	"clock_in" text,
	"clock_out" text,
	"hours_worked" numeric(5,2) DEFAULT '0',
	"overtime_hours" numeric(5,2) DEFAULT '0',
	"shift" text DEFAULT 'day' NOT NULL,
	"flag" text DEFAULT 'present' NOT NULL,
	"source" text DEFAULT 'web' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_audit_logs" (
	"id" serial PRIMARY KEY,
	"actor_role" text DEFAULT 'hr_officer' NOT NULL,
	"actor_name" text DEFAULT 'HR Officer' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text DEFAULT '' NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_candidates" (
	"id" serial PRIMARY KEY,
	"requisition_title" text NOT NULL,
	"department" text DEFAULT 'General' NOT NULL,
	"candidate_name" text NOT NULL,
	"candidate_email" text NOT NULL,
	"candidate_phone" text,
	"resume_summary" text,
	"source" text DEFAULT 'referral' NOT NULL,
	"stage" "hrms_candidate_stage" DEFAULT 'applied'::"hrms_candidate_stage" NOT NULL,
	"interview_date" date,
	"interview_notes" text,
	"offer_amount_fjd" numeric(12,2),
	"converted_employee_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_employees" (
	"id" serial PRIMARY KEY,
	"full_name" text NOT NULL,
	"preferred_name" text,
	"email" text NOT NULL UNIQUE,
	"phone" text,
	"date_of_birth" date,
	"address" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"department" text DEFAULT 'General' NOT NULL,
	"position" text DEFAULT 'Team Member' NOT NULL,
	"manager_id" integer,
	"join_date" date DEFAULT '2026-01-01' NOT NULL,
	"employment_type" text DEFAULT 'full_time' NOT NULL,
	"contract_end_date" date,
	"tin_number" text,
	"fnpf_number" text,
	"bank_name" text,
	"bank_account_number" text,
	"gross_pay_fjd" numeric(12,2) DEFAULT '0' NOT NULL,
	"pay_type" text DEFAULT 'monthly' NOT NULL,
	"status" "hrms_employee_status" DEFAULT 'active'::"hrms_employee_status" NOT NULL,
	"termination_date" date,
	"termination_reason" text,
	"tags" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_leave_requests" (
	"id" serial PRIMARY KEY,
	"employee_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days_requested" numeric(5,1) NOT NULL,
	"reason" text,
	"status" "hrms_leave_request_status" DEFAULT 'pending'::"hrms_leave_request_status" NOT NULL,
	"approver" text DEFAULT 'Direct Manager' NOT NULL,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_leave_types" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"annual_entitlement_days" numeric(5,1) DEFAULT '0' NOT NULL,
	"carry_forward_max_days" numeric(5,1) DEFAULT '0' NOT NULL,
	"encashable" boolean DEFAULT false NOT NULL,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrms_offboarding_checklists" (
	"id" serial PRIMARY KEY,
	"employee_id" integer NOT NULL,
	"initiated_date" date NOT NULL,
	"last_working_date" date,
	"reason" text DEFAULT 'resignation' NOT NULL,
	"exit_interview_notes" text,
	"assets_recovered" boolean DEFAULT false NOT NULL,
	"access_revoked" boolean DEFAULT false NOT NULL,
	"final_settlement_fjd" numeric(12,2) DEFAULT '0',
	"status" "hrms_offboarding_status" DEFAULT 'initiated'::"hrms_offboarding_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_onboarding_tasks" (
	"id" serial PRIMARY KEY,
	"employee_id" integer NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'documents' NOT NULL,
	"assignee" text DEFAULT 'HR Officer' NOT NULL,
	"due_date" date,
	"status" "hrms_task_status" DEFAULT 'todo'::"hrms_task_status" NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_performance_reviews" (
	"id" serial PRIMARY KEY,
	"employee_id" integer NOT NULL,
	"review_period" text NOT NULL,
	"goals" text DEFAULT '' NOT NULL,
	"self_assessment" text,
	"manager_feedback" text,
	"rating" integer DEFAULT 3 NOT NULL,
	"development_plan" text,
	"status" "hrms_review_status" DEFAULT 'draft'::"hrms_review_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_training_assignments" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"assigned_date" date NOT NULL,
	"due_date" date,
	"status" "hrms_assignment_status" DEFAULT 'assigned'::"hrms_assignment_status" NOT NULL,
	"completed_date" date,
	"score_percent" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrms_training_courses" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"provider" text DEFAULT 'Internal' NOT NULL,
	"category" text DEFAULT 'compliance' NOT NULL,
	"duration_hours" numeric(5,1) DEFAULT '2' NOT NULL,
	"expiry_months" integer,
	"certificate_issued" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hrms_attendance" ADD CONSTRAINT "hrms_attendance_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");--> statement-breakpoint
ALTER TABLE "hrms_leave_requests" ADD CONSTRAINT "hrms_leave_requests_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");--> statement-breakpoint
ALTER TABLE "hrms_leave_requests" ADD CONSTRAINT "hrms_leave_requests_leave_type_id_hrms_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "hrms_leave_types"("id");--> statement-breakpoint
ALTER TABLE "hrms_offboarding_checklists" ADD CONSTRAINT "hrms_offboarding_checklists_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");--> statement-breakpoint
ALTER TABLE "hrms_onboarding_tasks" ADD CONSTRAINT "hrms_onboarding_tasks_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");--> statement-breakpoint
ALTER TABLE "hrms_performance_reviews" ADD CONSTRAINT "hrms_performance_reviews_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");--> statement-breakpoint
ALTER TABLE "hrms_training_assignments" ADD CONSTRAINT "hrms_training_assignments_EuzKlzO7Iswt_fkey" FOREIGN KEY ("course_id") REFERENCES "hrms_training_courses"("id");--> statement-breakpoint
ALTER TABLE "hrms_training_assignments" ADD CONSTRAINT "hrms_training_assignments_employee_id_hrms_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hrms_employees"("id");
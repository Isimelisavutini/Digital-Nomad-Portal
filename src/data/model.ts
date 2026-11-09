import type * as HR from "../../hrms/src/types";
import type {
  CostConfiguration,
  ProjectItem,
  ProjectTask,
  PayrollEmployee,
  PayrollRunRecord,
  InvoiceRecord,
  ExpenseRecord,
} from "../types";
import { INITIAL_CONFIG } from "../constants";

export interface Employee extends HR.Employee {
  payType: PayrollEmployee["payType"];
  grossPayFjd: number;
  hourlyRateFjd: number;
  fnpfEmployeeRate: number;
  fnpfEmployerRate: number;
  payeTaxRate: number;
  fnpfNumber: string;
  bankName: string;
  candidateId?: string;
}
export interface PayrollLine {
  employeeId: string;
  name: string;
  grossFjd: number;
  baseGrossFjd: number;
  unpaidDays: number;
  hoursWorked: number;
  fnpfEmployeeFjd: number;
  fnpfEmployerFjd: number;
  payeFjd: number;
  netFjd: number;
}
export interface PayRun extends PayrollRunRecord {
  periodStart: string;
  periodEnd: string;
  currency: "FJD";
  items: PayrollLine[];
}
export interface BusinessState {
  employees: Employee[];
  leaves: HR.LeaveRequest[];
  attendance: HR.AttendanceRecord[];
  candidates: HR.Candidate[];
  jobs: HR.JobOpening[];
  onboarding: HR.OnboardingTask[];
  payroll_runs: PayRun[];
  invoices: InvoiceRecord[];
  expenses: (ExpenseRecord & { syncPeriod?: string })[];
  projects: ProjectItem[];
  tasks: ProjectTask[];
  departments: HR.Department[];
  goals: HR.PerformanceGoal[];
  reviews: HR.PerformanceReview[];
  courses: HR.TrainingCourse[];
  assignments: HR.TrainingAssignment[];
  company: {
    id: string;
    companyName: string;
    timezone: string;
    fiscalYearStart: string;
  }[];
  timeline: { id: string; completed: boolean }[];
  settings: (CostConfiguration & { id: string })[];
}
export const COLLECTIONS = [
  "employees",
  "leaves",
  "attendance",
  "candidates",
  "jobs",
  "onboarding",
  "payroll_runs",
  "invoices",
  "expenses",
  "projects",
  "tasks",
  "departments",
  "goals",
  "reviews",
  "courses",
  "assignments",
  "settings",
  "company",
  "timeline",
] as const;
export type Collection = (typeof COLLECTIONS)[number];
export type Change = {
  collection: Collection;
  record: { id: string; [key: string]: unknown };
};
export function emptyState(): BusinessState {
  return {
    employees: [],
    leaves: [],
    attendance: [],
    candidates: [],
    jobs: [],
    onboarding: [],
    payroll_runs: [],
    invoices: [],
    expenses: [],
    projects: [],
    tasks: [],
    departments: [],
    goals: [],
    reviews: [],
    courses: [],
    assignments: [],
    company: [
      {
        id: "company",
        companyName: "Digital Nomad",
        timezone: "Pacific/Fiji",
        fiscalYearStart: "January",
      },
    ],
    timeline: [],
    settings: [{ ...INITIAL_CONFIG, id: "config" }],
  };
}
export function toPayrollEmployee(employee: Employee): PayrollEmployee {
  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    role: employee.position,
    department: employee.department,
    tinNumber: employee.taxId || "",
    fnpfNumber: employee.fnpfNumber,
    payType: employee.payType,
    grossPayFjd: employee.grossPayFjd,
    fnpfEmployeeRate: employee.fnpfEmployeeRate,
    fnpfEmployerRate: employee.fnpfEmployerRate,
    payeTaxRate: employee.payeTaxRate,
    bankName: employee.bankName,
    accountNumber: employee.bankAccount || "",
    status:
      employee.status === "terminated" || employee.status === "on_leave"
        ? employee.status
        : "active",
  };
}
export function changedRecords(
  before: BusinessState,
  after: BusinessState,
): Change[] {
  return COLLECTIONS.flatMap((collection) => {
    const old = new Map(
      before[collection].map((record) => [record.id, JSON.stringify(record)]),
    );
    return after[collection]
      .filter((record) => old.get(record.id) !== JSON.stringify(record))
      .map((record) => ({ collection, record: { ...record } }));
  });
}

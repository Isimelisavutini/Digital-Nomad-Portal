import * as HR from "../../hrms/src/data";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
} from "../constants";
import { emptyState } from "./model";
export function demoState() {
  return {
    ...emptyState(),
    employees: HR.EMPLOYEES.map((employee) => ({
      ...employee,
      payType: "monthly" as const,
      grossPayFjd: Math.round((employee.salary / 12) * 100) / 100,
      hourlyRateFjd: 0,
      fnpfEmployeeRate: 0,
      fnpfEmployerRate: 0,
      payeTaxRate: 0,
      fnpfNumber: "",
      bankName: "",
    })),
    leaves: HR.LEAVE_REQUESTS,
    attendance: HR.ATTENDANCE,
    candidates: HR.CANDIDATES,
    jobs: HR.JOB_OPENINGS,
    onboarding: HR.ONBOARDING_TASKS,
    departments: HR.DEPARTMENTS,
    goals: HR.PERFORMANCE_GOALS,
    reviews: HR.PERFORMANCE_REVIEWS,
    courses: HR.TRAINING_COURSES,
    assignments: HR.TRAINING_ASSIGNMENTS,
    projects: INITIAL_PROJECTS,
    tasks: INITIAL_TASKS,
    invoices: INITIAL_INVOICES,
    expenses: INITIAL_EXPENSES,
  };
}

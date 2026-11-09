import type {
  AttendanceRecord,
  Candidate,
  LeaveRequest,
} from "../../hrms/src/types";
import type { PayrollEmployee } from "../types";
import type { BusinessState, Employee, PayRun } from "./model";
export const todayFiji = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Fiji",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const money = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;
export function daysInRange(start: string, end: string): string[] {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
    start > end ||
    new Date(`${start}T00:00:00Z`).toISOString().slice(0, 10) !== start ||
    new Date(`${end}T00:00:00Z`).toISOString().slice(0, 10) !== end ||
    (Date.parse(end) - Date.parse(start)) / 86400000 > 366
  )
    throw new Error("Choose a valid date range of no more than one year.");
  const days: string[] = [];
  for (
    let day = new Date(`${start}T00:00:00Z`);
    day.toISOString().slice(0, 10) <= end;
    day.setUTCDate(day.getUTCDate() + 1)
  )
    days.push(day.toISOString().slice(0, 10));
  return days;
}
export function employeeFromPayroll(
  input: Omit<PayrollEmployee, "id">,
  id: string = crypto.randomUUID(),
): Employee {
  const [firstName, ...last] = input.name.trim().split(/\s+/);
  if (
    !firstName ||
    input.grossPayFjd < 0 ||
    !Number.isFinite(input.grossPayFjd)
  )
    throw new Error("Enter a name and valid pay amount.");
  return {
    id,
    employeeCode: `EMP-${id.slice(0, 8)}`,
    firstName,
    lastName: last.join(" "),
    email: "",
    phone: "",
    department: input.department,
    position: input.role,
    joinDate: todayFiji(),
    status: input.status,
    employmentType: input.payType === "contractor" ? "contract" : "full_time",
    salary: money(input.grossPayFjd * 12),
    avatarColor: "#194b91",
    bankAccount: input.accountNumber,
    taxId: input.tinNumber,
    fnpfNumber: input.fnpfNumber,
    bankName: input.bankName,
    payType: input.payType,
    grossPayFjd: input.grossPayFjd,
    hourlyRateFjd: 0,
    fnpfEmployeeRate: input.fnpfEmployeeRate,
    fnpfEmployerRate: input.fnpfEmployerRate,
    payeTaxRate: input.payeTaxRate,
  };
}
export function hireCandidate(
  state: BusinessState,
  id: string,
  annualSalaryFjd: number,
): BusinessState {
  const candidate = state.candidates.find((candidate) => candidate.id === id);
  if (!candidate || candidate.status === "rejected")
    throw new Error("Select an eligible candidate.");
  if (
    candidate.status === "hired" ||
    state.employees.some((employee) => employee.candidateId === id)
  )
    throw new Error("This candidate is already hired.");
  if (!Number.isFinite(annualSalaryFjd) || annualSalaryFjd <= 0)
    throw new Error("Enter a positive annual salary in FJD.");
  const employee = employeeFromPayroll({
    name: `${candidate.firstName} ${candidate.lastName}`,
    role: candidate.position,
    department: candidate.department,
    tinNumber: "",
    fnpfNumber: "",
    payType: "monthly",
    grossPayFjd: money(annualSalaryFjd / 12),
    fnpfEmployeeRate: 0,
    fnpfEmployerRate: 0,
    payeTaxRate: 0,
    bankName: "",
    accountNumber: "",
    status: "active",
  });
  Object.assign(employee, {
    candidateId: id,
    status: "probation",
    email: candidate.email,
    phone: candidate.phone,
    salary: annualSalaryFjd,
  });
  const onboarding = [
    "Sign employment contract",
    "Complete tax and bank details",
    "Provision accounts and equipment",
    "Complete HR orientation",
  ].map((title, index) => ({
    id: crypto.randomUUID(),
    employeeId: employee.id,
    title,
    assignee: index === 2 ? ("it" as const) : ("hr" as const),
    status: "pending" as const,
    dueDate: employee.joinDate,
  }));
  const departments = state.departments.some(
    (department) => department.name === employee.department,
  )
    ? state.departments
    : [
        ...state.departments,
        { id: crypto.randomUUID(), name: employee.department },
      ];
  return {
    ...state,
    departments,
    candidates: state.candidates.map((record) =>
      record.id === id ? { ...record, status: "hired" as const } : record,
    ),
    employees: [...state.employees, employee],
    onboarding: [...state.onboarding, ...onboarding],
  };
}
export function decideLeave(
  state: BusinessState,
  id: string,
  status: "approved" | "rejected",
  reviewer: string,
): BusinessState {
  if (
    !state.leaves.some((leave) => leave.id === id && leave.status === "pending")
  )
    throw new Error("This request has already been reviewed.");
  return {
    ...state,
    leaves: state.leaves.map((leave) =>
      leave.id === id
        ? { ...leave, status, reviewedAt: todayFiji(), reviewedBy: reviewer }
        : leave,
    ),
  };
}
export function recordAttendance(
  state: BusinessState,
  record: AttendanceRecord,
): BusinessState {
  if (!state.employees.some((employee) => employee.id === record.employeeId))
    throw new Error("Employee not found.");
  if (
    !Number.isFinite(record.hoursWorked ?? 0) ||
    (record.hoursWorked ?? 0) < 0 ||
    (record.hoursWorked ?? 0) > 24
  )
    throw new Error("Hours must be between 0 and 24.");
  const old = state.attendance.find(
    (item) =>
      item.employeeId === record.employeeId && item.date === record.date,
  );
  return {
    ...state,
    attendance: [
      ...state.attendance.filter((item) => item.id !== old?.id),
      { ...record, id: old?.id ?? record.id },
    ],
  };
}
export function requestLeave(
  state: BusinessState,
  leave: LeaveRequest,
): BusinessState {
  if (!state.employees.some((employee) => employee.id === leave.employeeId))
    throw new Error("Select an employee.");
  const days = daysInRange(leave.startDate, leave.endDate).filter(
    (day) => ![0, 6].includes(new Date(`${day}T00:00:00Z`).getUTCDay()),
  ).length;
  if (!days) throw new Error("Select at least one working day.");
  if (
    state.leaves.some(
      (existing) =>
        existing.employeeId === leave.employeeId &&
        existing.status !== "rejected" &&
        existing.status !== "cancelled" &&
        existing.startDate <= leave.endDate &&
        existing.endDate >= leave.startDate,
    )
  )
    throw new Error("An overlapping leave request already exists.");
  return {
    ...state,
    leaves: [
      ...state.leaves,
      {
        ...leave,
        days,
        status: "pending",
        reviewedAt: undefined,
        reviewedBy: undefined,
      },
    ],
  };
}
export function createPayroll(
  state: BusinessState,
  start: string,
  end: string,
): PayRun {
  const days = daysInRange(start, end);
  const workingDays = days.filter(
    (day) => ![0, 6].includes(new Date(`${day}T00:00:00Z`).getUTCDay()),
  );
  const monthEnd = new Date(
    Date.UTC(Number(start.slice(0, 4)), Number(start.slice(5, 7)), 0),
  )
    .toISOString()
    .slice(0, 10);
  if (start.slice(8) !== "01" || end !== monthEnd)
    throw new Error("Payroll currently supports complete calendar months.");
  if (
    state.payroll_runs.some(
      (run) => run.periodStart <= end && run.periodEnd >= start,
    )
  )
    throw new Error("A payroll run already exists for this period.");
  const eligible = state.employees.filter(
    (employee) =>
      employee.status !== "terminated" &&
      employee.status !== "suspended" &&
      employee.joinDate <= end,
  );
  if (!eligible.length)
    throw new Error("No eligible employees for this period.");
  const items = eligible.map((employee) => {
    if (
      [
        employee.grossPayFjd,
        employee.hourlyRateFjd,
        employee.fnpfEmployeeRate,
        employee.fnpfEmployerRate,
        employee.payeTaxRate,
      ].some((value) => !Number.isFinite(value) || value < 0)
    )
      throw new Error("Review employee pay settings before running payroll.");
    if (
      employee.fnpfEmployeeRate + employee.payeTaxRate > 1 ||
      employee.fnpfEmployerRate > 1
    )
      throw new Error("Deduction rates must be between 0 and 100%.");
    const approved = state.leaves.filter(
      (leave) =>
        leave.employeeId === employee.id && leave.status === "approved",
    );
    // Count each date once. Paid leave overrides an absent attendance entry.
    const payableDays = workingDays.filter((day) => day >= employee.joinDate);
    const unpaidDays = payableDays.filter((day) => {
      const leave = approved.find(
        (leave) => leave.startDate <= day && leave.endDate >= day,
      );
      return leave
        ? leave.leaveType === "unpaid"
        : state.attendance.some(
            (record) =>
              record.employeeId === employee.id &&
              record.date === day &&
              record.status === "absent",
          );
    }).length;
    const hoursWorked = state.attendance
      .filter(
        (record) =>
          record.employeeId === employee.id &&
          record.date >= start &&
          record.date <= end &&
          record.date >= employee.joinDate &&
          ["present", "late", "half_day"].includes(record.status) &&
          !approved.some(
            (leave) =>
              leave.leaveType === "unpaid" &&
              leave.startDate <= record.date &&
              leave.endDate >= record.date,
          ),
      )
      .reduce((total, record) => total + (record.hoursWorked ?? 0), 0);
    const grossFjd = money(
      employee.payType === "hourly"
        ? hoursWorked * employee.hourlyRateFjd
        : (employee.grossPayFjd * (payableDays.length - unpaidDays)) /
            Math.max(workingDays.length, 1),
    );
    const fnpfEmployeeFjd = money(grossFjd * employee.fnpfEmployeeRate),
      fnpfEmployerFjd = money(grossFjd * employee.fnpfEmployerRate),
      payeFjd = money(grossFjd * employee.payeTaxRate);
    return {
      employeeId: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      baseGrossFjd: employee.grossPayFjd,
      grossFjd,
      unpaidDays,
      hoursWorked,
      fnpfEmployeeFjd,
      fnpfEmployerFjd,
      payeFjd,
      netFjd: money(grossFjd - fnpfEmployeeFjd - payeFjd),
    };
  });
  const total = (
    key:
      "grossFjd" | "fnpfEmployeeFjd" | "fnpfEmployerFjd" | "payeFjd" | "netFjd",
  ) => money(items.reduce((sum, item) => sum + item[key], 0));
  return {
    id: crypto.randomUUID(),
    payPeriod: start.slice(0, 7),
    periodStart: start,
    periodEnd: end,
    runDate: todayFiji(),
    totalGrossFjd: total("grossFjd"),
    totalFnpfEmployeeFjd: total("fnpfEmployeeFjd"),
    totalFnpfEmployerFjd: total("fnpfEmployerFjd"),
    totalPayeTaxFjd: total("payeFjd"),
    totalNetPayFjd: total("netFjd"),
    employeeCount: items.length,
    currency: "FJD",
    status: "draft",
    items,
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  toPayrollEmployee,
  changedRecords,
} from "../src/data/model";
import {
  createPayroll,
  employeeFromPayroll,
  hireCandidate,
  recordAttendance,
  requestLeave,
  decideLeave,
  daysInRange,
} from "../src/data/workflows";
function employee(id = "employee-1") {
  return {
    ...employeeFromPayroll(
      {
        name: "Test Employee",
        role: "Developer",
        department: "Engineering",
        tinNumber: "",
        fnpfNumber: "",
        payType: "monthly",
        grossPayFjd: 2200,
        fnpfEmployeeRate: 0.08,
        fnpfEmployerRate: 0.1,
        payeTaxRate: 0.1,
        bankName: "",
        accountNumber: "",
        status: "active",
      },
      id,
    ),
    joinDate: "2020-01-01",
  };
}
test("one employee record supplies HR and bookkeeping pay data", () => {
  const person = employee();
  const payroll = toPayrollEmployee(person);
  assert.equal(payroll.id, person.id);
  assert.equal(payroll.name, `${person.firstName} ${person.lastName}`);
  assert.equal(payroll.grossPayFjd, person.grossPayFjd);
});
test("hiring creates employee and onboarding checklist together and rejects a second hire", () => {
  const state = emptyState();
  state.candidates = [
    {
      id: "candidate",
      firstName: "New",
      lastName: "Hire",
      email: "new@example.test",
      phone: "",
      position: "Engineer",
      department: "Engineering",
      status: "offer",
      source: "Direct",
      appliedAt: "2026-10-01",
    },
  ];
  const hired = hireCandidate(state, "candidate", 60000);
  assert.equal(hired.candidates[0].status, "hired");
  assert.equal(hired.employees.length, 1);
  assert.equal(hired.employees[0].grossPayFjd, 5000);
  assert.equal(hired.employees[0].candidateId, "candidate");
  assert.equal(hired.onboarding.length, 4);
  assert.ok(
    hired.onboarding.every((task) => task.employeeId === hired.employees[0].id),
  );
  assert.throws(
    () => hireCandidate(hired, "candidate", 60000),
    /already hired/,
  );
  assert.deepEqual(
    new Set(changedRecords(state, hired).map((change) => change.collection)),
    new Set(["candidates", "employees", "onboarding", "departments"]),
  );
});
test("leave decisions feed the same state; overlapping leave and repeat review are rejected", () => {
  const state = emptyState();
  state.employees = [employee()];
  const requested = requestLeave(state, {
    id: "leave",
    employeeId: "employee-1",
    leaveType: "unpaid",
    startDate: "2026-11-02",
    endDate: "2026-11-03",
    days: 0,
    reason: "Personal",
    status: "pending",
    requestedAt: "2026-11-01",
  });
  assert.equal(requested.leaves[0].days, 2);
  const approved = decideLeave(requested, "leave", "approved", "reviewer");
  assert.equal(approved.leaves[0].reviewedBy, "reviewer");
  assert.throws(
    () => decideLeave(approved, "leave", "approved", "reviewer"),
    /already/,
  );
  assert.throws(
    () => requestLeave(approved, { ...approved.leaves[0], id: "second" }),
    /overlapping/,
  );
});
test("payroll deducts approved unpaid leave/absence once, preserves paid leave and ignores pending leave", () => {
  const state = emptyState();
  state.employees = [employee()];
  state.leaves = [
    {
      id: "unpaid",
      employeeId: "employee-1",
      leaveType: "unpaid",
      startDate: "2026-11-02",
      endDate: "2026-11-02",
      days: 1,
      status: "approved",
      reason: "",
      requestedAt: "2026-10-01",
    },
    {
      id: "paid",
      employeeId: "employee-1",
      leaveType: "annual",
      startDate: "2026-11-03",
      endDate: "2026-11-03",
      days: 1,
      status: "approved",
      reason: "",
      requestedAt: "2026-10-01",
    },
    {
      id: "pending",
      employeeId: "employee-1",
      leaveType: "unpaid",
      startDate: "2026-11-04",
      endDate: "2026-11-04",
      days: 1,
      status: "pending",
      reason: "",
      requestedAt: "2026-10-01",
    },
  ];
  state.attendance = [
    {
      id: "a1",
      employeeId: "employee-1",
      date: "2026-11-02",
      status: "absent",
    },
    {
      id: "a2",
      employeeId: "employee-1",
      date: "2026-11-03",
      status: "absent",
    },
  ];
  const run = createPayroll(state, "2026-11-01", "2026-11-30");
  assert.equal(run.items[0].unpaidDays, 1);
  assert.equal(run.totalGrossFjd, 2095.24);
  assert.equal(run.totalNetPayFjd, 1718.1);
  assert.equal(run.status, "draft");
  state.payroll_runs = [run];
  assert.throws(
    () => createPayroll(state, "2026-11-01", "2026-11-30"),
    /already exists/,
  );
});
test("hourly pay uses recorded hours, ignores unpaid leave hours and excludes terminated staff", () => {
  const state = emptyState();
  state.employees = [
    { ...employee(), payType: "hourly", hourlyRateFjd: 20 },
    { ...employee("terminated"), status: "terminated" },
  ];
  state.attendance = [
    {
      id: "a1",
      employeeId: "employee-1",
      date: "2026-11-02",
      status: "present",
      hoursWorked: 8,
    },
    {
      id: "a2",
      employeeId: "employee-1",
      date: "2026-11-03",
      status: "present",
      hoursWorked: 8,
    },
  ];
  state.leaves = [
    {
      id: "leave",
      employeeId: "employee-1",
      leaveType: "unpaid",
      startDate: "2026-11-03",
      endDate: "2026-11-03",
      days: 1,
      status: "approved",
      reason: "",
      requestedAt: "2026-10-01",
    },
  ];
  const run = createPayroll(state, "2026-11-01", "2026-11-30");
  assert.equal(run.employeeCount, 1);
  assert.equal(run.items[0].hoursWorked, 8);
  assert.equal(run.totalGrossFjd, 160);
});
test("attendance upserts one record per employee/date and validates hours", () => {
  let state = emptyState();
  state.employees = [employee()];
  state = recordAttendance(state, {
    id: "a1",
    employeeId: "employee-1",
    date: "2026-11-02",
    status: "present",
    hoursWorked: 8,
  });
  state = recordAttendance(state, {
    id: "a2",
    employeeId: "employee-1",
    date: "2026-11-02",
    status: "late",
    hoursWorked: 7,
  });
  assert.equal(state.attendance.length, 1);
  assert.equal(state.attendance[0].id, "a1");
  assert.equal(state.attendance[0].hoursWorked, 7);
  assert.throws(
    () =>
      recordAttendance(state, {
        id: "bad",
        employeeId: "employee-1",
        date: "2026-11-02",
        status: "present",
        hoursWorked: 25,
      }),
    /Hours/,
  );
});
test("invalid dates and partial-month payroll are rejected; cross-month leave is supported", () => {
  assert.throws(() => daysInRange("2026-02-30", "2026-03-01"));
  assert.equal(daysInRange("2026-11-30", "2026-12-02").length, 3);
  assert.throws(
    () => createPayroll(emptyState(), "2026-11-02", "2026-11-30"),
    /complete calendar/,
  );
});

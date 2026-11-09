import React, { useState } from "react";
import { useHrData } from "../../../src/data/BusinessProvider";
import { EmployeeEditor } from "../../../src/components/EmployeeEditor";
import type { Employee } from "../../../src/data/model";
import { createPayroll, todayFiji } from "../../../src/data/workflows";
import { formatCurrency } from "../utils";
import { Badge, SectionHeader } from "./ui";
export function PayrollView() {
  const { state, mutate, busy } = useHrData();
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [month, setMonth] = useState(todayFiji().slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRun = state.payroll_runs.find((run) => run.id === selected);
  return (
    <div className="space-y-5">
      {editing && (
        <EmployeeEditor
          employee={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      <SectionHeader
        title="Payroll"
        subtitle="Shared FJD payroll records for HR and Bookkeeping"
        action={
          mutate && (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Add employee
            </button>
          )
        }
      />
      <div className="space-y-3 rounded-xl border bg-white p-5">
        <label className="text-sm">
          Payroll month
          <input
            aria-label="Payroll month"
            type="month"
            required
            value={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
            className="ml-3 rounded border p-2"
          />
        </label>
        <p className="text-xs text-slate-500">
          Draft estimates use recorded hours for hourly staff. Monthly salary is
          prorated for working days before the start date, approved unpaid
          leave, and recorded absences. Review employee deduction rates before
          approval. No bank payment or statutory filing is made.
        </p>
        <button
          type="button"
          disabled={!mutate || busy || !state.employees.length}
          onClick={() =>
            void mutate?.((current) => {
              const end = new Date(
                Date.UTC(
                  Number(month.slice(0, 4)),
                  Number(month.slice(5, 7)),
                  0,
                ),
              )
                .toISOString()
                .slice(0, 10);
              return {
                ...current,
                payroll_runs: [
                  ...current.payroll_runs,
                  createPayroll(current, `${month}-01`, end),
                ],
              };
            })
          }
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Create draft payroll
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Period</th>
              <th className="p-3">Employees</th>
              <th className="p-3">Gross (FJD)</th>
              <th className="p-3">Net (FJD)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {state.payroll_runs.map((run) => (
              <tr key={run.id} className="border-t">
                <td className="p-3">{run.payPeriod}</td>
                <td className="p-3">{run.employeeCount}</td>
                <td className="p-3">{formatCurrency(run.totalGrossFjd)}</td>
                <td className="p-3">{formatCurrency(run.totalNetPayFjd)}</td>
                <td className="p-3">
                  <Badge status={run.status} />
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setSelected(run.id)}
                    className="text-brand-600 underline"
                  >
                    View snapshot
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!state.payroll_runs.length && (
          <p className="p-5 text-sm text-slate-500">No payroll runs yet.</p>
        )}
      </div>
      <section className="overflow-x-auto rounded-xl border bg-white">
        <h2 className="p-4 font-semibold">Shared employee pay register</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Pay type</th>
              <th className="p-3">Base / rate (FJD)</th>
              <th className="p-3">Employee / employer / withholding</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {state.employees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="p-3">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="p-3">{employee.payType}</td>
                <td className="p-3">
                  {formatCurrency(
                    employee.payType === "hourly"
                      ? employee.hourlyRateFjd
                      : employee.grossPayFjd,
                  )}
                </td>
                <td className="p-3">
                  {employee.fnpfEmployeeRate * 100}% /{" "}
                  {employee.fnpfEmployerRate * 100}% /{" "}
                  {employee.payeTaxRate * 100}%
                </td>
                <td className="p-3">
                  {mutate && (
                    <button
                      type="button"
                      onClick={() => setEditing(employee)}
                      className="text-brand-600 underline"
                    >
                      Edit pay settings
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {selectedRun && (
        <section className="overflow-x-auto rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">
            {selectedRun.payPeriod} · Immutable draft snapshot
          </h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-2">Employee</th>
                <th className="p-2">Unpaid days</th>
                <th className="p-2">Hours worked</th>
                <th className="p-2">Gross FJD</th>
                <th className="p-2">Deductions FJD</th>
                <th className="p-2">Net FJD</th>
              </tr>
            </thead>
            <tbody>
              {selectedRun.items.map((item) => (
                <tr key={item.employeeId}>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.unpaidDays}</td>
                  <td className="p-2">{item.hoursWorked}</td>
                  <td className="p-2">{formatCurrency(item.grossFjd)}</td>
                  <td className="p-2">
                    {formatCurrency(item.fnpfEmployeeFjd + item.payeFjd)}
                  </td>
                  <td className="p-2">{formatCurrency(item.netFjd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

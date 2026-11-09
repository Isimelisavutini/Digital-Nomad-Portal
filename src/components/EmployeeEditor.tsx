import React from "react";
import { RecordForm, type FormField } from "./RecordForm";
import { useBusiness } from "../data/BusinessProvider";
import { employeeFromPayroll } from "../data/workflows";
import type { Employee } from "../data/model";
export function EmployeeEditor({
  employee,
  onClose,
}: {
  employee?: Employee;
  onClose: () => void;
}) {
  const { mutate } = useBusiness();
  const fields: FormField[] = [
    {
      name: "firstName",
      label: "First name",
      required: true,
      value: employee?.firstName,
    },
    {
      name: "lastName",
      label: "Last name",
      required: true,
      value: employee?.lastName,
    },
    { name: "email", label: "Email", type: "email", value: employee?.email },
    {
      name: "department",
      label: "Department",
      required: true,
      value: employee?.department,
    },
    {
      name: "position",
      label: "Position",
      required: true,
      value: employee?.position,
    },
    {
      name: "joinDate",
      label: "Start date",
      type: "date",
      required: true,
      value: employee?.joinDate ?? new Date().toISOString().slice(0, 10),
    },
    {
      name: "status",
      label: "Employment status",
      value: employee?.status ?? "active",
      options: [
        "active",
        "probation",
        "on_leave",
        "suspended",
        "terminated",
      ].map((value) => ({ value, label: value.replaceAll("_", " ") })),
    },
    {
      name: "payType",
      label: "Pay type",
      value: employee?.payType ?? "monthly",
      options: ["monthly", "hourly", "contractor"].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      name: "grossPayFjd",
      label: "Monthly gross / contractor monthly fee (FJD)",
      type: "number",
      min: 0,
      step: "0.01",
      required: true,
      value: employee?.grossPayFjd ?? 0,
    },
    {
      name: "hourlyRateFjd",
      label: "Hourly rate (FJD; hourly employees)",
      type: "number",
      min: 0,
      step: "0.01",
      required: true,
      value: employee?.hourlyRateFjd ?? 0,
    },
    {
      name: "fnpfEmployeeRate",
      label: "Employee contribution (%) — confirm applicable rate",
      type: "number",
      min: 0,
      max: 100,
      step: "0.01",
      required: true,
      value: (employee?.fnpfEmployeeRate ?? 0) * 100,
    },
    {
      name: "fnpfEmployerRate",
      label: "Employer contribution (%) — confirm applicable rate",
      type: "number",
      min: 0,
      max: 100,
      step: "0.01",
      required: true,
      value: (employee?.fnpfEmployerRate ?? 0) * 100,
    },
    {
      name: "payeTaxRate",
      label: "Effective withholding (%) — confirm payroll calculation",
      type: "number",
      min: 0,
      max: 100,
      step: "0.01",
      required: true,
      value: (employee?.payeTaxRate ?? 0) * 100,
    },
    { name: "taxId", label: "Tax ID", value: employee?.taxId },
    {
      name: "fnpfNumber",
      label: "Fund membership number",
      value: employee?.fnpfNumber,
    },
    { name: "bankName", label: "Bank", value: employee?.bankName },
    {
      name: "bankAccount",
      label: "Bank account",
      value: employee?.bankAccount,
    },
  ];
  return (
    <RecordForm
      title={employee ? "Edit employee and pay settings" : "Add employee"}
      fields={fields}
      onClose={onClose}
      onSave={(values) =>
        mutate((current) => {
          const monthly = Number(values.grossPayFjd),
            hourly = Number(values.hourlyRateFjd),
            rates = [
              values.fnpfEmployeeRate,
              values.fnpfEmployerRate,
              values.payeTaxRate,
            ].map(Number);
          if (
            rates.some(
              (rate) => !Number.isFinite(rate) || rate < 0 || rate > 100,
            ) ||
            rates[0] + rates[2] > 100
          )
            throw new Error(
              "Enter valid deduction rates; employee deductions cannot exceed 100%.",
            );
          const base =
            employee ??
            employeeFromPayroll({
              name: `${values.firstName} ${values.lastName}`,
              department: values.department,
              role: values.position,
              tinNumber: values.taxId,
              fnpfNumber: values.fnpfNumber,
              bankName: values.bankName,
              accountNumber: values.bankAccount,
              payType: "monthly",
              grossPayFjd: monthly,
              fnpfEmployeeRate: 0,
              fnpfEmployerRate: 0,
              payeTaxRate: 0,
              status: "active",
            });
          const next: Employee = {
            ...base,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email,
            department: values.department,
            position: values.position,
            joinDate: values.joinDate,
            status: values.status as Employee["status"],
            payType: values.payType as Employee["payType"],
            grossPayFjd: monthly,
            hourlyRateFjd: hourly,
            salary: monthly * 12,
            fnpfEmployeeRate: rates[0] / 100,
            fnpfEmployerRate: rates[1] / 100,
            payeTaxRate: rates[2] / 100,
            taxId: values.taxId,
            fnpfNumber: values.fnpfNumber,
            bankName: values.bankName,
            bankAccount: values.bankAccount,
          };
          if (
            !next.firstName ||
            !next.lastName ||
            !Number.isFinite(monthly) ||
            monthly < 0 ||
            !Number.isFinite(hourly) ||
            hourly < 0
          )
            throw new Error("Check employee name and pay amounts.");
          return {
            ...current,
            departments: current.departments.some(
              (department) => department.name === next.department,
            )
              ? current.departments
              : [
                  ...current.departments,
                  { id: crypto.randomUUID(), name: next.department },
                ],
            employees: [
              ...current.employees.filter((record) => record.id !== next.id),
              next,
            ],
          };
        })
      }
    />
  );
}

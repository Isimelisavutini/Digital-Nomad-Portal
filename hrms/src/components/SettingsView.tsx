import React, { useState } from "react";
import { RecordForm } from "../../../src/components/RecordForm";
import { Building2, CalendarDays } from "lucide-react";
import { useHrData } from "../../../src/data/BusinessProvider";
import { SectionHeader } from "./ui";

export function SettingsView() {
  const { DEPARTMENTS, state, mutate } = useHrData();
  const [editing, setEditing] = useState(false);
  const company = state.company[0];
  return (
    <div>
      {editing && mutate && (
        <RecordForm
          title="Company settings"
          onClose={() => setEditing(false)}
          fields={[
            {
              name: "companyName",
              label: "Company name",
              required: true,
              value: company?.companyName,
            },
            {
              name: "timezone",
              label: "Timezone",
              required: true,
              value: company?.timezone,
            },
            {
              name: "fiscalYearStart",
              label: "Fiscal year start",
              required: true,
              value: company?.fiscalYearStart,
            },
          ]}
          onSave={(values) =>
            mutate((current) => {
              new Intl.DateTimeFormat("en", { timeZone: values.timezone });
              return {
                ...current,
                company: [
                  {
                    id: "company",
                    companyName: values.companyName,
                    timezone: values.timezone,
                    fiscalYearStart: values.fiscalYearStart,
                  },
                ],
              };
            })
          }
        />
      )}
      <SectionHeader
        title="HR Settings"
        subtitle="Company configuration"
        action={
          mutate && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Edit company
            </button>
          )
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Company
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-500">Company Name</label>
              <p>{company?.companyName}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Timezone</label>
              <p>{company?.timezone}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">
                Fiscal Year Start
              </label>
              <p>{company?.fiscalYearStart}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm text-slate-500">
          Leave approvals and payroll use recorded working days and employee pay
          settings. Configure and review your company's statutory rates and
          leave policy before using payroll drafts for operational decisions.
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 md:col-span-2">
          <h2 className="font-semibold text-slate-900">Departments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEPARTMENTS.map((d) => (
              <div
                key={d.id}
                className="px-3 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700"
              >
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

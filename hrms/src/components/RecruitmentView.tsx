import React, { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useHrData } from "../../../src/data/BusinessProvider";
import { formatDate, labelize } from "../utils";
import { RecordForm, type FormField } from "../../../src/components/RecordForm";
import { hireCandidate, todayFiji } from "../../../src/data/workflows";
import type { Candidate, JobOpening } from "../types";
import { Badge, SectionHeader } from "./ui";

export function RecruitmentView() {
  const { CANDIDATES, JOB_OPENINGS, mutate } = useHrData();
  const [form, setForm] = useState<"job" | "candidate" | string | null>(null);
  const [tab, setTab] = useState<"jobs" | "candidates">("candidates");

  return (
    <div>
      {form && mutate && (
        <RecordForm
          title={
            form === "job"
              ? "Post job"
              : form === "candidate"
                ? "Add candidate"
                : "Hire candidate and start onboarding"
          }
          onClose={() => setForm(null)}
          fields={
            form === "job"
              ? [
                  { name: "title", label: "Job title", required: true },
                  { name: "department", label: "Department", required: true },
                  { name: "location", label: "Location", required: true },
                  { name: "description", label: "Description", required: true },
                  {
                    name: "openings",
                    label: "Openings",
                    type: "number",
                    min: 1,
                    value: 1,
                    required: true,
                  },
                ]
              : form === "candidate"
                ? [
                    { name: "firstName", label: "First name", required: true },
                    { name: "lastName", label: "Last name", required: true },
                    {
                      name: "email",
                      label: "Email",
                      type: "email",
                      required: true,
                    },
                    { name: "phone", label: "Phone" },
                    { name: "position", label: "Position", required: true },
                    { name: "department", label: "Department", required: true },
                    { name: "source", label: "Source", value: "Direct" },
                  ]
                : [
                    {
                      name: "annualSalary",
                      label: "Agreed annual salary (FJD)",
                      type: "number",
                      min: 0.01,
                      step: "0.01",
                      required: true,
                    },
                  ]
          }
          onSave={(values) =>
            mutate((current) => {
              if (form === "job")
                return {
                  ...current,
                  jobs: [
                    ...current.jobs,
                    {
                      ...values,
                      id: crypto.randomUUID(),
                      title: values.title,
                      department: values.department,
                      location: values.location,
                      description: values.description,
                      type: "full_time",
                      status: "open",
                      openings: Number(values.openings),
                      postedAt: todayFiji(),
                    } as JobOpening,
                  ],
                };
              if (form === "candidate")
                return {
                  ...current,
                  candidates: [
                    ...current.candidates,
                    {
                      ...values,
                      id: crypto.randomUUID(),
                      firstName: values.firstName,
                      lastName: values.lastName,
                      email: values.email,
                      phone: values.phone,
                      position: values.position,
                      department: values.department,
                      source: values.source,
                      status: "applied",
                      appliedAt: todayFiji(),
                    } as Candidate,
                  ],
                };
              return hireCandidate(current, form, Number(values.annualSalary));
            })
          }
        />
      )}
      <SectionHeader
        title="Recruitment"
        subtitle="Job openings and candidate pipeline"
        action={
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!mutate}
              onClick={() => setForm("candidate")}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Add candidate
            </button>
            <button
              type="button"
              disabled={!mutate}
              onClick={() => setForm("job")}
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white"
            >
              Post job
            </button>
          </div>
        }
      />
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {(["candidates", "jobs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t === "candidates"
              ? `Candidates (${CANDIDATES.length})`
              : `Jobs (${JOB_OPENINGS.length})`}
          </button>
        ))}
      </div>

      {tab === "candidates" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Candidate</th>
                <th className="text-left px-5 py-3 font-medium">Position</th>
                <th className="text-left px-5 py-3 font-medium">Source</th>
                <th className="text-left px-5 py-3 font-medium">Applied</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CANDIDATES.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.position}</td>
                  <td className="px-5 py-3 text-slate-600">{c.source}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDate(c.appliedAt)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-5 py-3">
                    {mutate &&
                      c.status !== "hired" &&
                      c.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => setForm(c.id)}
                          className="rounded border px-3 py-1 text-xs text-brand-600"
                        >
                          Hire & onboard
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_OPENINGS.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-brand-600" />
                </div>
                <Badge status={j.status} />
              </div>
              <h3 className="font-semibold text-slate-900">{j.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {j.department} · {j.location}
              </p>
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {j.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {j.openings} opening{j.openings > 1 ? "s" : ""}
                </span>
                <span>Posted {formatDate(j.postedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

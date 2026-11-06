import React from 'react';
import { ProjectItem, ProjectTask, CostSummary, CostConfiguration, NavigationSection } from '../types';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
  CreditCard,
  Plus,
} from 'lucide-react';

interface OverviewDashboardProps {
  projects: ProjectItem[];
  tasks: ProjectTask[];
  summary: CostSummary;
  config: CostConfiguration;
  onNavigate: (section: NavigationSection) => void;
  onOpenNewProject: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  projects,
  tasks,
  summary,
  config,
  onNavigate,
  onOpenNewProject,
}) => {
  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalBudgetFjd = projects.reduce((acc, p) => acc + p.budgetFjd, 0);
  const totalSpentFjd = projects.reduce((acc, p) => acc + p.actualSpendFjd, 0);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length || 1;
  const overallTaskProgress = Math.round((completedTasks / totalTasks) * 100);

  // Status badge styling per Pacific & Reef guidelines
  const getStatusBadge = (status: ProjectItem['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef5fb] text-[#164B91] border border-[#b7d1ec]">
            In Progress
          </span>
        );
      case 'review':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f5f0fe] text-[#6941A5] border border-[#d7c6f4]">
            Review
          </span>
        );
      case 'planning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fff3e7] text-[#bd6507] border border-[#ffd2a7]">
            Planning
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e9f8f5] text-[#127d77] border border-[#b2e0da]">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#19A7A0] font-heading">
            Your workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24344D] tracking-tight font-heading mt-0.5">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#748198] mt-0.5">
            A unified view of active client deliveries, cloud economics, sprint progress and MYOB accounting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#164B91] hover:bg-[#123e78] text-white shadow-xs transition-all cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* 3 Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('projects')}
          className="bg-white border border-[#dcebe9] hover:border-[#164B91] hover:bg-[#f6fafd] p-4 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-xl block mb-1.5 text-[#164B91]">▣</span>
          <div className="text-sm font-bold text-[#22334e] group-hover:text-[#164B91] font-heading flex items-center justify-between">
            <span>Manage Projects</span>
            <span className="text-xs text-[#164B91]">→</span>
          </div>
          <div className="text-[11px] text-[#748198] mt-0.5">
            Deliverable backlogs, client timelines & budget tracking
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('bookkeeping')}
          className="bg-white border border-[#dcebe9] hover:border-[#19A7A0] hover:bg-[#f6fafd] p-4 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-xl block mb-1.5 text-[#19A7A0]">▥</span>
          <div className="text-sm font-bold text-[#22334e] group-hover:text-[#19A7A0] font-heading flex items-center justify-between">
            <span>Open Bookkeeping</span>
            <span className="text-xs text-[#19A7A0]">→</span>
          </div>
          <div className="text-[11px] text-[#748198] mt-0.5">
            MYOB Invoicing, Fiji 15% VAT, FNPF Payroll & General Ledger
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('timeline')}
          className="bg-white border border-[#dcebe9] hover:border-[#6941A5] hover:bg-[#f6fafd] p-4 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-xl block mb-1.5 text-[#6941A5]">▤</span>
          <div className="text-sm font-bold text-[#22334e] group-hover:text-[#6941A5] font-heading flex items-center justify-between">
            <span>View Architecture</span>
            <span className="text-xs text-[#6941A5]">→</span>
          </div>
          <div className="text-[11px] text-[#748198] mt-0.5">
            6-Week 200h blueprint & Australia East ~48ms co-location
          </div>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Projects (span 7 or 8) */}
        <div className="lg:col-span-8 bg-white border border-[#dcebe9] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#dfe9ef] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#22334e] font-heading">
                Current Projects
              </h2>
              <p className="text-xs text-[#748198]">
                Real-time milestone completion and client status
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-[#164B91] hover:underline cursor-pointer font-heading"
            >
              View all ({projects.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-[#dcebe9] rounded-xl bg-[#fbfdfd] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf4f8] text-[#164B91] flex items-center justify-center mx-auto text-xl font-mono">
                  ▣
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#22334e] font-heading">
                    No active projects yet
                  </h3>
                  <p className="text-xs text-[#748198] max-w-sm mx-auto mt-0.5">
                    Start clean by creating your first client project deliverable or agile sprint.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  className="px-4 py-2 rounded-lg bg-[#164B91] text-white text-xs font-bold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  + Add First Project
                </button>
              </div>
            ) : (
              projects.slice(0, 3).map((p) => {
                const projectTasks = tasks.filter((t) => t.projectId === p.id);
                const doneCount = projectTasks.filter((t) => t.status === 'done').length;
                const totalCount = projectTasks.length || 1;
                const computedProgress = Math.round((doneCount / totalCount) * 100);

                return (
                  <div
                    key={p.id}
                    className="border border-[#dfe9ef] rounded-xl p-4 hover:border-[#164B91]/30 transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-[#22334e] font-heading">
                          {p.name}
                        </div>
                        <div className="text-xs text-[#748198] mt-0.5">
                          {p.client} · {p.description || 'Cloud and AI engineering'}
                        </div>
                      </div>
                      {getStatusBadge(p.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8190a4] mt-3 mb-1.5">
                      <span>Milestone progress</span>
                      <span className="font-bold text-[#164B91] font-mono">{computedProgress}%</span>
                    </div>

                    <div className="h-1.5 bg-[#dff1ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#164B91] rounded-full transition-all duration-500"
                        style={{ width: `${computedProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: At a Glance + Live Financial Signal */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#dcebe9] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#dfe9ef] pb-3">
              <h2 className="text-base font-bold text-[#22334e] font-heading">
                At a Glance
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e9f8f5] text-[#127d77] border border-[#b2e0da]">
                Pacific Portal
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#e9f5f3] text-[#19A7A0] flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-[#22334e] font-heading">
                    Project delivery
                  </div>
                  <p className="text-[11px] text-[#748198] mt-0.5 leading-relaxed">
                    Review active sprint backlogs, pending code reviews and milestone timelines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#f1eafb] text-[#6941A5] flex items-center justify-center shrink-0 font-bold text-xs">
                  ▤
                </div>
                <div>
                  <div className="text-xs font-bold text-[#22334e] font-heading">
                    Architecture planning
                  </div>
                  <p className="text-[11px] text-[#748198] mt-0.5 leading-relaxed">
                    6-week 200h reference architecture with Australia East co-location (~48ms latency).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#fff2e4] text-[#d77c12] flex items-center justify-center shrink-0 font-bold text-xs">
                  ＄
                </div>
                <div>
                  <div className="text-xs font-bold text-[#22334e] font-heading">
                    Finance workspace
                  </div>
                  <p className="text-[11px] text-[#748198] mt-0.5 leading-relaxed">
                    Fiji FNPF (8%/10%) payroll, 15% VAT invoices, and 3.5% card FX fee hedging.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[#f8fafc] border-l-3 border-[#19A7A0] text-xs text-[#63728a] leading-relaxed">
              <strong>Exchange reference:</strong> $1 USD = {config.exchangeRateFJD} FJD. Mid-market benchmark for foreign cloud vendor budgeting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

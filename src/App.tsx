import React, { useState, useMemo } from 'react';
import {
  CostConfiguration,
  PresetType,
  NavigationSection,
  ProjectItem,
  ProjectTask,
  PayrollEmployee,
  PayrollRunRecord,
  InvoiceRecord,
  ExpenseRecord,
} from './types';
import {
  INITIAL_CONFIG,
  PRESET_CONFIGS,
  calculateCostSummary,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RUNS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
} from './constants';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { ControlsSidebar } from './components/ControlsSidebar';
import { MonthlyChart } from './components/MonthlyChart';
import { BreakdownTable } from './components/BreakdownTable';
import { ProjectTimeline } from './components/ProjectTimeline';
import { HRMS } from './components/HRMS';
import { ProjectManagement } from './components/ProjectManagement';
import { BookKeeping } from './components/BookKeeping';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SettingsView } from './components/SettingsView';
import { LoginGate } from './components/LoginGate';
import { PartnerAccessModal } from './components/PartnerAccessModal';
import { safeStorage } from './utils/storage';
import {
  Menu,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingDown,
  Layers,
  Share2,
  LogOut,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('digital_nomad_authenticated') === 'true';
  });
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active navigation section: overview, projects, timeline, bookkeeping, cost_planner, insights, settings
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [activeBookkeepingTab, setActiveBookkeepingTab] = useState<
    'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run'
  >('payroll');

  // Core Cost Configuration
  const [config, setConfig] = useState<CostConfiguration>(INITIAL_CONFIG);

  // Projects & Tasks State
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);

  // Book-Keeping & Payroll State
  const [employees, setEmployees] = useState<PayrollEmployee[]>(INITIAL_EMPLOYEES);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRunRecord[]>(INITIAL_PAYROLL_RUNS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);

  // Compute active preset
  const activePreset: PresetType = useMemo(() => {
    for (const key of Object.keys(PRESET_CONFIGS) as Array<Exclude<PresetType, 'custom'>>) {
      const p = PRESET_CONFIGS[key].config;
      if (
        config.supabaseComputeTier === p.supabaseComputeTier &&
        config.supabasePitrEnabled === p.supabasePitrEnabled &&
        config.supabaseOverageGb === p.supabaseOverageGb &&
        config.azureComputeTier === p.azureComputeTier &&
        config.claudePlanM212 === p.claudePlanM212 &&
        config.freeDevTierM1 === p.freeDevTierM1
      ) {
        return key;
      }
    }
    return 'custom';
  }, [config]);

  // Compute real-time cost summary
  const summary = useMemo(() => {
    return calculateCostSummary(config);
  }, [config]);

  // Config Handlers
  const handleConfigChange = (updated: Partial<CostConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPreset = (presetKey: Exclude<PresetType, 'custom'>) => {
    const preset = PRESET_CONFIGS[presetKey];
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
  };

  const handleResetDefaults = () => {
    setConfig(INITIAL_CONFIG);
  };

  const handleLogout = () => {
    safeStorage.removeItem('digital_nomad_authenticated');
    setIsAuthenticated(false);
  };

  // Project Management Handlers
  const handleAddProject = (newProj: Omit<ProjectItem, 'id'>) => {
    const id = `proj-${Date.now()}`;
    setProjects((prev) => [
      {
        ...newProj,
        id,
      },
      ...prev,
    ]);
  };

  const handleAddTask = (newTask: Omit<ProjectTask, 'id'>) => {
    const id = `task-${Date.now()}`;
    setTasks((prev) => [
      {
        ...newTask,
        id,
      },
      ...prev,
    ]);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: t.status === 'done' ? 'in_progress' : 'done' } : t
      )
    );
  };

  // Book-Keeping & Payroll Handlers
  const handleAddEmployee = (newEmp: Omit<PayrollEmployee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    setEmployees((prev) => [...prev, { ...newEmp, id }]);
  };

  const handleRunPayroll = () => {
    const totalGross = employees.reduce((acc, e) => acc + e.grossPayFjd, 0);
    const totalFnpfEmp = employees.reduce((acc, e) => acc + e.grossPayFjd * e.fnpfEmployeeRate, 0);
    const totalFnpfCo = employees.reduce((acc, e) => acc + e.grossPayFjd * e.fnpfEmployerRate, 0);
    const totalPaye = employees.reduce((acc, e) => acc + e.grossPayFjd * e.payeTaxRate, 0);
    const totalNet = totalGross - totalFnpfEmp - totalPaye;

    const newRun: PayrollRunRecord = {
      id: `pr-${Date.now()}`,
      payPeriod: 'November 2026',
      runDate: new Date().toISOString().split('T')[0],
      totalGrossFjd: totalGross,
      totalFnpfEmployeeFjd: totalFnpfEmp,
      totalFnpfEmployerFjd: totalFnpfCo,
      totalPayeTaxFjd: totalPaye,
      totalNetPayFjd: totalNet,
      employeeCount: employees.length,
      status: 'paid',
    };

    setPayrollRuns((prev) => [newRun, ...prev]);
  };

  const handleAddInvoice = (newInv: Omit<InvoiceRecord, 'id'>) => {
    const id = `inv-${Date.now()}`;
    setInvoices((prev) => [
      {
        ...newInv,
        id,
      },
      ...prev,
    ]);
  };

  const handleMarkInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'paid' } : inv))
    );
  };

  const handleAddExpense = (newExp: Omit<ExpenseRecord, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [
      {
        ...newExp,
        id,
      },
      ...prev,
    ]);
  };

  const handleSyncCloudCosts = () => {
    // Current M2-12 baseline items from cost summary
    const m2 = summary.months[1] || summary.months[0];
    const today = new Date().toISOString().split('T')[0];

    const synced: ExpenseRecord[] = [
      {
        id: `exp-claude-${Date.now()}`,
        date: today,
        vendor: 'Anthropic PBC',
        category: 'ai_subscriptions',
        description: `Claude Max (${config.claudePlanM212}) Plan with $100 API credits`,
        amountFjd: m2.claudeFjd,
        amountUsd: m2.claudeUsd,
        vatDeductible: true,
        paymentMethod: 'fiji_card',
        isSyncedFromPlanner: true,
      },
      {
        id: `exp-supabase-${Date.now()}`,
        date: today,
        vendor: 'Supabase Inc',
        category: 'cloud_hosting',
        description: `Supabase Pro (${config.supabaseComputeTier}) Australia East`,
        amountFjd: m2.supabaseFjd,
        amountUsd: m2.supabaseUsd,
        vatDeductible: true,
        paymentMethod: 'fiji_card',
        isSyncedFromPlanner: true,
      },
      {
        id: `exp-azure-${Date.now()}`,
        date: today,
        vendor: 'Microsoft Azure',
        category: 'cloud_hosting',
        description: `Azure Compute (${config.azureComputeTier}) Sydney`,
        amountFjd: m2.azureFjd,
        amountUsd: m2.azureUsd,
        vatDeductible: true,
        paymentMethod: 'fiji_card',
        isSyncedFromPlanner: true,
      },
    ];

    if (config.fxSpreadEnabled) {
      synced.push({
        id: `exp-fx-${Date.now()}`,
        date: today,
        vendor: 'Fiji Commercial Bank',
        category: 'software',
        description: '3.5% Foreign Card Conversion Fee on USD Cloud Stack',
        amountFjd: m2.fxFeeFjd,
        amountUsd: m2.fxFeeUsd,
        vatDeductible: false,
        paymentMethod: 'fiji_card',
        isSyncedFromPlanner: true,
      });
    }

    setExpenses((prev) => [...synced, ...prev]);
  };

  // Partner authentication gate
  if (!isAuthenticated) {
    return <LoginGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  const unpaidInvoiceCount = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#24344D] flex selection:bg-[#19A7A0]/20 font-sans">
      {/* PARTNER LIVE ACCESS MODAL */}
      <PartnerAccessModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {/* EXECUTIVE NAVIGATION SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        currentBookkeepingTab={activeBookkeepingTab}
        onSelectBookkeepingTab={setActiveBookkeepingTab}
        config={config}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        projectCount={projects.length}
        unpaidInvoiceCount={unpaidInvoiceCount}
        employeeCount={employees.length}
        expenseCount={expenses.length}
      />

      {/* MAIN VIEWPORT (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* TOPBAR — Ocean Blue (#194b91) height 76px matching digital_nomad_dashboard.html */}
        <header className="h-[76px] bg-[#194b91] text-white sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-sm font-semibold text-white flex items-center gap-2 font-heading">
              <span>Digital Nomad</span>
              <span className="text-[#afc9ed]">/</span>
              <b className="text-white font-bold">
                {activeSection === 'overview' && 'Overview'}
                {activeSection === 'projects' && 'Projects'}
                {activeSection === 'timeline' && 'Architecture'}
                {activeSection === 'hrms' && 'HRMS'}
                {activeSection === 'bookkeeping' && 'Bookkeeping'}
                {activeSection === 'cost_planner' && 'Cloud & AI Costs'}
                {activeSection === 'insights' && 'FX Insights'}
                {activeSection === 'settings' && 'Settings'}
              </b>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/25">
              <span>FX reference* · 1 USD = {config.exchangeRateFJD} FJD</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-[#f28c28] text-[#222a38] hover:bg-[#e07c1b] shadow-2xs transition-all cursor-pointer font-heading"
            >
              <span>↗ Partner Link</span>
            </button>

            <div
              className="w-9 h-9 rounded-full bg-white/15 border border-white/40 flex items-center justify-center font-bold text-xs text-white"
              title="Digital Nomad Operations"
            >
              DN
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-red-600/90 transition-all cursor-pointer font-heading"
              title="Log out of Digital Nomad"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 w-full max-w-[1460px] mx-auto">
          {/* SECTION 0: DASHBOARD OVERVIEW */}
          {activeSection === 'overview' && (
            <OverviewDashboard
              projects={projects}
              tasks={tasks}
              summary={summary}
              config={config}
              onNavigate={(sec) => setActiveSection(sec)}
              onOpenNewProject={() => setActiveSection('projects')}
            />
          )}

          {/* SECTION 1: CLOUD & AI COST PLANNER */}
          {activeSection === 'cost_planner' && (
            <div className="space-y-6">
              <KpiCards summary={summary} config={config} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4">
                  <ControlsSidebar
                    config={config}
                    onChange={handleConfigChange}
                    onApplyPreset={handleApplyPreset}
                    activePreset={activePreset}
                    onResetDefaults={handleResetDefaults}
                  />
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <MonthlyChart summary={summary} config={config} />
                  <BreakdownTable summary={summary} config={config} />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: 6-WEEK ARCHITECTURE TIMELINE */}
          {activeSection === 'timeline' && <ProjectTimeline />}

          {/* SECTION 2b: HRMS HIRE-TO-EXIT WORKSPACE */}
          {activeSection === 'hrms' && <HRMS />}

          {/* SECTION 3: FX & ARBITRAGE INSIGHTS */}
          {activeSection === 'insights' && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-bold text-slate-900">
                    Digital Nomad · Cost Optimization & Arbitrage Insights
                  </h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strategic financial rationale behind the Claude Max 5x subscription, Fiji bank FX card fees, Supabase vs AWS infrastructure cost differentials, and zero-dollar Month 1 dev setups.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insight 1: Claude Max 5x */}
                <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-700" />
                      Claude Max 5x: The $100/mo API Credit Arbitrage (Purple)
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      High ROI
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under Anthropic’s current Claude Max 5x tier ($100/month), subscribers receive{' '}
                    <strong className="text-slate-900">$100/month in free Claude Platform API credits</strong>.
                    For a cloud application that uses Claude 3.7 or 3.5 Sonnet for automated document parsing, summarization, or chat interfaces, this effectively eliminates separate token invoices up to $100/month.
                  </p>
                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-xs font-mono text-slate-700">
                    <div className="text-purple-900 font-bold mb-1">Annual Impact:</div>
                    <div>11 Months × $100 = <strong className="text-slate-900">$1,100.00 USD ($2,526 FJD)</strong> in free platform credits included.</div>
                  </div>
                </div>

                {/* Insight 2: Fiji Bank FX Spread */}
                <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-orange-600" />
                      Fiji Bank Foreign Card Conversion (+3.5%) (Orange)
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                      Banking
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When Fiji businesses pay US cloud vendors (Anthropic, Supabase, Microsoft) using local Visa/Mastercard debit or credit cards (ANZ, BSP, Westpac Fiji, Bred Bank), banks apply an international currency conversion markup typically averaging 3.0% to 3.5%.
                  </p>
                  <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-xs font-mono text-slate-700">
                    <div className="text-orange-900 font-bold mb-1">Why enable FX Toggle:</div>
                    <div>Avoid budgeting shortfalls. On a $2,380 USD project, the 3.5% fee adds <strong className="text-slate-900">$187.88 FJD</strong> in real bank charges.</div>
                  </div>
                </div>

                {/* Insight 3: Month 1 Free Dev Optimization */}
                <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-blue-600" />
                      Month 1 Local Docker & Free F1 Strategy (Blue)
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      Lean MVP
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    During Weeks 1 through 5 of the 6-week build timeline, database schemas and microservices can run entirely in Supabase CLI local Docker containers and Azure Free Tier (F1).
                  </p>
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs font-mono text-slate-700">
                    <div className="text-blue-900 font-bold mb-1">Cash Outlay Reduction:</div>
                    <div>Only Claude Pro ($20 USD / ~$46 FJD) is needed for architecture & coding in M1, saving $105.00 USD ($245 FJD) of premature cloud spend.</div>
                  </div>
                </div>

                {/* Insight 4: Supabase vs AWS */}
                <div className="bg-white border border-amber-900/20 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-900" />
                      Supabase Pro vs AWS RDS + Cognito Stack (Brown)
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      Infrastructure
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A comparable AWS stack (Aurora Serverless v2 PostgreSQL + AWS Cognito User Pools + S3 + KMS) easily averages $160–$250 USD/month. Supabase Small Compute at $30 USD/month bundles full RLS, Realtime WebSockets, Storage, and Supavisor pooling.
                  </p>
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 text-xs font-mono text-slate-700">
                    <div className="text-amber-900 font-bold mb-1">Estimated Annual Savings:</div>
                    <div>Saves over <strong className="text-slate-900">$1,500+ USD (~$3,400+ FJD)</strong> per year without sacrificing enterprise Postgres security.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PROJECTS MANAGEMENT */}
          {activeSection === 'projects' && (
            <ProjectManagement
              projects={projects}
              tasks={tasks}
              onAddProject={handleAddProject}
              onAddTask={handleAddTask}
              onToggleTaskStatus={handleToggleTaskStatus}
              config={config}
            />
          )}

          {/* SECTION 5: BOOK-KEEPING & MYOB SUITE */}
          {activeSection === 'bookkeeping' && (
            <BookKeeping
              employees={employees}
              payrollRuns={payrollRuns}
              invoices={invoices}
              expenses={expenses}
              onAddEmployee={handleAddEmployee}
              onRunPayroll={handleRunPayroll}
              onAddInvoice={handleAddInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
              onAddExpense={handleAddExpense}
              onSyncCloudCosts={handleSyncCloudCosts}
              config={config}
              costSummary={summary}
              activeTab={activeBookkeepingTab}
              onTabChange={setActiveBookkeepingTab}
            />
          )}

          {/* SECTION 6: SETTINGS & PREFERENCES */}
          {activeSection === 'settings' && (
            <SettingsView
              config={config}
              onUpdateExchangeRate={(rate) => handleConfigChange({ exchangeRateFJD: rate })}
              onToggleFxSpread={(enabled) => handleConfigChange({ fxSpreadEnabled: enabled })}
            />
          )}
        </main>

        {/* FOOTER — Subtle Pacific border & typography */}
        <footer className="border-t border-[#D9F1EC] bg-white py-4 px-6 text-xs text-[#24344D]/75 mt-auto font-sans">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#164B91] font-heading">Digital Nomad</span>
              <span aria-hidden="true" className="text-[#19A7A0]">·</span>
              <span className="font-medium text-[#24344D]">Pacific Operations & Financial Portal</span>
            </div>
            <div className="font-mono text-[#24344D]/70">
              FX Rate: $1 USD = <span className="font-bold text-[#164B91]">{config.exchangeRateFJD} FJD</span> (FNPF & 15% VAT Active)
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

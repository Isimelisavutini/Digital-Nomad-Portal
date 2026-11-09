import React, { useState, useMemo, lazy, Suspense, Activity } from 'react';
import {
  CostConfiguration,
  PresetType,
  NavigationSection,
  ProjectItem,
  ProjectTask,
  PayrollEmployee,
  InvoiceRecord,
  ExpenseRecord,
} from './types';
import {
  INITIAL_CONFIG,
  PRESET_CONFIGS,
  calculateCostSummary,
} from './constants';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { ControlsSidebar } from './components/ControlsSidebar';
import { MonthlyChart } from './components/MonthlyChart';
import { BreakdownTable } from './components/BreakdownTable';
import { ProjectTimeline } from './components/ProjectTimeline';
import { ProjectManagement } from './components/ProjectManagement';
import { BookKeeping } from './components/BookKeeping';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SettingsView } from './components/SettingsView';
import { LoginGate } from './components/LoginGate';
import { PartnerAccessModal } from './components/PartnerAccessModal';
import type { NavSection as HrSection } from '../hrms/src/types';
import { NAV as HR_NAV } from '../hrms/src/components/ui';
import { useBusiness, ConnectionStatus } from './data/BusinessProvider';
import { supabase } from './data/supabase';
import { toPayrollEmployee } from './data/model';
import { todayFiji } from './data/workflows';
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

const HrWorkspace = lazy(() => import('./components/HrWorkspace'));

export default function App() {
  const business = useBusiness();
  const { state, mutate } = business;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('digital_nomad_authenticated') === 'true';
  });
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active navigation section: overview, projects, timeline, bookkeeping, cost_planner, insights, settings
  const [activeHrSection, setActiveHrSection] = useState<HrSection>('dashboard');
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [activeBookkeepingTab, setActiveBookkeepingTab] = useState<
    'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run'
  >('payroll');

  const config = state.settings[0] ?? INITIAL_CONFIG;
  const { projects, tasks, payroll_runs: payrollRuns, invoices, expenses } = state;
  const employees = state.employees.map(toPayrollEmployee);

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

  const handleConfigChange = (updated: Partial<CostConfiguration>) => mutate(current => ({ ...current, settings: [{ ...current.settings[0], ...updated, id: 'config' }] }));
  const handleApplyPreset = (presetKey: Exclude<PresetType, 'custom'>) => handleConfigChange(PRESET_CONFIGS[presetKey].config);
  const handleResetDefaults = () => handleConfigChange(INITIAL_CONFIG);
  const handleLogout = () => {
    if (supabase) { void supabase.auth.signOut(); return; }
    safeStorage.removeItem('digital_nomad_authenticated'); setIsAuthenticated(false);
  };
  const handleAddProject = (project: Omit<ProjectItem, 'id'>) => mutate(current => ({ ...current, projects: [...current.projects, { ...project, id: crypto.randomUUID() }] }));
  const handleAddTask = (task: Omit<ProjectTask, 'id'>) => mutate(current => ({ ...current, tasks: [...current.tasks, { ...task, id: crypto.randomUUID() }] }));
  const handleToggleTaskStatus = (id: string) => mutate(current => ({ ...current, tasks: current.tasks.map(task => task.id === id ? { ...task, status: task.status === 'done' ? 'in_progress' : 'done' } : task) }));
  const handleAddInvoice = (invoice: Omit<InvoiceRecord, 'id'>) => mutate(current => ({ ...current, invoices: [...current.invoices, { ...invoice, id: crypto.randomUUID() }] }));
  const handleMarkInvoicePaid = (id: string) => mutate(current => ({ ...current, invoices: current.invoices.map(invoice => invoice.id === id ? { ...invoice, status: 'paid' } : invoice) }));
  const handleAddExpense = (expense: Omit<ExpenseRecord, 'id'>) => mutate(current => ({ ...current, expenses: [...current.expenses, { ...expense, id: crypto.randomUUID() }] }));
  const handleSyncCloudCosts = () => mutate(current => {
    const settings = current.settings[0] ?? INITIAL_CONFIG;
    const costs = calculateCostSummary(settings).months[1];
    const period = todayFiji().slice(0, 7);
    const amounts = [
      { key: 'claude', vendor: 'Anthropic PBC', category: 'ai_subscriptions' as const, usd: costs.claudeUsd, fjd: costs.claudeFjd },
      { key: 'supabase', vendor: 'Supabase Inc', category: 'cloud_hosting' as const, usd: costs.supabaseUsd, fjd: costs.supabaseFjd },
      { key: 'azure', vendor: 'Microsoft Azure', category: 'cloud_hosting' as const, usd: costs.azureUsd, fjd: costs.azureFjd },
      { key: 'fx', vendor: 'Fiji Commercial Bank', category: 'software' as const, usd: costs.fxFeeUsd, fjd: costs.fxFeeFjd },
    ];
    const synced = amounts.map(amount => ({ id: `cloud-${period}-${amount.key}`, date: todayFiji(), vendor: amount.vendor, category: amount.category, description: `${period} planned cloud cost: ${amount.key}`, amountFjd: amount.fjd, amountUsd: amount.usd, vatDeductible: amount.key !== 'fx', paymentMethod: 'fiji_card' as const, isSyncedFromPlanner: true, syncPeriod: period }));
    return { ...current, expenses: [...current.expenses.filter(expense => !synced.some(item => item.id === expense.id)), ...synced] };
  });

  // Partner authentication gate
  if (!business.connected && !isAuthenticated) {
    return <LoginGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  const unpaidInvoiceCount = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#24344D] flex selection:bg-[#19A7A0]/20 font-sans">
      {/* PARTNER LIVE ACCESS MODAL */}
      <PartnerAccessModal
        databaseConnected={business.connected}
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {/* EXECUTIVE NAVIGATION SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        currentHrSection={activeHrSection}
        onSelectHrSection={setActiveHrSection}
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
              aria-label="Open navigation"
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
                {activeSection === 'bookkeeping' && 'Bookkeeping'}
                {activeSection === 'cost_planner' && 'Cloud & AI Costs'}
                {activeSection === 'insights' && 'FX Insights'}
                {activeSection === 'settings' && 'Settings'}
                {activeSection === 'hrms' && `HR / ${activeHrSection === 'settings' ? 'HR Settings' : HR_NAV.find(item => item.id === activeHrSection)?.label}`}
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
          <ConnectionStatus />
          <Activity mode={activeSection === 'hrms' ? 'visible' : 'hidden'}>
            <Suspense fallback={<p role="status">Loading HR Management…</p>}>
              <HrWorkspace section={activeHrSection} onNavigate={setActiveHrSection} />
            </Suspense>
          </Activity>
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

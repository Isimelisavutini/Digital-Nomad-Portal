export type CurrencyMode = 'FJD' | 'USD' | 'DUAL';

export type ClaudePlanM212 = 'pro' | 'max_5x' | 'max_20x';

export type SupabaseComputeTier = 'micro' | 'small' | 'medium' | 'large';

export type AzureComputeTier = 'serverless' | 'lean_b1' | 'standard_s1' | 'highscale_p1v3';

export type PresetType = 'lean' | 'standard' | 'highscale' | 'custom';

export type ProjectScope = 'mvp' | 'standard' | 'enterprise';

export type NavigationSection =
  | 'hrms'
  | 'overview'
  | 'projects'
  | 'timeline'
  | 'bookkeeping'
  | 'cost_planner'
  | 'insights'
  | 'settings';

export interface CostConfiguration {
  exchangeRateFJD: number; // default 2.2554
  fxSpreadEnabled: boolean; // default true (3.5% card fee)
  fxSpreadRate: number; // default 0.035
  currencyMode: CurrencyMode;

  claudePlanM212: ClaudePlanM212;
  supabaseComputeTier: SupabaseComputeTier;
  supabasePitrEnabled: boolean;
  supabaseOverageGb: number;
  azureComputeTier: AzureComputeTier;

  freeDevTierM1: boolean; // Month 1 free dev optimization
}

export interface MonthlyCostItem {
  month: number;
  monthLabel: string;
  claudeUsd: number;
  supabaseUsd: number;
  azureUsd: number;
  subtotalUsd: number;
  fxFeeUsd: number;
  totalUsd: number;

  claudeFjd: number;
  supabaseFjd: number;
  azureFjd: number;
  subtotalFjd: number;
  fxFeeFjd: number;
  totalFjd: number;

  cumulativeUsd: number;
  cumulativeFjd: number;
}

export interface CostSummary {
  month1Usd: number;
  month1Fjd: number;
  month1FjdWithFx: number;

  monthlyRunRateUsd: number; // Months 2-12
  monthlyRunRateFjd: number;
  monthlyRunRateFjdWithFx: number;

  annualAverageUsd: number;
  annualAverageFjd: number;
  annualAverageFjdWithFx: number;

  grandTotalUsd: number;
  grandTotalFjdMidMarket: number;
  grandTotalFjdWithFx: number;

  claudeTotalUsd: number;
  claudeTotalFjd: number;
  supabaseTotalUsd: number;
  supabaseTotalFjd: number;
  azureTotalUsd: number;
  azureTotalFjd: number;
  fxTotalUsd: number;
  fxTotalFjd: number;

  months: MonthlyCostItem[];
}

export interface TimelineDeliverable {
  id: string;
  title: string;
  hours: number;
  details: string;
  category: 'architecture' | 'database' | 'backend' | 'frontend' | 'security' | 'devops';
  completed: boolean;
}

export interface TimelineWeek {
  weekNumber: string;
  title: string;
  totalHours: number;
  phase: string;
  focus: string;
  deliverables: TimelineDeliverable[];
}

/* =========================================================================
   PROJECT MANAGEMENT TYPES
   ========================================================================= */

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ProjectItem {
  id: string;
  name: string;
  client: string;
  category: string;
  status: ProjectStatus;
  budgetFjd: number;
  budgetUsd: number;
  actualSpendFjd: number;
  actualSpendUsd: number;
  deadline: string;
  progressPercent: number;
  team: string[];
  description: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  dueDate: string;
}

/* =========================================================================
   BOOK-KEEPING & MYOB / PAYROLL TYPES
   ========================================================================= */

export type BookkeepingTab = 'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run';

export interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  tinNumber: string; // Fiji Tax Identification Number
  fnpfNumber: string; // Fiji National Provident Fund #
  payType: 'monthly' | 'hourly' | 'contractor';
  grossPayFjd: number;
  fnpfEmployeeRate: number; // default 0.08 (8%)
  fnpfEmployerRate: number; // default 0.10 (10%)
  payeTaxRate: number; // Fiji FRCS PAYE bracket (e.g. 0.00 to 0.20)
  bankName: string;
  accountNumber: string;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface PayrollRunRecord {
  id: string;
  payPeriod: string;
  runDate: string;
  totalGrossFjd: number;
  totalFnpfEmployeeFjd: number;
  totalFnpfEmployerFjd: number;
  totalPayeTaxFjd: number;
  totalNetPayFjd: number;
  employeeCount: number;
  status: 'draft' | 'processed' | 'paid';
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceFjd: number;
  totalFjd: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotalFjd: number;
  vatRate: number; // Fiji VAT: 0.15 (15%)
  vatAmountFjd: number;
  totalFjd: number;
  totalUsd: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  vendor: string;
  category: 'cloud_hosting' | 'ai_subscriptions' | 'software' | 'office' | 'travel' | 'contractors';
  description: string;
  amountFjd: number;
  amountUsd: number;
  vatDeductible: boolean;
  paymentMethod: 'fiji_card' | 'bank_transfer' | 'petty_cash';
  isSyncedFromPlanner?: boolean;
}

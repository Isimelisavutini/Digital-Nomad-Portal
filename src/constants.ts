import {
  CostConfiguration,
  CostSummary,
  MonthlyCostItem,
  TimelineWeek,
  PresetType,
  ProjectScope,
  ProjectItem,
  ProjectTask,
  PayrollEmployee,
  PayrollRunRecord,
  InvoiceRecord,
  ExpenseRecord,
} from './types';

export const DEFAULT_EXCHANGE_RATE_FJD = 2.2554;
export const DEFAULT_FX_SPREAD_RATE = 0.035; // 3.5% bank card fee

export const CLAUDE_PRICING = {
  m1: 20.0, // Fixed Claude Pro for Month 1
  tiers: {
    pro: {
      id: 'pro',
      name: 'Claude Pro Plan',
      monthlyUsd: 20.0,
      description: 'Standard single-user Pro account for initial ideation and architecture prototyping.',
      apiCreditUsd: 0,
    },
    max_5x: {
      id: 'max_5x',
      name: 'Claude Max (5x) + $100 Platform Credit',
      monthlyUsd: 100.0,
      description: '5x higher prompt limits + includes $100/mo in free Claude Platform API credits.',
      apiCreditUsd: 100,
    },
    max_20x: {
      id: 'max_20x',
      name: 'Claude Max (20x) Heavy AI Generation',
      monthlyUsd: 200.0,
      description: 'Maximum concurrency & rapid batch code/content generation for intense sprints.',
      apiCreditUsd: 200,
    },
  },
} as const;

export const SUPABASE_PRICING = {
  baseProUsd: 25.0,
  pitrUsd: 100.0,
  overagePerGbUsd: 0.125,
  tiers: {
    micro: {
      id: 'micro',
      name: 'Micro Compute',
      specs: '1 GB RAM, 2-core ARM',
      netAddUsd: 0.0,
      totalUsd: 25.0, // $25 base + $0 net
      description: 'Covered fully by $10/mo compute credit. Great for lean MVP & dev.',
    },
    small: {
      id: 'small',
      name: 'Small Compute (Recommended)',
      specs: '2 GB RAM, 2-core ARM',
      netAddUsd: 5.0,
      totalUsd: 30.0, // $25 base + $5 net
      description: 'Upgraded memory for high connection pools and low latency queries.',
    },
    medium: {
      id: 'medium',
      name: 'Medium Compute',
      specs: '4 GB RAM, 2-core ARM',
      netAddUsd: 50.0,
      totalUsd: 75.0, // $25 base + $50 net
      description: 'Dedicated compute for heavy indexing, background jobs & pgvector.',
    },
    large: {
      id: 'large',
      name: 'Large Compute',
      specs: '8 GB RAM, 4-core ARM',
      netAddUsd: 100.0,
      totalUsd: 125.0, // $25 base + $100 net
      description: 'High concurrency enterprise database with 100,000+ active MAUs.',
    },
  },
} as const;

export const AZURE_PRICING = {
  tiers: {
    serverless: {
      id: 'serverless',
      name: 'Serverless Functions Only',
      specs: 'Consumption plan + Key Vault + Monitor',
      monthlyUsd: 2.0,
      description: '1M free monthly executions. Best for low-traffic scheduled background tasks.',
    },
    lean_b1: {
      id: 'lean_b1',
      name: 'Lean — Linux Basic B1',
      specs: '1 vCPU, 1.75 GB RAM + Functions / Vault',
      monthlyUsd: 15.14,
      breakdown: '$13.14 B1 + $2.00 misc',
      description: 'Dedicated VM instance for lightweight microservices with SSL & custom domains.',
    },
    standard_s1: {
      id: 'standard_s1',
      name: 'Standard — Linux Standard S1',
      specs: '1 vCPU, 1.75 GB RAM, Staging Slots, Auto-scale',
      monthlyUsd: 75.0,
      breakdown: '$69.35 S1 + $5.65 misc & App Insights',
      description: 'Production-ready with blue/green deployment slots, automated scaling & SLA.',
    },
    highscale_p1v3: {
      id: 'highscale_p1v3',
      name: 'High-Scale — Linux Premium P1v3',
      specs: '2 vCPU, 8 GB RAM, Ultra SSD, Dedicated vNet',
      monthlyUsd: 140.0,
      breakdown: '$124.10 P1v3 + $15.90 misc & Monitor',
      description: 'Enterprise grade compute for high throughput PDF rendering & microservices.',
    },
  },
} as const;

export const PRESET_CONFIGS: Record<Exclude<PresetType, 'custom'>, {
  name: string;
  tagline: string;
  hostingUsdPerMo: number;
  config: Partial<CostConfiguration>;
}> = {
  lean: {
    name: 'Lean Production',
    tagline: '$40.14 USD/mo Hosting + Claude',
    hostingUsdPerMo: 40.14,
    config: {
      supabaseComputeTier: 'micro',
      supabasePitrEnabled: false,
      supabaseOverageGb: 0,
      azureComputeTier: 'lean_b1',
      claudePlanM212: 'max_5x',
      freeDevTierM1: false,
    },
  },
  standard: {
    name: 'Standard Commercial (Default)',
    tagline: '$105.00 USD/mo Hosting + Claude',
    hostingUsdPerMo: 105.0,
    config: {
      supabaseComputeTier: 'small',
      supabasePitrEnabled: false,
      supabaseOverageGb: 0,
      azureComputeTier: 'standard_s1',
      claudePlanM212: 'max_5x',
      freeDevTierM1: false,
    },
  },
  highscale: {
    name: 'High-Scale / Compliance',
    tagline: '$315.00 USD/mo Hosting + Claude',
    hostingUsdPerMo: 315.0,
    config: {
      supabaseComputeTier: 'medium',
      supabasePitrEnabled: true,
      supabaseOverageGb: 0,
      azureComputeTier: 'highscale_p1v3',
      claudePlanM212: 'max_5x',
      freeDevTierM1: false,
    },
  },
};

export const INITIAL_CONFIG: CostConfiguration = {
  exchangeRateFJD: DEFAULT_EXCHANGE_RATE_FJD,
  fxSpreadEnabled: true,
  fxSpreadRate: DEFAULT_FX_SPREAD_RATE,
  currencyMode: 'FJD',

  claudePlanM212: 'max_5x',
  supabaseComputeTier: 'small',
  supabasePitrEnabled: false,
  supabaseOverageGb: 0,
  azureComputeTier: 'standard_s1',

  freeDevTierM1: false,
};

export function calculateCostSummary(config: CostConfiguration): CostSummary {
  const fxMultiplier = config.fxSpreadEnabled ? (1 + config.fxSpreadRate) : 1.0;
  const fxRate = config.fxSpreadEnabled ? config.fxSpreadRate : 0.0;

  // Supabase monthly recurring cost (months 2-12)
  const supabaseComputeCost = SUPABASE_PRICING.tiers[config.supabaseComputeTier].totalUsd;
  const supabasePitrCost = config.supabasePitrEnabled ? SUPABASE_PRICING.pitrUsd : 0;
  const supabaseOverageCost = config.supabaseOverageGb * SUPABASE_PRICING.overagePerGbUsd;
  const supabaseRecurringUsd = supabaseComputeCost + supabasePitrCost + supabaseOverageCost;

  // Azure monthly recurring cost (months 2-12)
  const azureRecurringUsd = AZURE_PRICING.tiers[config.azureComputeTier].monthlyUsd;

  // Claude monthly recurring cost (months 2-12)
  const claudeRecurringUsd = CLAUDE_PRICING.tiers[config.claudePlanM212].monthlyUsd;

  // Month 1 costs
  const claudeM1Usd = CLAUDE_PRICING.m1; // $20.00
  const supabaseM1Usd = config.freeDevTierM1 ? 0.0 : supabaseRecurringUsd;
  const azureM1Usd = config.freeDevTierM1 ? 0.0 : azureRecurringUsd;

  const months: MonthlyCostItem[] = [];

  let cumulativeUsd = 0;
  let cumulativeFjd = 0;

  let claudeTotalUsd = 0;
  let supabaseTotalUsd = 0;
  let azureTotalUsd = 0;
  let fxTotalUsd = 0;

  for (let m = 1; m <= 12; m++) {
    const isM1 = m === 1;
    const cUsd = isM1 ? claudeM1Usd : claudeRecurringUsd;
    const sUsd = isM1 ? supabaseM1Usd : supabaseRecurringUsd;
    const aUsd = isM1 ? azureM1Usd : azureRecurringUsd;

    const subtotalUsd = cUsd + sUsd + aUsd;
    const fxFeeUsd = subtotalUsd * fxRate;
    const totalUsd = subtotalUsd + fxFeeUsd;

    const cFjd = cUsd * config.exchangeRateFJD;
    const sFjd = sUsd * config.exchangeRateFJD;
    const aFjd = aUsd * config.exchangeRateFJD;
    const subtotalFjd = subtotalUsd * config.exchangeRateFJD;
    const fxFeeFjd = subtotalFjd * fxRate;
    const totalFjd = subtotalFjd * fxMultiplier;

    cumulativeUsd += totalUsd;
    cumulativeFjd += totalFjd;

    claudeTotalUsd += cUsd;
    supabaseTotalUsd += sUsd;
    azureTotalUsd += aUsd;
    fxTotalUsd += fxFeeUsd;

    months.push({
      month: m,
      monthLabel: `Month ${m}`,
      claudeUsd: cUsd,
      supabaseUsd: sUsd,
      azureUsd: aUsd,
      subtotalUsd,
      fxFeeUsd,
      totalUsd,

      claudeFjd: cFjd,
      supabaseFjd: sFjd,
      azureFjd: aFjd,
      subtotalFjd,
      fxFeeFjd,
      totalFjd,

      cumulativeUsd,
      cumulativeFjd,
    });
  }

  const month1Item = months[0];
  const month2Item = months[1];

  const grandTotalUsd = cumulativeUsd;
  const grandTotalFjdWithFx = cumulativeFjd;
  const grandTotalFjdMidMarket = (claudeTotalUsd + supabaseTotalUsd + azureTotalUsd) * config.exchangeRateFJD;

  return {
    month1Usd: month1Item.totalUsd,
    month1Fjd: month1Item.subtotalFjd,
    month1FjdWithFx: month1Item.totalFjd,

    monthlyRunRateUsd: month2Item.totalUsd,
    monthlyRunRateFjd: month2Item.subtotalFjd,
    monthlyRunRateFjdWithFx: month2Item.totalFjd,

    annualAverageUsd: grandTotalUsd / 12,
    annualAverageFjd: grandTotalFjdMidMarket / 12,
    annualAverageFjdWithFx: grandTotalFjdWithFx / 12,

    grandTotalUsd,
    grandTotalFjdMidMarket,
    grandTotalFjdWithFx,

    claudeTotalUsd,
    claudeTotalFjd: claudeTotalUsd * config.exchangeRateFJD,
    supabaseTotalUsd,
    supabaseTotalFjd: supabaseTotalUsd * config.exchangeRateFJD,
    azureTotalUsd,
    azureTotalFjd: azureTotalUsd * config.exchangeRateFJD,
    fxTotalUsd,
    fxTotalFjd: grandTotalFjdMidMarket * fxRate,

    months,
  };
}

export function formatCurrencyValue(
  amountFjd: number,
  amountUsd: number,
  mode: CostConfiguration['currencyMode'],
  includeFx = false
): { primary: string; secondary?: string } {
  const fjdFormatted = `$${amountFjd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} FJD`;

  const usdFormatted = `$${amountUsd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;

  if (mode === 'USD') {
    return { primary: usdFormatted };
  }

  if (mode === 'DUAL') {
    return {
      primary: fjdFormatted,
      secondary: usdFormatted,
    };
  }

  return { primary: fjdFormatted };
}

export const TIMELINE_SCOPES: Record<ProjectScope, {
  name: string;
  duration: string;
  hours: number;
  description: string;
  recommendedFor: string;
}> = {
  mvp: {
    name: 'Small MVP',
    duration: '2–3 Weeks',
    hours: 85,
    description: 'Rapid functional prototype with core schema, Supabase Auth, and key API actions.',
    recommendedFor: 'Proof-of-concept, internal pilot validation, demo days',
  },
  standard: {
    name: 'Standard Medium (Reference)',
    duration: '6 Weeks',
    hours: 200,
    description: 'Commercial-grade production build with complete RLS security, Azure microservices, and Australia East co-location.',
    recommendedFor: 'Production launch, customer facing portals, enterprise SaaS',
  },
  enterprise: {
    name: 'Complex Enterprise',
    duration: '10–14 Weeks',
    hours: 400,
    description: 'Multi-tenant architecture with compliance audits, staging slots, automated CI/CD, and custom integrations.',
    recommendedFor: 'Banks, telecom, healthcare, high-compliance organizations',
  },
};

export const STANDARD_6_WEEK_TIMELINE: TimelineWeek[] = [
  {
    weekNumber: 'Week 1',
    title: 'Architecture Blueprint & Schema Security',
    totalHours: 36,
    phase: 'Foundation',
    focus: 'PostgreSQL Relational Design & Cloud CI/CD Provisioning',
    deliverables: [
      {
        id: 'w1-1',
        title: 'Postgres Relational Schema & Migration Pipelines',
        hours: 12,
        details: 'Entity-relationship modeling, foreign keys, indexing strategy, automated Supabase migration scripts.',
        category: 'database',
        completed: true,
      },
      {
        id: 'w1-2',
        title: 'Row Level Security (RLS) Policies & Tenant Isolation',
        hours: 8,
        details: 'Enforce granular auth.uid() tenant boundaries across all tables before writing any client code.',
        category: 'security',
        completed: true,
      },
      {
        id: 'w1-3',
        title: 'Cloud Infrastructure & CI/CD GitHub Actions',
        hours: 16,
        details: 'Azure App Service & Functions provisioning, Key Vault secret management, automated deployment workflows.',
        category: 'devops',
        completed: true,
      },
    ],
  },
  {
    weekNumber: 'Week 2',
    title: 'Identity, Auth & Storage Engine',
    totalHours: 24,
    phase: 'Authentication & SDKs',
    focus: 'Supabase Auth, JWT Custom Claims, Storage Buckets & Auto-generated Types',
    deliverables: [
      {
        id: 'w2-1',
        title: 'Supabase Auth & Custom JWT Claims',
        hours: 10,
        details: 'Configuring OAuth providers, passwordless OTP, and custom role claims injected into auth tokens.',
        category: 'backend',
        completed: false,
      },
      {
        id: 'w2-2',
        title: 'Private File Storage Buckets with RLS',
        hours: 6,
        details: 'Configured signed URLs and strict bucket policies for customer uploads and attachments.',
        category: 'database',
        completed: false,
      },
      {
        id: 'w2-3',
        title: 'Auto-generated TypeScript SDK & Type Sync',
        hours: 8,
        details: 'Automated supabase gen types typescript CLI workflow ensuring 100% end-to-end compile-time safety.',
        category: 'frontend',
        completed: false,
      },
    ],
  },
  {
    weekNumber: 'Weeks 2–4',
    title: 'Azure Backend Microservices & API Orchestration',
    totalHours: 50,
    phase: 'Core Backend',
    focus: 'Linux App Service (.NET / Node.js), Webhook Listeners & External APIs',
    deliverables: [
      {
        id: 'w24-1',
        title: 'High-Throughput Azure App Service (.NET / Node.js)',
        hours: 20,
        details: 'Core business logic API handling transactional workflows, heavy validations, and caching.',
        category: 'backend',
        completed: false,
      },
      {
        id: 'w24-2',
        title: 'Webhook Listeners & Asynchronous Event Processing',
        hours: 14,
        details: 'Azure Functions processing payment webhooks, notification dispatch, and third-party integrations.',
        category: 'backend',
        completed: false,
      },
      {
        id: 'w24-3',
        title: 'PDF & Report Generation Service',
        hours: 10,
        details: 'Headless reporting engine producing branded invoices and financial export documents.',
        category: 'backend',
        completed: false,
      },
      {
        id: 'w24-4',
        title: 'Claude AI API Integration & Prompt Pipelines',
        hours: 6,
        details: 'Utilizing $100/mo Claude Max credits for automated summary drafting, classification, and embeddings.',
        category: 'backend',
        completed: false,
      },
    ],
  },
  {
    weekNumber: 'Weeks 3–5',
    title: 'Frontend UI Views & Realtime Experience',
    totalHours: 50,
    phase: 'User Interface',
    focus: 'React SPA, Realtime Subscriptions & Responsive Workflows',
    deliverables: [
      {
        id: 'w35-1',
        title: 'Core Application Views & Executive Dashboards',
        hours: 22,
        details: 'High-density tabular grids, executive KPI summaries, and responsive desktop/tablet layouts.',
        category: 'frontend',
        completed: false,
      },
      {
        id: 'w35-2',
        title: 'Supabase Realtime PostgreSQL Change Listeners',
        hours: 12,
        details: 'Instant live updates for collaborative feeds and notification badges without polling.',
        category: 'frontend',
        completed: false,
      },
      {
        id: 'w35-3',
        title: 'Client-Side State Management & Offline Resilience',
        hours: 16,
        details: 'Optimistic UI updates, robust error boundaries, query caching, and form input validation.',
        category: 'frontend',
        completed: false,
      },
    ],
  },
  {
    weekNumber: 'Week 6',
    title: 'Hardening, Supavisor Pooling & Production Cutover',
    totalHours: 40,
    phase: 'Launch Readiness',
    focus: 'RLS Security Audit, Supavisor Port 6543, Australia East Latency & Go-Live',
    deliverables: [
      {
        id: 'w6-1',
        title: 'Comprehensive RLS Security & Penetration Audit',
        hours: 10,
        details: 'Full automated security policy matrix audit ensuring no leaked rows across role boundaries.',
        category: 'security',
        completed: false,
      },
      {
        id: 'w6-2',
        title: 'Supavisor Connection Pooling Verification (Port 6543)',
        hours: 8,
        details: 'Verify transaction-mode connection pooler handles 10,000+ concurrent requests without Postgres connection exhaustion.',
        category: 'database',
        completed: false,
      },
      {
        id: 'w6-3',
        title: 'Co-Located Region Latency Audit (Australia East / ap-southeast-2)',
        hours: 8,
        details: 'Benchmark roundtrip ping from Fiji to Sydney Azure / Supabase (~45ms) vs US West (~130ms).',
        category: 'devops',
        completed: false,
      },
      {
        id: 'w6-4',
        title: 'User Acceptance Testing (UAT) & Production Cutover',
        hours: 14,
        details: 'Stakeholder sign-off, live DNS configuration, SSL binding, and final cutover checklist.',
        category: 'devops',
        completed: false,
      },
    ],
  },
];

/* =========================================================================
   INITIAL DATA: PROJECT MANAGEMENT (Clean Workspace)
   ========================================================================= */

export const INITIAL_PROJECTS: ProjectItem[] = [];

export const INITIAL_TASKS: ProjectTask[] = [];

/* =========================================================================
   INITIAL DATA: BOOK-KEEPING & MYOB / PAYROLL (Clean Workspace)
   ========================================================================= */

export const INITIAL_EMPLOYEES: PayrollEmployee[] = [];

export const INITIAL_PAYROLL_RUNS: PayrollRunRecord[] = [];

export const INITIAL_INVOICES: InvoiceRecord[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];


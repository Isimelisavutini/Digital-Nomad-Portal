import { PayrollView } from '../../hrms/src/components/PayrollView';
import React, { useState } from 'react';
import {
  PayrollEmployee,
  PayrollRunRecord,
  InvoiceRecord,
  ExpenseRecord,
  CostConfiguration,
  CostSummary,
  BookkeepingTab,
} from '../types';
import { formatCurrencyValue } from '../constants';
import {
  Calculator,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  RefreshCw,
  Download,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface BookKeepingProps {
  employees: PayrollEmployee[];
  payrollRuns: PayrollRunRecord[];
  invoices: InvoiceRecord[];
  expenses: ExpenseRecord[];
  onAddInvoice: (inv: Omit<InvoiceRecord, 'id'>) => Promise<boolean>;
  onMarkInvoicePaid: (id: string) => Promise<boolean>;
  onAddExpense: (exp: Omit<ExpenseRecord, 'id'>) => Promise<boolean>;
  onSyncCloudCosts: () => Promise<boolean>;
  config: CostConfiguration;
  costSummary: CostSummary;
  activeTab?: BookkeepingTab;
  onTabChange?: (tab: BookkeepingTab) => void;
}

export const BookKeeping: React.FC<BookKeepingProps> = ({
  employees,
  payrollRuns,
  invoices,
  expenses,
  onAddInvoice,
  onMarkInvoicePaid,
  onAddExpense,
  onSyncCloudCosts,
  config,
  costSummary,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<BookkeepingTab>('payroll');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = (tab: BookkeepingTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);

  // New Invoice Form State
  const [newInvClient, setNewInvClient] = useState('');
  const [newInvEmail, setNewInvEmail] = useState('');
  const [newInvDueDate, setNewInvDueDate] = useState('2026-12-15');
  const [newInvDesc, setNewInvDesc] = useState('Cloud Architecture & Engineering Services');
  const [newInvAmount, setNewInvAmount] = useState('15000');

  // New Expense Form State
  const [newExpVendor, setNewExpVendor] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseRecord['category']>('software');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmountFjd, setNewExpAmountFjd] = useState('250');
  const [newExpPaymentMethod, setNewExpPaymentMethod] = useState<ExpenseRecord['paymentMethod']>('fiji_card');

  // P&L Computations
  const totalInvoicedRevenueFjd = invoices
    .filter((i) => i.status === 'paid' || i.status === 'sent')
    .reduce((acc, i) => acc + i.subtotalFjd, 0);

  const totalPaidRevenueFjd = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.subtotalFjd, 0);

  const totalExpensesFjd = expenses.reduce((acc, e) => acc + e.amountFjd, 0);

  // Total Payroll Cost (Gross + Employer FNPF 10%)
  const totalMonthlyPayrollCostFjd = payrollRuns.reduce((sum, run) => sum + run.totalGrossFjd + run.totalFnpfEmployerFjd, 0);

  const netOperatingProfitFjd = totalInvoicedRevenueFjd - (totalExpensesFjd + totalMonthlyPayrollCostFjd);

  // Fiji VAT Summary (15%)
  const totalVatCollectedFjd = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.vatAmountFjd, 0);

  const totalVatPaidFjd = expenses
    .filter((e) => e.vatDeductible)
    .reduce((acc, e) => acc + (e.amountFjd * 0.15) / 1.15, 0);

  const netVatPayableFjd = totalVatCollectedFjd - totalVatPaidFjd;

  // Handlers
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim()) return;

    const sub = parseFloat(newInvAmount) || 5000;
    const vat = sub * 0.15; // 15% Fiji VAT
    const total = sub + vat;

    const invNum = `DN-2026-${String(invoices.length + 1).padStart(3, '0')}`;

    const saved = await onAddInvoice({
      invoiceNumber: invNum,
      clientName: newInvClient.trim(),
      clientEmail: newInvEmail.trim() || 'accounts@client.com',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newInvDueDate,
      items: [
        {
          description: newInvDesc.trim() || 'Consulting & Engineering Delivery',
          quantity: 1,
          unitPriceFjd: sub,
          totalFjd: sub,
        },
      ],
      subtotalFjd: sub,
      vatRate: 0.15,
      vatAmountFjd: vat,
      totalFjd: total,
      totalUsd: total / config.exchangeRateFJD,
      status: 'sent',
      notes: 'Payment via bank transfer to ANZ Fiji or Credit Card.',
    });
    if (!saved) return;

    setNewInvClient('');
    setNewInvEmail('');
    setShowNewInvoiceModal(false);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpVendor.trim()) return;

    const fjd = parseFloat(newExpAmountFjd) || 100;
    const usd = fjd / config.exchangeRateFJD;

    const saved = await onAddExpense({
      date: new Date().toISOString().split('T')[0],
      vendor: newExpVendor.trim(),
      category: newExpCategory,
      description: newExpDesc.trim() || 'General business operational expense',
      amountFjd: fjd,
      amountUsd: usd,
      vatDeductible: true,
      paymentMethod: newExpPaymentMethod,
    });
    if (!saved) return;

    setNewExpVendor('');
    setNewExpDesc('');
    setShowNewExpenseModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#164B91]" />
              <h2 className="text-base font-bold text-[#24344D] font-heading flex items-center gap-1.5">
                <span>Book-Keeping & MYOB Accounting Suite</span>
              </h2>
            </div>
            <p className="text-xs text-[#24344D]/70 mt-1">
              Shared employee payroll drafts, client invoices, expenses, and financial summaries.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeTab === 'expenses' && (
              <button
                type="button"
                onClick={onSyncCloudCosts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6941A5]/10 text-[#6941A5] border border-[#6941A5]/25 hover:bg-[#6941A5]/20 transition-all shadow-2xs cursor-pointer font-heading"
                title="Sync Claude, Supabase, and Azure monthly costs into Expenses"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Cloud Costs</span>
              </button>
            )}

            {activeTab === 'invoices' && (
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs transition-all cursor-pointer font-heading"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </button>
            )}

            {activeTab === 'expenses' && (
              <button
                type="button"
                onClick={() => setShowNewExpenseModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs transition-all cursor-pointer font-heading"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 MYOB Executive Overview KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Gross Invoiced Revenue</span>
              <DollarSign className="w-4 h-4 text-[#164B91]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#164B91]">
              ${totalInvoicedRevenueFjd.toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
            </div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              ${totalPaidRevenueFjd.toLocaleString()} FJD Collected
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Recorded Payroll Drafts</span>
              <Users className="w-4 h-4 text-[#19A7A0]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#24344D]">
              ${totalMonthlyPayrollCostFjd.toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
            </div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              {employees.length} Staff (configured contributions)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Net Operating Profit</span>
              <TrendingUp className="w-4 h-4 text-[#19A7A0]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#19A7A0]">
              ${netOperatingProfitFjd.toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
            </div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              Revenue minus (Expenses + Payroll)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
            <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-1">
              <span className="font-heading">Fiji VAT Liability (15%)</span>
              <FileCheck className="w-4 h-4 text-[#F28C28]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#F28C28]">
              ${netVatPayableFjd.toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
            </div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              FRCS Net Payable (Collected - Paid)
            </div>
          </div>
        </div>
      </div>

      {/* Book-Keeping Sub-Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D9F1EC] shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer font-heading ${
            activeTab === 'payroll'
              ? 'bg-[#164B91] text-white shadow-xs'
              : 'text-[#24344D]/70 hover:text-[#164B91] hover:bg-[#F5F7FA]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Payroll & FNPF ({employees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer font-heading ${
            activeTab === 'invoices'
              ? 'bg-[#164B91] text-white shadow-xs'
              : 'text-[#24344D]/70 hover:text-[#164B91] hover:bg-[#F5F7FA]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Invoices & 15% VAT ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer font-heading ${
            activeTab === 'expenses'
              ? 'bg-[#164B91] text-white shadow-xs'
              : 'text-[#24344D]/70 hover:text-[#164B91] hover:bg-[#F5F7FA]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Expenses & Cloud Sync ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer font-heading ${
            activeTab === 'pnl'
              ? 'bg-[#164B91] text-white shadow-xs'
              : 'text-[#24344D]/70 hover:text-[#164B91] hover:bg-[#F5F7FA]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Profit & Loss / MYOB Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('process_pay_run')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer font-heading ${
            activeTab === 'process_pay_run'
              ? 'bg-[#164B91] text-white shadow-xs'
              : 'text-[#164B91] bg-[#dff4f0] hover:bg-[#c9ece6]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#19A7A0]" />
          <span>Process Pay Run</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 0: PROCESS PAY RUN (Dedicated Workflow Tab)
          ========================================================================= */}
      {(activeTab === 'payroll' || activeTab === 'process_pay_run') && <PayrollView />}

      {activeTab === 'invoices' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">MYOB Client Invoices & VAT Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Invoices currently calculate 15% VAT. Confirm the applicable rate before billing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewInvoiceModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs self-start sm:self-auto cursor-pointer font-heading"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Invoice</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-stone-200 font-bold">
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right text-orange-700">15% VAT</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Total (FJD)</th>
                  <th className="py-3 px-3 text-right text-slate-500">Total (USD)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-[#24344D]/50 font-sans">
                      No invoices recorded yet. Click "Create New Invoice" to record a client invoice with the current VAT calculation.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-blue-700">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-slate-900">{inv.clientName}</div>
                        <div className="text-[10px] text-slate-400">{inv.clientEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        ${inv.subtotalFjd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-orange-700">
                        ${inv.vatAmountFjd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ${inv.totalFjd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                      ${inv.totalUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : inv.status === 'sent'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : inv.status === 'overdue'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {inv.status !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => onMarkInvoicePaid(inv.id)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EXPENSES & CLOUD SYNC (MYOB Purchases)
          ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Business Expense Register</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically integrates Claude AI, Supabase Pro, and Azure backend infrastructure costs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSyncCloudCosts}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Cloud Costs</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewExpenseModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-stone-200 font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Vendor</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount (FJD)</th>
                  <th className="py-3 px-3 text-right text-slate-400">Amount (USD)</th>
                  <th className="py-3 px-3 text-center">VAT Deductible</th>
                  <th className="py-3 px-3 text-center">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#24344D]/50 font-sans">
                      No business expenses recorded yet. Click "Add Expense" or "Sync Cloud Costs" to track cloud subscriptions and operations.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{exp.date}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.vendor}</span>
                          {exp.isSyncedFromPlanner && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-100 text-purple-700">
                              Planner
                            </span>
                          )}
                        </div>
                      </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${exp.amountFjd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      ${exp.amountUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {exp.vatDeductible ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Yes (15%)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans text-[11px] text-slate-600">
                      {exp.paymentMethod === 'fiji_card'
                        ? 'Fiji Visa/MC'
                        : exp.paymentMethod === 'bank_transfer'
                        ? 'Bank Wire'
                        : 'Cash'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROFIT & LOSS / GENERAL LEDGER
          ========================================================================= */}
      {activeTab === 'pnl' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Digital Nomad · Recorded Financial Summary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Planning summary of recorded invoices, expenses, and payroll draft commitments. Drafts are not bank payments.
              </p>
            </div>

            <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-stone-200">
              Exchange Basis: $1 USD = {config.exchangeRateFJD} FJD
            </div>
          </div>

          <div className="space-y-4 max-w-3xl text-xs font-mono">
            {/* REVENUE SECTION */}
            <div className="space-y-2">
              <div className="font-sans font-bold text-slate-900 text-sm flex items-center justify-between border-b border-stone-200 pb-1.5">
                <span>1. Operating Revenue</span>
                <span className="text-blue-700 font-mono">
                  ${totalInvoicedRevenueFjd.toFixed(2)} FJD
                </span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Gross Invoiced Client Deliverables (Excl. VAT):</span>
                  <span>${totalInvoicedRevenueFjd.toFixed(2)} FJD</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Settled & Cleared Funds:</span>
                  <span>${totalPaidRevenueFjd.toFixed(2)} FJD</span>
                </div>
              </div>
            </div>

            {/* EXPENSES SECTION */}
            <div className="space-y-2 pt-2">
              <div className="font-sans font-bold text-slate-900 text-sm flex items-center justify-between border-b border-stone-200 pb-1.5">
                <span>2. Operating & Staff Expenditures</span>
                <span className="text-orange-700 font-mono">
                  -${(totalExpensesFjd + totalMonthlyPayrollCostFjd).toFixed(2)} FJD
                </span>
              </div>
              <div className="pl-4 space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Wages & Salaries (Recorded drafts):</span>
                  <span>
                    -$
                    {payrollRuns
                      .reduce((acc, run) => acc + run.totalGrossFjd, 0)
                      .toFixed(2)}{' '}
                    FJD
                  </span>
                </div>
                <div className="flex items-center justify-between text-amber-900">
                  <span>Employer Contributions (Recorded drafts):</span>
                  <span>
                    -$
                    {payrollRuns
                      .reduce((acc, run) => acc + run.totalFnpfEmployerFjd, 0)
                      .toFixed(2)}{' '}
                    FJD
                  </span>
                </div>
                <div className="flex items-center justify-between text-purple-900">
                  <span>Cloud & AI Subscriptions (Claude, Supabase, Azure):</span>
                  <span>
                    -$
                    {expenses
                      .filter((e) => e.category === 'cloud_hosting' || e.category === 'ai_subscriptions')
                      .reduce((acc, e) => acc + e.amountFjd, 0)
                      .toFixed(2)}{' '}
                    FJD
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Other General Operating Expenses (Office, Fiber, Tools):</span>
                  <span>
                    -$
                    {expenses
                      .filter((e) => e.category !== 'cloud_hosting' && e.category !== 'ai_subscriptions')
                      .reduce((acc, e) => acc + e.amountFjd, 0)
                      .toFixed(2)}{' '}
                    FJD
                  </span>
                </div>
              </div>
            </div>

            {/* NET OPERATING PROFIT */}
            <div className="pt-3 border-t-2 border-stone-300 font-sans font-bold text-sm flex items-center justify-between text-slate-900 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <div className="space-y-0.5">
                <div>Net Operating Margin (EBITDA)</div>
                <div className="text-[11px] font-normal text-slate-500 font-sans">
                  Margin: {Math.round((netOperatingProfitFjd / (totalInvoicedRevenueFjd || 1)) * 100)}% of billable revenue
                </div>
              </div>
              <div className="text-base text-emerald-700 font-mono">
                ${netOperatingProfitFjd.toFixed(2)} FJD
                <div className="text-xs text-slate-400 font-normal">
                  (${ (netOperatingProfitFjd / config.exchangeRateFJD).toFixed(2) } USD)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAYSLIP DETAIL MODAL
          ========================================================================= */}

      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create MYOB Client Invoice</h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  placeholder="e.g. Fiji Airways Logistics"
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Email</label>
                  <input
                    type="email"
                    value={newInvEmail}
                    onChange={(e) => setNewInvEmail(e.target.value)}
                    placeholder="billing@client.com.fj"
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service Description</label>
                <input
                  type="text"
                  value={newInvDesc}
                  onChange={(e) => setNewInvDesc(e.target.value)}
                  placeholder="Milestone 2: Azure API & PostgreSQL Integration"
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subtotal Amount (FJD)</label>
                <input
                  type="number"
                  value={newInvAmount}
                  onChange={(e) => setNewInvAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <div className="text-[11px] text-orange-700 mt-1 font-mono">
                  +15% Fiji VAT: ${(parseFloat(newInvAmount || '0') * 0.15).toFixed(2)} FJD · Total: ${(parseFloat(newInvAmount || '0') * 1.15).toFixed(2)} FJD
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW EXPENSE MODAL
          ========================================================================= */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Record Business Expense</h3>
              <button onClick={() => setShowNewExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newExpVendor}
                  onChange={(e) => setNewExpVendor(e.target.value)}
                  placeholder="e.g. Anthropic, Supabase, Azure, Vodafone"
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e: any) => setNewExpCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="cloud_hosting">Cloud Hosting</option>
                    <option value="ai_subscriptions">AI Subscriptions</option>
                    <option value="software">Software Tools</option>
                    <option value="office">Office & Fiber</option>
                    <option value="travel">Travel</option>
                    <option value="contractors">Contractors</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={newExpPaymentMethod}
                    onChange={(e: any) => setNewExpPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="fiji_card">Fiji Card (Visa/MC)</option>
                    <option value="bank_transfer">Bank Wire</option>
                    <option value="petty_cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="e.g. Monthly Claude Max subscription"
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (FJD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpAmountFjd}
                  onChange={(e) => setNewExpAmountFjd(e.target.value)}
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewExpenseModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

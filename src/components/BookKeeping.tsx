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
  onAddEmployee: (emp: Omit<PayrollEmployee, 'id'>) => void;
  onRunPayroll: () => void;
  onAddInvoice: (inv: Omit<InvoiceRecord, 'id'>) => void;
  onMarkInvoicePaid: (id: string) => void;
  onAddExpense: (exp: Omit<ExpenseRecord, 'id'>) => void;
  onSyncCloudCosts: () => void;
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
  onAddEmployee,
  onRunPayroll,
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
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<PayrollEmployee | null>(null);

  // Modals
  const [showNewEmpModal, setShowNewEmpModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [payrollSuccessMsg, setPayrollSuccessMsg] = useState(false);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpGross, setNewEmpGross] = useState('4500');
  const [newEmpPayType, setNewEmpPayType] = useState<'monthly' | 'hourly' | 'contractor'>('monthly');
  const [newEmpBank, setNewEmpBank] = useState('ANZ Fiji');
  const [newEmpAccount, setNewEmpAccount] = useState('');

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
  const totalMonthlyPayrollCostFjd = employees.reduce(
    (acc, e) => acc + e.grossPayFjd + (e.grossPayFjd * e.fnpfEmployerRate),
    0
  );

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
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const gross = parseFloat(newEmpGross) || 3000;
    const isContractor = newEmpPayType === 'contractor';

    onAddEmployee({
      name: newEmpName.trim(),
      role: newEmpRole.trim() || 'Software Engineer',
      department: newEmpDept,
      tinNumber: `50-${Math.floor(10000 + Math.random() * 90000)}-1`,
      fnpfNumber: `FNPF-${Math.floor(100000 + Math.random() * 900000)}`,
      payType: newEmpPayType,
      grossPayFjd: gross,
      fnpfEmployeeRate: isContractor ? 0.0 : 0.08,
      fnpfEmployerRate: isContractor ? 0.0 : 0.10,
      payeTaxRate: gross > 5000 ? 0.18 : gross > 3500 ? 0.14 : 0.08,
      bankName: newEmpBank,
      accountNumber: newEmpAccount || `${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'active',
    });

    setNewEmpName('');
    setNewEmpRole('');
    setNewEmpAccount('');
    setShowNewEmpModal(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim()) return;

    const sub = parseFloat(newInvAmount) || 5000;
    const vat = sub * 0.15; // 15% Fiji VAT
    const total = sub + vat;

    const invNum = `DN-2026-${String(invoices.length + 1).padStart(3, '0')}`;

    onAddInvoice({
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

    setNewInvClient('');
    setNewInvEmail('');
    setShowNewInvoiceModal(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpVendor.trim()) return;

    const fjd = parseFloat(newExpAmountFjd) || 100;
    const usd = fjd / config.exchangeRateFJD;

    onAddExpense({
      date: new Date().toISOString().split('T')[0],
      vendor: newExpVendor.trim(),
      category: newExpCategory,
      description: newExpDesc.trim() || 'General business operational expense',
      amountFjd: fjd,
      amountUsd: usd,
      vatDeductible: true,
      paymentMethod: newExpPaymentMethod,
    });

    setNewExpVendor('');
    setNewExpDesc('');
    setShowNewExpenseModal(false);
  };

  const handleExecutePayRun = () => {
    onRunPayroll();
    setPayrollSuccessMsg(true);
    setTimeout(() => setPayrollSuccessMsg(false), 3000);
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
              Integrated Fiji Payroll (FNPF 8%/10% & PAYE Tax), MYOB Invoicing with 15% VAT, Expense Ledger, and Profit & Loss.
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

            {activeTab === 'payroll' && (
              <button
                type="button"
                onClick={handleExecutePayRun}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs transition-all cursor-pointer font-heading"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Process Pay Run</span>
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

        {payrollSuccessMsg && (
          <div className="p-3 rounded-lg bg-[#D9F1EC] border border-[#19A7A0]/30 text-[#164B91] text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#19A7A0]" />
              Monthly Payroll Run successfully executed and posted to General Ledger!
            </span>
          </div>
        )}

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
              <span className="font-heading">Monthly Staff Payroll</span>
              <Users className="w-4 h-4 text-[#19A7A0]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#24344D]">
              ${totalMonthlyPayrollCostFjd.toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
            </div>
            <div className="text-[11px] text-[#24344D]/60 mt-1">
              {employees.length} Active Staff (Incl. 10% FNPF)
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
      {activeTab === 'process_pay_run' && (
        <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAF4F8] pb-4">
            <div>
              <div className="text-[11px] font-bold text-[#19A7A0] uppercase tracking-wider font-heading">
                Fiji Payroll Engine
              </div>
              <h3 className="text-lg font-bold text-[#24344D] font-heading mt-0.5">
                Execute Monthly Payroll Disbursement
              </h3>
              <p className="text-xs text-[#24344D]/70 mt-1">
                Disburse salaries, automatically generate compliant FNPF contributions (8% Employee deduction + 10% Employer match), and calculate FRCS PAYE withholding.
              </p>
            </div>

            <button
              type="button"
              disabled={employees.length === 0}
              onClick={handleExecutePayRun}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs font-heading ${
                employees.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#164B91] hover:bg-[#123e78] text-white cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Confirm & Process Monthly Pay Run</span>
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[#D9F1EC] rounded-xl bg-[#F5F7FA]/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4F8] text-[#164B91] flex items-center justify-center mx-auto text-xl font-mono">
                ♙
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24344D] font-heading">
                  No staff members currently in payroll
                </h4>
                <p className="text-xs text-[#24344D]/60 max-w-sm mx-auto mt-0.5">
                  Before processing a pay run, register your employees with their TIN, FNPF numbers, and bank account details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewEmpModal(true)}
                className="px-4 py-2 rounded-lg bg-[#164B91] text-white text-xs font-bold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
              >
                + Add Employee First
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
                  <div className="text-xs text-[#24344D]/70 font-heading">Eligible Staff</div>
                  <div className="text-xl font-bold text-[#164B91] font-mono mt-1">
                    {employees.length} Active Staff
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
                  <div className="text-xs text-[#24344D]/70 font-heading">Total Gross Wages</div>
                  <div className="text-xl font-bold text-[#24344D] font-mono mt-1">
                    ${employees.reduce((acc, e) => acc + e.grossPayFjd, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC]">
                  <div className="text-xs text-[#24344D]/70 font-heading">Employer 10% FNPF</div>
                  <div className="text-xl font-bold text-[#F28C28] font-mono mt-1">
                    ${employees.reduce((acc, e) => acc + e.grossPayFjd * e.fnpfEmployerRate, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} FJD
                  </div>
                </div>
              </div>

              <div className="border border-[#D9F1EC] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EAF4F8] text-[#24344D] font-bold font-heading border-b border-[#D9F1EC]">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Gross Pay</th>
                      <th className="py-2.5 px-3">FNPF (8% Emp)</th>
                      <th className="py-2.5 px-3">FNPF (10% Co)</th>
                      <th className="py-2.5 px-3">PAYE Tax</th>
                      <th className="py-2.5 px-3 text-right">Net Take-Home</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF4F8] font-mono">
                    {employees.map((e) => {
                      const fnpfEmp = e.grossPayFjd * e.fnpfEmployeeRate;
                      const fnpfCo = e.grossPayFjd * e.fnpfEmployerRate;
                      const paye = e.grossPayFjd * e.payeTaxRate;
                      const net = e.grossPayFjd - fnpfEmp - paye;
                      return (
                        <tr key={e.id}>
                          <td className="py-2 px-3 font-sans font-semibold text-[#24344D]">{e.name}</td>
                          <td className="py-2 px-3">${e.grossPayFjd.toFixed(2)}</td>
                          <td className="py-2 px-3 text-amber-800">-${fnpfEmp.toFixed(2)}</td>
                          <td className="py-2 px-3 text-amber-900">+${fnpfCo.toFixed(2)}</td>
                          <td className="py-2 px-3 text-orange-700">-${paye.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">${net.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 1: PAYROLL (MYOB Payroll Engine)
          ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Employee Master Payroll Table */}
          <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#24344D] font-heading">
                  Staff Wages, FNPF Contributions & PAYE Withholding
                </h3>
                <p className="text-xs text-[#24344D]/70 mt-0.5">
                  Fiji National Provident Fund (8% Employee deduction + 10% Employer matching) & FRCS PAYE tax.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewEmpModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#D9F1EC] text-[#164B91] hover:text-[#123e78] hover:bg-[#EAF4F8] self-start sm:self-auto cursor-pointer font-heading"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#D9F1EC]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF4F8] text-[#24344D] border-b border-[#D9F1EC] font-bold font-heading">
                    <th className="py-3 px-3">Employee Name</th>
                    <th className="py-3 px-3">Role / Dept</th>
                    <th className="py-3 px-3 text-right">Gross Pay</th>
                    <th className="py-3 px-3 text-right text-amber-900">FNPF (8% Emp)</th>
                    <th className="py-3 px-3 text-right text-amber-900">FNPF (10% Co)</th>
                    <th className="py-3 px-3 text-right text-orange-700">PAYE Tax</th>
                    <th className="py-3 px-3 text-right text-emerald-700 font-bold">Net Deposit</th>
                    <th className="py-3 px-3 text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#24344D]/50 font-sans">
                        No employees registered in payroll yet. Click "Add Employee" to set up staff, FNPF and PAYE rates.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const fnpfEmp = emp.grossPayFjd * emp.fnpfEmployeeRate;
                      const fnpfCo = emp.grossPayFjd * emp.fnpfEmployerRate;
                      const paye = emp.grossPayFjd * emp.payeTaxRate;
                      const netPay = emp.grossPayFjd - fnpfEmp - paye;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">
                              TIN: {emp.tinNumber} · {emp.fnpfNumber}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">
                            <div>{emp.role}</div>
                            <div className="text-[10px] text-slate-400">{emp.department}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            ${emp.grossPayFjd.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-900 font-medium">
                            -${fnpfEmp.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-900/80 font-medium">
                            ${fnpfCo.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-orange-700 font-medium">
                            -${paye.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                            ${netPay.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <button
                              type="button"
                              onClick={() => setSelectedPayslipEmp(emp)}
                              className="p-1 rounded text-blue-700 hover:bg-blue-50 border border-blue-200 text-[11px] font-semibold px-2 transition-colors cursor-pointer"
                            >
                              View Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Payroll Run Ledger */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Payroll Run History & FRCS Filing Record</h3>
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-stone-200 font-bold">
                    <th className="py-2.5 px-3">Pay Period</th>
                    <th className="py-2.5 px-3">Disbursement Date</th>
                    <th className="py-2.5 px-3 text-right">Total Gross</th>
                    <th className="py-2.5 px-3 text-right text-amber-900">Total FNPF</th>
                    <th className="py-2.5 px-3 text-right text-orange-700">Total PAYE Tax</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">Total Net Deposited</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {payrollRuns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#24344D]/50 font-sans">
                        No previous pay runs processed. Click "Process Pay Run" above to execute and log your first monthly disbursement.
                      </td>
                    </tr>
                  ) : (
                    payrollRuns.map((run) => (
                      <tr key={run.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                          {run.payPeriod}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-sans">{run.runDate}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          ${run.totalGrossFjd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-900">
                          ${(run.totalFnpfEmployeeFjd + run.totalFnpfEmployerFjd).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-orange-700">
                          ${run.totalPayeTaxFjd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          ${run.totalNetPayFjd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Settled
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INVOICES & BILLING (MYOB Invoicing Engine)
          ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">MYOB Client Invoices & VAT Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliant with Fiji Revenue & Customs Service (FRCS) 15% Value Added Tax (VAT).
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
                      No invoices recorded yet. Click "Create New Invoice" to generate an FRCS 15% VAT compliant client bill.
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
                Digital Nomad · Annual Profit & Loss (P&L) Statement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full income statement reconciling invoiced client revenue against staff payroll and cloud infrastructure operating expenses.
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
                  <span>Wages & Salaries (Monthly baseline):</span>
                  <span>
                    -$
                    {employees
                      .reduce((acc, e) => acc + e.grossPayFjd, 0)
                      .toFixed(2)}{' '}
                    FJD
                  </span>
                </div>
                <div className="flex items-center justify-between text-amber-900">
                  <span>Employer FNPF Contributions (10% matching):</span>
                  <span>
                    -$
                    {employees
                      .reduce((acc, e) => acc + e.grossPayFjd * e.fnpfEmployerRate, 0)
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
      {selectedPayslipEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Digital Nomad Co. · Fiji Pay Slip
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedPayslipEmp.name}</h3>
                <p className="text-xs text-slate-500">{selectedPayslipEmp.role} · {selectedPayslipEmp.department}</p>
              </div>
              <button
                onClick={() => setSelectedPayslipEmp(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-stone-200 font-sans">
                <div>
                  <span className="text-slate-400">TIN Number:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedPayslipEmp.tinNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">FNPF Number:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedPayslipEmp.fnpfNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Bank:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedPayslipEmp.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Account:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedPayslipEmp.accountNumber}</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="space-y-1.5 border-t border-stone-200 pt-2">
                <div className="flex items-center justify-between font-sans font-bold text-slate-900">
                  <span>Gross Earnings:</span>
                  <span className="font-mono">${selectedPayslipEmp.grossPayFjd.toFixed(2)} FJD</span>
                </div>

                <div className="pl-3 space-y-1 text-slate-600">
                  <div className="flex items-center justify-between text-amber-900">
                    <span>Less: Employee FNPF Contribution (8%):</span>
                    <span>-${(selectedPayslipEmp.grossPayFjd * selectedPayslipEmp.fnpfEmployeeRate).toFixed(2)} FJD</span>
                  </div>
                  <div className="flex items-center justify-between text-orange-700">
                    <span>Less: Fiji PAYE Income Tax Withholding:</span>
                    <span>-${(selectedPayslipEmp.grossPayFjd * selectedPayslipEmp.payeTaxRate).toFixed(2)} FJD</span>
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-2 flex items-center justify-between font-sans font-bold text-sm text-emerald-800 bg-emerald-50 p-2.5 rounded-lg">
                  <span>Net Take-Home Pay (Direct Deposit):</span>
                  <span className="font-mono">
                    $
                    {(
                      selectedPayslipEmp.grossPayFjd -
                      selectedPayslipEmp.grossPayFjd * selectedPayslipEmp.fnpfEmployeeRate -
                      selectedPayslipEmp.grossPayFjd * selectedPayslipEmp.payeTaxRate
                    ).toFixed(2)}{' '}
                    FJD
                  </span>
                </div>

                <div className="p-2 rounded bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center justify-between font-sans">
                  <span>Employer FNPF Matching (10% paid to Fund):</span>
                  <span className="font-mono font-semibold">
                    +${(selectedPayslipEmp.grossPayFjd * selectedPayslipEmp.fnpfEmployerRate).toFixed(2)} FJD
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayslipEmp(null)}
                className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white text-xs font-semibold hover:bg-[#123e78] cursor-pointer font-heading"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW EMPLOYEE MODAL
          ========================================================================= */}
      {showNewEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Payroll Employee</h3>
              <button onClick={() => setShowNewEmpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="e.g. Alipate Rokotuivuna"
                  className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="e.g. Cloud Architect"
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Gross (FJD)</label>
                  <input
                    type="number"
                    value={newEmpGross}
                    onChange={(e) => setNewEmpGross(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pay Type</label>
                  <select
                    value={newEmpPayType}
                    onChange={(e: any) => setNewEmpPayType(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="monthly">Monthly Salary (FNPF)</option>
                    <option value="hourly">Hourly Wage</option>
                    <option value="contractor">Contractor (No FNPF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <select
                    value={newEmpBank}
                    onChange={(e) => setNewEmpBank(e.target.value)}
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ANZ Fiji">ANZ Fiji</option>
                    <option value="BSP Fiji">BSP Fiji</option>
                    <option value="Westpac Fiji">Westpac Fiji</option>
                    <option value="BRED Bank Fiji">BRED Bank Fiji</option>
                    <option value="HFC Bank Fiji">HFC Bank Fiji</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={newEmpAccount}
                    onChange={(e) => setNewEmpAccount(e.target.value)}
                    placeholder="e.g. 102938481"
                    className="w-full bg-slate-50 border border-stone-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEmpModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#164B91] text-white font-semibold hover:bg-[#123e78] shadow-xs cursor-pointer font-heading"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW INVOICE MODAL
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

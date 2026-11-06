import React from 'react';
import { NavigationSection, CostConfiguration } from '../types';
import {
  LayoutDashboard,
  FolderGit2,
  Network,
  Calculator,
  Cpu,
  ArrowLeftRight,
  Settings,
  Share2,
  X,
  Building2,
  LogOut,
  Waves,
} from 'lucide-react';

interface SidebarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  currentBookkeepingTab?: 'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run';
  onSelectBookkeepingTab?: (tab: 'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run') => void;
  config: CostConfiguration;
  onOpenPartnerModal: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  projectCount: number;
  unpaidInvoiceCount: number;
  employeeCount?: number;
  expenseCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  currentBookkeepingTab = 'payroll',
  onSelectBookkeepingTab,
  config,
  onOpenPartnerModal,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  projectCount,
  unpaidInvoiceCount,
  employeeCount = 0,
  expenseCount = 0,
}) => {
  const [isBookkeepingOpen, setIsBookkeepingOpen] = React.useState(true);

  const navSections: Array<{
    group: string;
    items: Array<{
      id: NavigationSection;
      label: string;
      icon: React.ReactNode;
      symbol: string;
      badge?: string | number;
      badgeType?: 'reef' | 'orange' | 'purple';
    }>;
  }> = [
    {
      group: 'Workspace',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          symbol: '▦',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'projects',
          label: 'Projects',
          symbol: '▣',
          icon: <FolderGit2 className="w-4 h-4" />,
          badge: projectCount > 0 ? projectCount : undefined,
          badgeType: 'reef',
        },
        {
          id: 'timeline',
          label: 'Architecture',
          symbol: '▤',
          icon: <Network className="w-4 h-4" />,
        },
        {
          id: 'hrms',
          label: 'HRMS',
          symbol: '◍',
          icon: <Building2 className="w-4 h-4" />,
        },
      ],
    },
    {
      group: 'Finance',
      items: [
        {
          id: 'bookkeeping',
          label: 'Bookkeeping',
          symbol: '▥',
          icon: <Calculator className="w-4 h-4" />,
          badge: unpaidInvoiceCount > 0 ? `${unpaidInvoiceCount} Due` : undefined,
          badgeType: 'orange',
        },
        {
          id: 'cost_planner',
          label: 'Cloud & AI Costs',
          symbol: '◫',
          icon: <Cpu className="w-4 h-4" />,
        },
        {
          id: 'insights',
          label: 'FX Insights',
          symbol: '⇄',
          icon: <ArrowLeftRight className="w-4 h-4" />,
        },
      ],
    },
    {
      group: 'Administration',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          symbol: '⚙',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  const bookkeepingSubItems: Array<{
    tab: 'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run';
    label: string;
    count?: number;
    isAction?: boolean;
  }> = [
    {
      tab: 'payroll',
      label: 'Payroll & FNPF',
      count: employeeCount,
    },
    {
      tab: 'invoices',
      label: 'Invoices & 15% VAT',
      count: unpaidInvoiceCount,
    },
    {
      tab: 'expenses',
      label: 'Expenses & Cloud Sync',
      count: expenseCount,
    },
    {
      tab: 'pnl',
      label: 'Profit & Loss / MYOB Ledger',
    },
    {
      tab: 'process_pay_run',
      label: 'Process Pay Run',
      isAction: true,
    },
  ];

  const handleNavClick = (sectionId: NavigationSection) => {
    onSelectSection(sectionId);
    if (sectionId === 'bookkeeping') {
      setIsBookkeepingOpen(true);
    }
    onCloseMobile();
  };

  const handleSubTabClick = (tab: 'payroll' | 'invoices' | 'expenses' | 'pnl' | 'process_pay_run') => {
    onSelectSection('bookkeeping');
    if (onSelectBookkeepingTab) {
      onSelectBookkeepingTab(tab);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#102745]/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#dfe9ef] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 font-sans ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header — Ocean Blue (#194b91) matching prototype height 76px */}
        <div className="h-[76px] px-5 bg-[#194b91] flex items-center justify-between border-b border-[#143d77] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-white text-xl shadow-xs font-mono">
              ▦
            </div>
            <div>
              <strong className="text-base font-bold tracking-tight font-heading block leading-tight text-white">
                Digital Nomad
              </strong>
              <small className="text-[10px] text-[#d3e6ff] block">
                Pacific Operations Portal
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#929daf] font-heading">
                {sec.group}
              </div>
              {sec.items.map((item) => {
                const isActive = activeSection === item.id;
                const isBookkeeping = item.id === 'bookkeeping';

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer font-heading text-xs font-semibold ${
                        isActive
                          ? 'bg-[#e9f3f8] border-[#2a63ae] text-[#194b91] shadow-2xs'
                          : 'border-transparent text-[#53617b] hover:bg-[#f1f6fa] hover:text-[#194b91]'
                      }`}
                    >
                      <span
                        className={`w-5 text-center text-base shrink-0 ${
                          isActive ? 'text-[#194b91]' : 'text-[#8a99ae]'
                        }`}
                      >
                        {item.symbol}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            item.badgeType === 'orange'
                              ? 'bg-[#fff3e7] text-[#bd6507] border border-[#ffd2a7]'
                              : 'bg-[#dff4f0] text-[#194b91]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Bookkeeping Sub-Menu Items */}
                    {isBookkeeping && (activeSection === 'bookkeeping' || isBookkeepingOpen) && (
                      <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-[#dcebe9] ml-4">
                        {bookkeepingSubItems.map((sub) => {
                          const isSubActive =
                            activeSection === 'bookkeeping' && currentBookkeepingTab === sub.tab;

                          return (
                            <button
                              key={sub.tab}
                              type="button"
                              onClick={() => handleSubTabClick(sub.tab)}
                              className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between cursor-pointer font-heading ${
                                isSubActive
                                  ? 'bg-[#194b91] text-white font-bold shadow-2xs'
                                  : sub.isAction
                                  ? 'bg-[#dff4f0] text-[#164B91] hover:bg-[#c9ece6] font-bold'
                                  : 'text-[#53617b] hover:text-[#194b91] hover:bg-[#f1f6fa]'
                              }`}
                            >
                              <span className="truncate">
                                {sub.label}
                                {sub.count !== undefined ? ` (${sub.count})` : ''}
                              </span>
                              {sub.isAction && (
                                <span className={`text-[10px] ${isSubActive ? 'text-white' : 'text-[#194b91]'}`}>
                                  ⚡
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3.5 border-t border-[#dfe9ef] bg-white space-y-2.5 shrink-0">
          {/* Rate Card (Exact prototype style) */}
          <div className="bg-[#f5fafb] border border-[#d4e9e7] p-3 rounded-lg text-xs text-[#75839b] flex items-center justify-between">
            <span>FX reference*</span>
            <strong className="text-[#194b91] font-mono font-bold">
              1 USD = {config.exchangeRateFJD} FJD
            </strong>
          </div>

          {/* Partner Access Button (Ocean Blue, matching prototype) */}
          <button
            type="button"
            onClick={onOpenPartnerModal}
            className="w-full py-2.5 px-3 rounded-lg bg-[#194b91] hover:bg-[#143d77] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-heading"
          >
            <span>↗ Partner Access</span>
          </button>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-lg bg-transparent hover:bg-red-50 text-slate-500 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-heading"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

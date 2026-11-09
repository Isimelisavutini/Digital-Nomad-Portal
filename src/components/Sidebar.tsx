import React, { useEffect, useState } from 'react';
import type { NavigationSection, CostConfiguration, BookkeepingTab } from '../types';
import type { NavSection as HrSection } from '../../hrms/src/types';
import { NAV as HR_NAV } from '../../hrms/src/components/ui';
import { LayoutDashboard, FolderGit2, Network, Calculator, Cpu, ArrowLeftRight, Settings, X, Building2, LogOut, ChevronDown, Waves } from 'lucide-react';

interface SidebarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  currentBookkeepingTab?: BookkeepingTab;
  onSelectBookkeepingTab?: (tab: BookkeepingTab) => void;
  currentHrSection: HrSection;
  onSelectHrSection: (section: HrSection) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection, currentBookkeepingTab = 'payroll', onSelectBookkeepingTab, currentHrSection, onSelectHrSection, config, onOpenPartnerModal, onLogout, isOpenMobile, onCloseMobile, projectCount, unpaidInvoiceCount, employeeCount = 0, expenseCount = 0 }) => {
  const [openGroup, setOpenGroup] = useState<'hrms' | 'bookkeeping' | null>(() => activeSection === 'hrms' || activeSection === 'bookkeeping' ? activeSection : null);
  useEffect(() => {
    if (activeSection === 'hrms' || activeSection === 'bookkeeping') setOpenGroup(activeSection);
  }, [activeSection]);
  useEffect(() => {
    if (!isOpenMobile) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseMobile(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpenMobile, onCloseMobile]);

  const groups = [
    { label: 'Workspace', items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'projects', label: 'Projects', icon: FolderGit2, count: projectCount || undefined },
      { id: 'timeline', label: 'Architecture', icon: Network },
    ] },
    { label: 'Finance', items: [
      { id: 'bookkeeping', label: 'Bookkeeping', icon: Calculator, count: unpaidInvoiceCount || undefined },
      { id: 'cost_planner', label: 'Cloud & AI Costs', icon: Cpu },
      { id: 'insights', label: 'FX Insights', icon: ArrowLeftRight },
    ] },
    { label: 'People', items: [{ id: 'hrms', label: 'HR Management', icon: Building2 }] },
    { label: 'Administration', items: [{ id: 'settings', label: 'Settings', icon: Settings }] },
  ] as const;
  const bookkeepingItems: { id: BookkeepingTab; label: string; count?: number }[] = [
    { id: 'payroll', label: 'Payroll & FNPF', count: employeeCount },
    { id: 'invoices', label: 'Invoices & VAT', count: unpaidInvoiceCount },
    { id: 'expenses', label: 'Expenses & Cloud Sync', count: expenseCount },
    { id: 'pnl', label: 'Profit & Loss / MYOB' },
    { id: 'process_pay_run', label: 'Process Pay Run' },
  ];
  const select = (id: NavigationSection) => {
    if (id === 'hrms' || id === 'bookkeeping') {
      const opening = openGroup !== id;
      setOpenGroup(opening ? id : null);
      if (opening) onSelectSection(id);
      return;
    }
    onSelectSection(id);
    onCloseMobile();
  };
  const rowStyle = 'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19A7A0]';

  return <>
    {isOpenMobile && <button type="button" aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-[#102745]/50 backdrop-blur-xs lg:hidden" onClick={onCloseMobile} />}
    <aside aria-label="Main sidebar" className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 motion-reduce:transition-none lg:visible lg:translate-x-0 ${isOpenMobile ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
      <div className="flex h-[76px] shrink-0 items-center gap-3 bg-[#194b91] px-5 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10"><Waves className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><strong className="block text-sm">Digital Nomad</strong><span className="text-[10px] text-blue-100">Pacific Operations Portal</span></div>
        <button type="button" aria-label="Close navigation" onClick={onCloseMobile} className="rounded p-1 hover:bg-white/10 lg:hidden"><X className="h-4 w-4" /></button>
      </div>
      <nav aria-label="Portal navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map(group => <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
          <div className="space-y-1">{group.items.map(item => {
            const active = activeSection === item.id;
            const accordion = item.id === 'hrms' || item.id === 'bookkeeping';
            const expanded = openGroup === item.id;
            return <div key={item.id}>
              <button type="button" aria-label={item.label} aria-expanded={accordion ? expanded : undefined} aria-controls={accordion ? `${item.id}-submenu` : undefined} aria-current={!accordion && active ? 'page' : undefined} onClick={() => select(item.id)} className={`${rowStyle} ${active ? 'bg-[#eaf4f8] text-[#194b91]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#194b91]'}`}>
                <item.icon className="h-[18px] w-[18px] shrink-0" /><span className="flex-1">{item.label}</span>
                {'count' in item && item.count !== undefined && <span className="rounded bg-slate-100 px-1.5 text-xs text-slate-500">{item.count}</span>}
                {accordion && <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} />}
              </button>
              {accordion && <div id={`${item.id}-submenu`} hidden={!expanded} className="ml-5 mt-1 space-y-0.5 border-l border-slate-200 py-1 pl-3">
                {item.id === 'hrms' ? HR_NAV.map(sub => <button key={sub.id} type="button" aria-current={active && currentHrSection === sub.id ? 'page' : undefined} onClick={() => { onSelectHrSection(sub.id); onSelectSection('hrms'); onCloseMobile(); }} className={`${rowStyle} !gap-2.5 !px-2.5 !py-2 !text-xs ${active && currentHrSection === sub.id ? 'bg-[#194b91] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#194b91]'}`}>
                  <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{sub.icon}</span>{sub.id === 'settings' ? 'HR Settings' : sub.label}
                </button>) : bookkeepingItems.map(sub => <button key={sub.id} type="button" aria-current={active && currentBookkeepingTab === sub.id ? 'page' : undefined} onClick={() => { onSelectBookkeepingTab?.(sub.id); onSelectSection('bookkeeping'); onCloseMobile(); }} className={`${rowStyle} !justify-between !px-2.5 !py-2 !text-xs ${active && currentBookkeepingTab === sub.id ? 'bg-[#194b91] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#194b91]'}`}><span>{sub.label}</span>{sub.count !== undefined && <span>{sub.count}</span>}</button>)}
              </div>}
            </div>;
          })}</div>
        </div>)}
      </nav>
      <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white p-3">
        <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-500"><span>FX reference</span><span>1 USD = {config.exchangeRateFJD} FJD</span></div>
        <div className="flex gap-1"><button type="button" onClick={onOpenPartnerModal} className="flex-1 rounded-lg px-2 py-2 text-xs font-medium text-[#194b91] hover:bg-blue-50">Partner access</button><button type="button" onClick={onLogout} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut className="h-3.5 w-3.5" />Log out</button></div>
      </div>
    </aside>
  </>;
};

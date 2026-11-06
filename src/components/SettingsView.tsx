import React from 'react';
import { CostConfiguration } from '../types';
import {
  Settings as SettingsIcon,
  Globe2,
  DollarSign,
  ShieldCheck,
  Building,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  config: CostConfiguration;
  onUpdateExchangeRate: (rate: number) => void;
  onToggleFxSpread: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateExchangeRate,
  onToggleFxSpread,
}) => {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#19A7A0] font-heading">
          Administration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24344D] tracking-tight font-heading mt-0.5">
          Portal Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#748198] mt-0.5">
          Workspace regional settings, FX parameters, compliance defaults, and partner access configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Panel 1: Regional & Currency Defaults */}
        <div className="bg-white border border-[#dcebe9] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#dfe9ef] pb-3">
            <Globe2 className="w-5 h-5 text-[#164B91]" />
            <h2 className="text-base font-bold text-[#22334e] font-heading">
              Regional & Accounting Defaults
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 border border-[#dfe9ef] rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-xs text-[#22334e] block">Primary Currency</strong>
                <p className="text-[11px] text-[#748198] mt-0.5">Fiji Dollar (FJD) as functional base</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e9f8f5] text-[#127d77] border border-[#b2e0da]">
                FJD
              </span>
            </div>

            <div className="p-3.5 border border-[#dfe9ef] rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-xs text-[#22334e] block">Jurisdiction & Tax Region</strong>
                <p className="text-[11px] text-[#748198] mt-0.5">Fiji / Pacific (FRCS 15% VAT & FNPF 8%/10%)</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef5fb] text-[#164B91] border border-[#b7d1ec]">
                Pacific
              </span>
            </div>

            <div className="p-3.5 border border-[#dfe9ef] rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-xs text-[#22334e] block">Preferred Cloud Region</strong>
                <p className="text-[11px] text-[#748198] mt-0.5">Australia East (Sydney) · ~48ms latency to Fiji</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f5f0fe] text-[#6941A5] border border-[#d7c6f4]">
                ~48ms
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Live FX & Payment Safeguards */}
        <div className="bg-white border border-[#dcebe9] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#dfe9ef] pb-3">
            <CreditCard className="w-5 h-5 text-[#F28C28]" />
            <h2 className="text-base font-bold text-[#22334e] font-heading">
              Exchange Rate & Card Fee Engine
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#24344D] font-heading mb-1">
                FJD / USD Benchmark Exchange Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={config.exchangeRateFJD}
                  onChange={(e) => onUpdateExchangeRate(parseFloat(e.target.value) || 2.2554)}
                  className="w-full bg-[#f4f7fa] border border-[#dfe9ef] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#164B91] focus:bg-white focus:outline-none focus:border-[#164B91]"
                />
              </div>
              <p className="text-[10px] text-[#748198] mt-1">
                Standard baseline: 1 USD = 2.2554 FJD
              </p>
            </div>

            <div className="p-3.5 bg-[#f5fafb] border border-[#d4e9e7] rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-xs text-[#22334e] block">Fiji Bank Foreign Card Markup (+3.5%)</strong>
                <p className="text-[11px] text-[#748198] mt-0.5">
                  Protects cash flow from ANZ/BSP/Westpac Fiji conversion spreads
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleFxSpread(!config.fxSpreadEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all font-heading ${
                  config.fxSpreadEnabled
                    ? 'bg-[#164B91] text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {config.fxSpreadEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="p-3.5 border border-[#dfe9ef] rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-xs text-[#22334e] block">Partner Access Password</strong>
                <p className="text-[11px] text-[#748198] mt-0.5">Secure stakeholder authentication code</p>
              </div>
              <code className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#eef5fb] text-[#164B91] border border-[#b7d1ec]">
                DigitalNomad26
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

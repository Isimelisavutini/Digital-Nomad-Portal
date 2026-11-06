import React from 'react';
import {
  CostConfiguration,
  PresetType,
  ClaudePlanM212,
  SupabaseComputeTier,
  AzureComputeTier,
  CurrencyMode,
} from '../types';
import {
  PRESET_CONFIGS,
  CLAUDE_PRICING,
  SUPABASE_PRICING,
  AZURE_PRICING,
  DEFAULT_EXCHANGE_RATE_FJD,
} from '../constants';
import {
  Sliders,
  Sparkles,
  Database,
  Cloud,
  RotateCcw,
  Check,
  CreditCard,
  Zap,
} from 'lucide-react';

interface ControlsSidebarProps {
  config: CostConfiguration;
  onChange: (updated: Partial<CostConfiguration>) => void;
  onApplyPreset: (preset: Exclude<PresetType, 'custom'>) => void;
  activePreset: PresetType;
  onResetDefaults: () => void;
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
  config,
  onChange,
  onApplyPreset,
  activePreset,
  onResetDefaults,
}) => {
  return (
    <div className="space-y-6 font-sans">
      {/* SECTION 1: Architecture Quick Presets */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F28C28]" />
            <h3 className="text-sm font-bold text-[#24344D] font-heading">Architecture Presets</h3>
          </div>
          <button
            onClick={onResetDefaults}
            className="text-xs text-[#24344D]/70 hover:text-[#164B91] flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-[#EAF4F8] cursor-pointer"
            title="Reset all settings to default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(Object.keys(PRESET_CONFIGS) as Array<Exclude<PresetType, 'custom'>>).map((key) => {
            const p = PRESET_CONFIGS[key];
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onApplyPreset(key)}
                className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-[#164B91] bg-[#EAF4F8] text-[#24344D] shadow-xs ring-1 ring-[#164B91]/30 font-semibold'
                    : 'border-[#D9F1EC] bg-[#F5F7FA]/50 text-[#24344D]/80 hover:border-[#19A7A0] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#24344D] font-heading">{p.name}</div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#164B91] shrink-0" />}
                </div>
                <div className="text-[11px] text-[#24344D]/60 mt-1">{p.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Currency & Bank FX Settings */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#164B91]" />
            <h3 className="text-sm font-bold text-[#24344D] font-heading">Financial & FX Engine</h3>
          </div>
          <span className="text-xs font-semibold text-[#164B91] bg-[#D9F1EC]/60 px-2.5 py-0.5 rounded-md border border-[#19A7A0]/30 font-heading">
            Fiji Bank Billing
          </span>
        </div>

        {/* Currency Switcher */}
        <div>
          <label className="text-xs font-semibold text-[#24344D] block mb-1.5 font-heading">
            Display Currency Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F7FA] rounded-lg border border-[#D9F1EC]">
            {(['FJD', 'USD', 'DUAL'] as CurrencyMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ currencyMode: mode })}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer font-heading ${
                  config.currencyMode === mode
                    ? 'bg-[#164B91] text-white shadow-xs'
                    : 'text-[#24344D]/70 hover:text-[#164B91]'
                }`}
              >
                {mode === 'FJD' && 'FJD ($)'}
                {mode === 'USD' && 'USD ($)'}
                {mode === 'DUAL' && 'Dual View'}
              </button>
            ))}
          </div>
        </div>

        {/* Live USD to FJD Exchange Rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#24344D] flex items-center gap-1.5 font-heading">
              <span>Exchange Rate (1 USD = ? FJD)</span>
            </label>
            <button
              type="button"
              onClick={() => onChange({ exchangeRateFJD: DEFAULT_EXCHANGE_RATE_FJD })}
              className="text-[11px] text-[#164B91] hover:text-[#123e78] transition-colors font-semibold cursor-pointer font-heading"
            >
              Reset to 2.2554
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24344D]/50 text-xs font-mono">
              $1 USD =
            </div>
            <input
              type="number"
              step="0.0001"
              min="1"
              max="5"
              value={config.exchangeRateFJD}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onChange({ exchangeRateFJD: val });
                }
              }}
              className="w-full bg-[#F5F7FA]/70 border border-[#D9F1EC] rounded-lg py-2 pl-24 pr-16 text-sm text-[#24344D] font-mono tabular-nums focus:outline-none focus:border-[#164B91] focus:bg-white focus:ring-1 focus:ring-[#164B91]"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#24344D]/50 text-xs font-mono">
              FJD
            </div>
          </div>
        </div>

        {/* Fiji Bank FX Spread Toggle (Sunset Orange #F28C28 - 3.5%) */}
        <div className="pt-3 border-t border-[#D9F1EC]">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.fxSpreadEnabled}
              onChange={(e) => onChange({ fxSpreadEnabled: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#F28C28] focus:ring-0 accent-[#F28C28]"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#24344D] group-hover:text-[#F28C28] transition-colors font-heading">
                  Fiji Bank FX Card Spread (+3.5%)
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F28C28]/15 text-[#F28C28] border border-[#F28C28]/30">
                  × 1.035
                </span>
              </div>
              <p className="text-[11px] text-[#24344D]/70 mt-0.5 leading-relaxed">
                Applies standard Fiji commercial bank conversion fee (ANZ, BSP, Westpac Fiji) charged when settling cloud invoices in USD.
              </p>
            </div>
          </label>
        </div>

        {/* Month 1 Free Dev Tier Optimization Toggle (Reef Teal #19A7A0) */}
        <div className="pt-3 border-t border-[#D9F1EC]">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.freeDevTierM1}
              onChange={(e) => onChange({ freeDevTierM1: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#19A7A0] focus:ring-0 accent-[#19A7A0]"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#24344D] group-hover:text-[#19A7A0] transition-colors font-heading">
                  Month 1 Free Dev Tier Optimization
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#D9F1EC] text-[#164B91] border border-[#19A7A0]/30 font-heading">
                  Save M1 Hosting
                </span>
              </div>
              <p className="text-[11px] text-[#24344D]/70 mt-0.5 leading-relaxed">
                Simulates local Docker CLI + Azure Free F1 during Weeks 1–5 before Week 6 cutover. Month 1 outlay drops to $20 USD.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* SECTION 3: Vendor Service Tiers */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#164B91]" />
          <h3 className="text-sm font-bold text-[#24344D] font-heading">Vendor Service Configuration</h3>
        </div>

        {/* Vendor A: Claude AI Subscription (Royal Purple #6941A5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6941A5] flex items-center gap-1.5 font-heading">
              <Zap className="w-3.5 h-3.5 text-[#6941A5]" />
              Claude AI Subscription Schedule
            </span>
            <span className="text-[11px] text-[#6941A5] font-mono font-semibold bg-[#6941A5]/10 px-2 py-0.5 rounded border border-[#6941A5]/25">
              Month 1: $20.00 USD
            </span>
          </div>

          <p className="text-[11px] text-[#24344D]/60">
            Months 2–12 Plan (11 months):
          </p>

          <div className="space-y-1.5">
            {(Object.keys(CLAUDE_PRICING.tiers) as ClaudePlanM212[]).map((planKey) => {
              const plan = CLAUDE_PRICING.tiers[planKey];
              const isSelected = config.claudePlanM212 === planKey;
              return (
                <button
                  key={planKey}
                  type="button"
                  onClick={() => onChange({ claudePlanM212: planKey })}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#6941A5] bg-[#6941A5]/10 text-[#24344D] ring-1 ring-[#6941A5]/40 font-semibold'
                      : 'border-[#D9F1EC] bg-[#F5F7FA]/50 text-[#24344D]/80 hover:border-[#6941A5]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-heading">{plan.name}</span>
                    <span className="text-xs font-mono font-bold text-[#6941A5]">
                      ${plan.monthlyUsd.toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="text-[11px] text-[#24344D]/60 mt-0.5">{plan.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendor B: Supabase Pro Tier (Reef Teal #19A7A0) */}
        <div className="space-y-2.5 pt-3 border-t border-[#D9F1EC]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#19A7A0] flex items-center gap-1.5 font-heading">
              <Database className="w-3.5 h-3.5 text-[#19A7A0]" />
              Supabase Pro Tier
            </span>
            <span className="text-[11px] text-[#164B91] font-mono font-semibold bg-[#D9F1EC] px-2 py-0.5 rounded border border-[#19A7A0]/30 font-heading">
              Base Pro: $25.00/mo
            </span>
          </div>

          <p className="text-[11px] text-[#24344D]/60">
            Compute Tier (Net after $10 compute credit):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(SUPABASE_PRICING.tiers) as SupabaseComputeTier[]).map((tierKey) => {
              const tier = SUPABASE_PRICING.tiers[tierKey];
              const isSelected = config.supabaseComputeTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => onChange({ supabaseComputeTier: tierKey })}
                  className={`text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#19A7A0] bg-[#D9F1EC]/60 text-[#24344D] ring-1 ring-[#19A7A0]/40 font-semibold'
                      : 'border-[#D9F1EC] bg-[#F5F7FA]/50 text-[#24344D]/80 hover:border-[#19A7A0]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate font-heading">{tier.name.split(' (')[0]}</span>
                    <span className="text-xs font-mono font-bold text-[#19A7A0] shrink-0">
                      ${tier.totalUsd}/mo
                    </span>
                  </div>
                  <div className="text-[10px] text-[#24344D]/60 mt-0.5 truncate">{tier.specs}</div>
                </button>
              );
            })}
          </div>

          {/* Supabase Add-ons: PITR & Overages */}
          <div className="p-3 bg-[#EAF4F8]/60 border border-[#D9F1EC] rounded-lg space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.supabasePitrEnabled}
                  onChange={(e) => onChange({ supabasePitrEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-[#164B91] focus:ring-0 accent-[#164B91]"
                />
                <span className="text-xs font-semibold text-[#24344D]">Point-in-Time Recovery (PITR 7-Day)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#164B91]">+$100.00/mo</span>
            </label>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#24344D] font-medium">Database & Storage Overages</span>
                <span className="font-mono font-bold text-[#164B91]">
                  {config.supabaseOverageGb} GB (+${(config.supabaseOverageGb * 0.125).toFixed(2)}/mo)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.supabaseOverageGb}
                onChange={(e) => onChange({ supabaseOverageGb: parseInt(e.target.value, 10) || 0 })}
                className="w-full accent-[#19A7A0] bg-[#D9F1EC] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#24344D]/60 mt-0.5 font-mono">
                <span>0 GB (Included)</span>
                <span>$0.125 / GB</span>
                <span>100 GB (+$12.50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor C: Microsoft Azure Backend (Ocean Blue #164B91) */}
        <div className="space-y-2 pt-3 border-t border-[#D9F1EC]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#164B91] flex items-center gap-1.5 font-heading">
              <Cloud className="w-3.5 h-3.5 text-[#164B91]" />
              Microsoft Azure Backend
            </span>
            <span className="text-[11px] text-[#24344D]/60">Linux App Service & Functions</span>
          </div>

          <div className="space-y-1.5">
            {(Object.keys(AZURE_PRICING.tiers) as AzureComputeTier[]).map((tierKey) => {
              const tier = AZURE_PRICING.tiers[tierKey];
              const isSelected = config.azureComputeTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => onChange({ azureComputeTier: tierKey })}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#164B91] bg-[#EAF4F8] text-[#24344D] ring-1 ring-[#164B91]/30 font-semibold'
                      : 'border-[#D9F1EC] bg-[#F5F7FA]/50 text-[#24344D]/80 hover:border-[#164B91]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-heading">{tier.name}</span>
                    <span className="text-xs font-mono font-bold text-[#164B91]">
                      ${tier.monthlyUsd.toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="text-[11px] text-[#24344D]/60 mt-0.5 flex items-center justify-between">
                    <span>{tier.specs}</span>
                    {'breakdown' in tier && (
                      <span className="text-[10px] text-[#24344D]/50 font-mono">({tier.breakdown})</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

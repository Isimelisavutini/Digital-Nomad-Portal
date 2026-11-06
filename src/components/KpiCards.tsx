import React from 'react';
import { CostSummary, CostConfiguration } from '../types';
import { formatCurrencyValue } from '../constants';
import { Calendar, TrendingUp, Calculator, DollarSign, Percent, Waves } from 'lucide-react';

interface KpiCardsProps {
  summary: CostSummary;
  config: CostConfiguration;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, config }) => {
  const m1Display = formatCurrencyValue(
    config.fxSpreadEnabled ? summary.month1FjdWithFx : summary.month1Fjd,
    summary.month1Usd,
    config.currencyMode
  );

  const runRateDisplay = formatCurrencyValue(
    config.fxSpreadEnabled ? summary.monthlyRunRateFjdWithFx : summary.monthlyRunRateFjd,
    summary.monthlyRunRateUsd,
    config.currencyMode
  );

  const averageDisplay = formatCurrencyValue(
    config.fxSpreadEnabled ? summary.annualAverageFjdWithFx : summary.annualAverageFjd,
    summary.annualAverageUsd,
    config.currencyMode
  );

  const grandTotalDisplay = formatCurrencyValue(
    config.fxSpreadEnabled ? summary.grandTotalFjdWithFx : summary.grandTotalFjdMidMarket,
    summary.grandTotalUsd,
    config.currencyMode
  );

  const midMarketFjdStr = `$${summary.grandTotalFjdMidMarket.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} FJD`;

  const withFxFjdStr = `$${summary.grandTotalFjdWithFx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} FJD`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* Card 1: Month 1 Cash Outlay (Ocean Blue #164B91) */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs hover:shadow-md transition-all hover:border-[#164B91]/40">
        <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-2">
          <span className="font-semibold text-[#24344D] font-heading">Month 1 Outlay</span>
          <span className="p-1.5 rounded-lg bg-[#EAF4F8] text-[#164B91] border border-[#164B91]/15">
            <Calendar className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#164B91] font-mono tabular-nums">
          {m1Display.primary}
        </div>
        {m1Display.secondary && (
          <div className="text-xs text-[#24344D]/60 font-mono tabular-nums mt-0.5">
            {m1Display.secondary}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-[#EAF4F8] flex items-center justify-between text-xs">
          <span className="text-[#24344D]/70">
            {config.freeDevTierM1 ? 'Free dev tier active' : 'Claude Pro ($20) + Hosting'}
          </span>
          <span className="text-[#164B91] font-semibold font-heading">Build Phase</span>
        </div>
      </div>

      {/* Card 2: Months 2–12 Monthly Run Rate (Reef Teal #19A7A0) */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs hover:shadow-md transition-all hover:border-[#19A7A0]/40">
        <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-2">
          <span className="font-semibold text-[#24344D] font-heading">Monthly Run Rate (M2–12)</span>
          <span className="p-1.5 rounded-lg bg-[#D9F1EC]/60 text-[#19A7A0] border border-[#19A7A0]/20">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#24344D] font-mono tabular-nums">
          {runRateDisplay.primary}
          <span className="text-sm font-normal text-[#24344D]/60"> /mo</span>
        </div>
        {runRateDisplay.secondary && (
          <div className="text-xs text-[#24344D]/60 font-mono tabular-nums mt-0.5">
            {runRateDisplay.secondary} /mo
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-[#D9F1EC]/60 flex items-center justify-between text-xs">
          <span className="text-[#24344D]/70">Claude Max + Live Stack</span>
          <span className="text-[#19A7A0] font-semibold font-heading">11-Mo Baseline</span>
        </div>
      </div>

      {/* Card 3: 12-Month Blended Monthly Average (Royal Purple #6941A5) */}
      <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs hover:shadow-md transition-all hover:border-[#6941A5]/40">
        <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-2">
          <span className="font-semibold text-[#24344D] font-heading">12-Mo Blended Average</span>
          <span className="p-1.5 rounded-lg bg-[#6941A5]/10 text-[#6941A5] border border-[#6941A5]/20">
            <Calculator className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#24344D] font-mono tabular-nums">
          {averageDisplay.primary}
          <span className="text-sm font-normal text-[#24344D]/60"> /mo</span>
        </div>
        {averageDisplay.secondary && (
          <div className="text-xs text-[#24344D]/60 font-mono tabular-nums mt-0.5">
            {averageDisplay.secondary} /mo
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[#24344D]/70">Smoothed annual burn</span>
          <span className="text-[#6941A5] font-semibold font-heading">Total ÷ 12</span>
        </div>
      </div>

      {/* Card 4: 12-Month Grand Total (Sunset Orange #F28C28 Accent with Deep Navy #24344D Contrast) */}
      <div className="bg-white border-2 border-[#F28C28]/40 rounded-xl p-5 shadow-xs hover:shadow-md transition-all hover:border-[#F28C28] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F28C28]/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs text-[#24344D]/70 mb-2">
          <span className="font-bold text-[#24344D] font-heading">12-Month Grand Total</span>
          <span className="p-1.5 rounded-lg bg-[#F28C28]/15 text-[#F28C28] border border-[#F28C28]/30">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#24344D] font-mono tabular-nums">
          {grandTotalDisplay.primary}
        </div>
        {grandTotalDisplay.secondary && (
          <div className="text-xs text-[#24344D]/70 font-mono tabular-nums mt-0.5">
            {grandTotalDisplay.secondary}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#F28C28]/20 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#24344D]/70">Mid-market rate:</span>
            <span className="text-[#24344D] font-mono font-medium">{midMarketFjdStr}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#F28C28] flex items-center gap-1 font-semibold">
              <Percent className="w-3 h-3" /> With 3.5% Card FX:
            </span>
            <span className="text-[#F28C28] font-bold font-mono">{withFxFjdStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  Bar,
  ComposedChart,
} from 'recharts';
import { CostSummary, CostConfiguration } from '../types';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface MonthlyChartProps {
  summary: CostSummary;
  config: CostConfiguration;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ summary, config }) => {
  const [showCumulativeLine, setShowCumulativeLine] = useState(true);

  const isUSD = config.currencyMode === 'USD';
  const currencySymbol = isUSD ? 'USD $' : 'FJD $';

  const chartData = summary.months.map((m) => {
    return {
      monthLabel: m.monthLabel,
      month: m.month,
      claude: isUSD ? m.claudeUsd : m.claudeFjd,
      supabase: isUSD ? m.supabaseUsd : m.supabaseFjd,
      azure: isUSD ? m.azureUsd : m.azureFjd,
      fxFee: isUSD ? m.fxFeeUsd : m.fxFeeFjd,
      total: isUSD ? m.totalUsd : m.totalFjd,
      cumulative: isUSD ? m.cumulativeUsd : m.cumulativeFjd,
      raw: m,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload.raw;

      return (
        <div className="bg-white border border-[#D9F1EC] rounded-xl p-4 shadow-xl text-xs space-y-2 min-w-[270px] font-sans">
          <div className="flex items-center justify-between border-b border-[#EAF4F8] pb-2">
            <span className="font-bold text-[#24344D] text-sm font-heading">{data.monthLabel}</span>
            <span className="text-[11px] text-[#24344D]/60 font-mono font-medium">
              {data.month === 1 ? 'Build Outlay' : 'Production Run Rate'}
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            {/* Claude AI - Royal Purple #6941A5 */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#6941A5] font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#6941A5] inline-block" />
                Claude AI:
              </span>
              <span className="text-[#24344D] font-semibold">
                ${data.claudeFjd.toFixed(2)} FJD{' '}
                <span className="text-[#24344D]/40 font-normal">(${data.claudeUsd.toFixed(2)} USD)</span>
              </span>
            </div>

            {/* Supabase Pro - Reef Teal #19A7A0 */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#19A7A0] font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#19A7A0] inline-block" />
                Supabase Pro:
              </span>
              <span className="text-[#24344D] font-semibold">
                ${data.supabaseFjd.toFixed(2)} FJD{' '}
                <span className="text-[#24344D]/40 font-normal">(${data.supabaseUsd.toFixed(2)} USD)</span>
              </span>
            </div>

            {/* Azure Backend - Ocean Blue #164B91 */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#164B91] font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#164B91] inline-block" />
                Azure Backend:
              </span>
              <span className="text-[#24344D] font-semibold">
                ${data.azureFjd.toFixed(2)} FJD{' '}
                <span className="text-[#24344D]/40 font-normal">(${data.azureUsd.toFixed(2)} USD)</span>
              </span>
            </div>

            {/* Bank Card FX - Sunset Orange #F28C28 (Exception Series) */}
            {config.fxSpreadEnabled && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#F28C28] font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F28C28] inline-block" />
                  3.5% Card FX:
                </span>
                <span className="text-[#F28C28] font-semibold">
                  +${data.fxFeeFjd.toFixed(2)} FJD{' '}
                  <span className="text-[#F28C28]/70 font-normal">(${data.fxFeeUsd.toFixed(2)} USD)</span>
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-[#EAF4F8] flex items-center justify-between font-bold text-sm">
              <span className="text-[#24344D]">Total:</span>
              <span className="text-[#164B91]">
                ${data.totalFjd.toFixed(2)} FJD{' '}
                <span className="text-[#24344D]/50 text-xs font-normal">(${data.totalUsd.toFixed(2)} USD)</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#D9F1EC] rounded-xl p-6 shadow-xs space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF4F8] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#24344D] flex items-center gap-2 font-heading">
            <BarChart3 className="w-5 h-5 text-[#164B91]" />
            <span>12-Month Financial Trajectory</span>
          </h3>
          <p className="text-xs text-[#24344D]/70 mt-0.5">
            Pacific stack breakdown: Claude AI, Supabase Pro, Azure Linux, and Fiji Bank FX spread.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-[#F5F7FA] border border-[#D9F1EC] px-3 py-1.5 rounded-lg text-[#24344D] hover:bg-[#EAF4F8] transition-colors">
            <input
              type="checkbox"
              checked={showCumulativeLine}
              onChange={(e) => setShowCumulativeLine(e.target.checked)}
              className="rounded text-[#164B91] focus:ring-[#164B91]"
            />
            <span className="font-medium">Cumulative Spend Line</span>
          </label>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF4F8" />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: '#D9F1EC' }}
              tick={{ fill: '#24344D', fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={{ stroke: '#D9F1EC' }}
              tick={{ fill: '#24344D', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#164B91', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
              hide={!showCumulativeLine}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => {
                const map: Record<string, string> = {
                  claude: 'Claude AI (Purple)',
                  supabase: 'Supabase Pro (Reef Teal)',
                  azure: 'Azure Backend (Ocean Blue)',
                  fxFee: '3.5% Card FX (Orange)',
                  cumulative: 'Cumulative Spend Line',
                };
                return <span className="text-xs font-semibold text-[#24344D] mr-2">{map[value] || value}</span>;
              }}
            />

            {/* Stacked bars: Ocean Blue, Purple, Reef Teal, and Orange per Section 6 */}
            <Bar
              yAxisId="left"
              dataKey="claude"
              stackId="monthly"
              fill="#6941A5" /* Royal Purple */
              radius={[0, 0, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="supabase"
              stackId="monthly"
              fill="#19A7A0" /* Reef Teal */
              radius={[0, 0, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="azure"
              stackId="monthly"
              fill="#164B91" /* Ocean Blue */
              radius={[0, 0, 0, 0]}
            />
            {config.fxSpreadEnabled && (
              <Bar
                yAxisId="left"
                dataKey="fxFee"
                stackId="monthly"
                fill="#F28C28" /* Sunset Orange */
                radius={[4, 4, 0, 0]}
              />
            )}

            {/* Cumulative Line Overlay (Deep Navy / Ocean Blue) */}
            {showCumulativeLine && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#164B91"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#164B91', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, fill: '#19A7A0' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Insights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D9F1EC] text-xs">
        <div className="p-3 bg-[#EAF4F8]/60 rounded-xl border border-[#D9F1EC]">
          <div className="text-[#164B91] font-bold font-heading">Month 1 Outlay</div>
          <div className="text-[#24344D] font-mono font-bold text-sm mt-0.5">
            ${summary.month1FjdWithFx.toFixed(2)} FJD{' '}
            <span className="text-[#24344D]/50 font-normal text-xs">(${summary.month1Usd.toFixed(2)} USD)</span>
          </div>
          <div className="text-[11px] text-[#164B91] mt-1">
            {config.freeDevTierM1 ? 'Hosting waived during build' : 'Claude Pro ($20) + Foundation'}
          </div>
        </div>

        <div className="p-3 bg-[#D9F1EC]/40 rounded-xl border border-[#19A7A0]/25">
          <div className="text-[#19A7A0] font-bold font-heading">Months 2–12 Run Rate</div>
          <div className="text-[#24344D] font-mono font-bold text-sm mt-0.5">
            ${summary.monthlyRunRateFjdWithFx.toFixed(2)} FJD /mo{' '}
            <span className="text-[#24344D]/50 font-normal text-xs">(${summary.monthlyRunRateUsd.toFixed(2)} USD)</span>
          </div>
          <div className="text-[11px] text-[#24344D]/70 mt-1">
            Steady-state hosting + Claude Max (5x)
          </div>
        </div>

        <div className="p-3 bg-[#6941A5]/5 rounded-xl border border-[#6941A5]/20">
          <div className="text-[#6941A5] font-bold font-heading">Claude API Credit Value</div>
          <div className="text-[#24344D] font-mono font-bold text-sm mt-0.5">
            $1,100.00 USD Platform Credits
          </div>
          <div className="text-[11px] text-[#6941A5] mt-1">
            Bundled into Claude Max ($100/mo)
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CostSummary, CostConfiguration } from '../types';
import { Download, Copy, Check, FileSpreadsheet } from 'lucide-react';

interface BreakdownTableProps {
  summary: CostSummary;
  config: CostConfiguration;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ summary, config }) => {
  const [copied, setCopied] = useState(false);
  const isUSD = config.currencyMode === 'USD';
  const isDual = config.currencyMode === 'DUAL';

  const formatCell = (fjdVal: number, usdVal: number) => {
    if (isUSD) {
      return `$${usdVal.toFixed(2)}`;
    }
    if (isDual) {
      return (
        <div>
          <div className="text-[#24344D] font-semibold">${fjdVal.toFixed(2)}</div>
          <div className="text-[10px] text-[#24344D]/50 font-normal">${usdVal.toFixed(2)} USD</div>
        </div>
      );
    }
    return `$${fjdVal.toFixed(2)}`;
  };

  const handleCopySummary = () => {
    const lines = [
      `Digital Nomad · Financial Cost Ledger`,
      `Exchange Rate: 1 USD = ${config.exchangeRateFJD} FJD`,
      `Bank FX Spread: ${config.fxSpreadEnabled ? '3.5% Active' : 'Disabled'}`,
      `Month 1 Outlay: $${summary.month1FjdWithFx.toFixed(2)} FJD ($${summary.month1Usd.toFixed(2)} USD)`,
      `Monthly Run Rate (M2-12): $${summary.monthlyRunRateFjdWithFx.toFixed(2)} FJD/mo ($${summary.monthlyRunRateUsd.toFixed(2)} USD/mo)`,
      `12-Month Grand Total: $${summary.grandTotalFjdWithFx.toFixed(2)} FJD ($${summary.grandTotalUsd.toFixed(2)} USD)`,
      `----------------------------------------`,
      `Month | Claude | Supabase | Azure | FX Fee | Total FJD | Total USD`,
    ];

    summary.months.forEach((m) => {
      lines.push(
        `M${m.month} | $${m.claudeFjd.toFixed(2)} | $${m.supabaseFjd.toFixed(2)} | $${m.azureFjd.toFixed(2)} | $${m.fxFeeFjd.toFixed(2)} | $${m.totalFjd.toFixed(2)} | $${m.totalUsd.toFixed(2)}`
      );
    });

    lines.push(
      `Annual | $${summary.claudeTotalFjd.toFixed(2)} | $${summary.supabaseTotalFjd.toFixed(2)} | $${summary.azureTotalFjd.toFixed(2)} | $${summary.fxTotalFjd.toFixed(2)} | $${summary.grandTotalFjdWithFx.toFixed(2)} | $${summary.grandTotalUsd.toFixed(2)}`
    );

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'Month',
      'Claude (USD)',
      'Claude (FJD)',
      'Supabase (USD)',
      'Supabase (FJD)',
      'Azure (USD)',
      'Azure (FJD)',
      'FX Fee (USD)',
      'FX Fee (FJD)',
      'Total (USD)',
      'Total (FJD)',
      'Cumulative (USD)',
      'Cumulative (FJD)',
    ];

    const rows = summary.months.map((m) => [
      `M${m.month}`,
      m.claudeUsd.toFixed(2),
      m.claudeFjd.toFixed(2),
      m.supabaseUsd.toFixed(2),
      m.supabaseFjd.toFixed(2),
      m.azureUsd.toFixed(2),
      m.azureFjd.toFixed(2),
      m.fxFeeUsd.toFixed(2),
      m.fxFeeFjd.toFixed(2),
      m.totalUsd.toFixed(2),
      m.totalFjd.toFixed(2),
      m.cumulativeUsd.toFixed(2),
      m.cumulativeFjd.toFixed(2),
    ]);

    rows.push([
      'Full Year',
      summary.claudeTotalUsd.toFixed(2),
      summary.claudeTotalFjd.toFixed(2),
      summary.supabaseTotalUsd.toFixed(2),
      summary.supabaseTotalFjd.toFixed(2),
      summary.azureTotalUsd.toFixed(2),
      summary.azureTotalFjd.toFixed(2),
      summary.fxTotalUsd.toFixed(2),
      summary.fxTotalFjd.toFixed(2),
      summary.grandTotalUsd.toFixed(2),
      summary.grandTotalFjdWithFx.toFixed(2),
      summary.grandTotalUsd.toFixed(2),
      summary.grandTotalFjdWithFx.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Digital_Nomad_Financial_Cost_Ledger_FJD_USD.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#D9F1EC] rounded-xl p-5 shadow-xs space-y-4 font-sans">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#164B91]" />
            <h3 className="text-sm font-bold text-[#24344D] font-heading">
              Month-by-Month Financial Ledger
            </h3>
          </div>
          <p className="text-xs text-[#24344D]/70 mt-0.5">
            Detailed breakdown per cloud vendor in {isUSD ? 'USD' : 'FJD'}{' '}
            {isDual ? 'with secondary USD' : ''} (M1 to M12 + Annual Total).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#D9F1EC] bg-white text-[#164B91] hover:bg-[#EAF4F8] shadow-2xs transition-all cursor-pointer font-heading"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#19A7A0]" /> : <Copy className="w-3.5 h-3.5 text-[#164B91]" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#164B91] text-white hover:bg-[#123e78] shadow-xs transition-all cursor-pointer font-heading"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-lg border border-[#D9F1EC]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#EAF4F8] text-[#164B91] border-b border-[#D9F1EC] font-bold font-heading">
              <th className="py-3 px-3">Month</th>
              <th className="py-3 px-3 text-right text-[#6941A5]">Claude AI (Purple)</th>
              <th className="py-3 px-3 text-right text-[#19A7A0]">Supabase Pro (Reef Teal)</th>
              <th className="py-3 px-3 text-right text-[#164B91]">Azure Backend (Ocean Blue)</th>
              {config.fxSpreadEnabled && (
                <th className="py-3 px-3 text-right text-[#F28C28]">3.5% FX Fee (Orange)</th>
              )}
              <th className="py-3 px-3 text-right text-[#24344D] font-bold">Monthly Total</th>
              <th className="py-3 px-3 text-right text-[#164B91] font-bold">Cumulative YTD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAF4F8] font-mono tabular-nums">
            {summary.months.map((m) => {
              const isM1 = m.month === 1;
              return (
                <tr
                  key={m.month}
                  className={`hover:bg-[#F5F7FA] transition-colors ${
                    isM1 ? 'bg-[#EAF4F8]/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-sans font-semibold text-[#24344D] flex items-center gap-1.5">
                      <span>M{m.month}</span>
                      {isM1 ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6941A5]/10 text-[#6941A5] font-bold font-sans">
                          Build
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#24344D]/50 font-sans">Run</span>
                      )}
                    </div>
                  </td>

                  {/* Claude - Royal Purple */}
                  <td className="py-2.5 px-3 text-right text-[#6941A5] font-medium">
                    {formatCell(m.claudeFjd, m.claudeUsd)}
                  </td>

                  {/* Supabase - Reef Teal */}
                  <td className="py-2.5 px-3 text-right text-[#19A7A0] font-medium">
                    {formatCell(m.supabaseFjd, m.supabaseUsd)}
                  </td>

                  {/* Azure - Ocean Blue */}
                  <td className="py-2.5 px-3 text-right text-[#164B91] font-medium">
                    {formatCell(m.azureFjd, m.azureUsd)}
                  </td>

                  {/* FX Fee - Sunset Orange */}
                  {config.fxSpreadEnabled && (
                    <td className="py-2.5 px-3 text-right text-[#F28C28] font-medium">
                      {formatCell(m.fxFeeFjd, m.fxFeeUsd)}
                    </td>
                  )}

                  {/* Monthly Total */}
                  <td className="py-2.5 px-3 text-right font-bold text-[#24344D]">
                    {formatCell(m.totalFjd, m.totalUsd)}
                  </td>

                  {/* Cumulative YTD */}
                  <td className="py-2.5 px-3 text-right font-bold text-[#164B91]">
                    {formatCell(m.cumulativeFjd, m.cumulativeUsd)}
                  </td>
                </tr>
              );
            })}

            {/* Annual Total Row (Lagoon Mist #EAF4F8 accent) */}
            <tr className="bg-[#EAF4F8] font-bold border-t-2 border-[#164B91]/30 text-[#24344D]">
              <td className="py-3 px-3 font-sans text-sm text-[#164B91] font-bold font-heading">
                12-Month Total
              </td>
              <td className="py-3 px-3 text-right text-[#6941A5] font-bold">
                {formatCell(summary.claudeTotalFjd, summary.claudeTotalUsd)}
              </td>
              <td className="py-3 px-3 text-right text-[#19A7A0] font-bold">
                {formatCell(summary.supabaseTotalFjd, summary.supabaseTotalUsd)}
              </td>
              <td className="py-3 px-3 text-right text-[#164B91] font-bold">
                {formatCell(summary.azureTotalFjd, summary.azureTotalUsd)}
              </td>
              {config.fxSpreadEnabled && (
                <td className="py-3 px-3 text-right text-[#F28C28] font-bold">
                  {formatCell(summary.fxTotalFjd, summary.fxTotalUsd)}
                </td>
              )}
              <td className="py-3 px-3 text-right text-[#24344D] font-extrabold text-sm">
                {formatCell(summary.grandTotalFjdWithFx, summary.grandTotalUsd)}
              </td>
              <td className="py-3 px-3 text-right text-[#164B91] font-extrabold text-sm">
                {formatCell(summary.grandTotalFjdWithFx, summary.grandTotalUsd)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#24344D]/60 pt-1 gap-2">
        <span>* Conversions computed at live rate: 1 USD = {config.exchangeRateFJD} FJD.</span>
        <span>
          Bank card FX surcharge: {config.fxSpreadEnabled ? '3.5% active in totals' : 'Disabled'}.
        </span>
      </div>
    </div>
  );
};

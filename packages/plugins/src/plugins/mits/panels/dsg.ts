import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME, SEED_DAMS } from '../data/seed';
import { t, getLocale } from '../i18n';
import type { MitsStation, MitsRealtime, MitsDam } from '../types';
import { STORAGE_KEYS, STATUS_COLORS } from '../constants';

function fmtAcft(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function teacupHtml(dam: MitsDam): string {
  const pct = Math.max(0, Math.min(100, dam.storage_pct || 0));
  const cap = dam.live_storage_capacity_acft || 0;
  const stor = dam.storage_acft || 0;
  let tier = '';
  if (pct < 20) tier = 'critical';
  else if (pct < 35) tier = 'low';

  const tierColor = tier === 'critical' ? '#ef4444' : tier === 'low' ? '#f0a63d' : '#33c17b';
  const fillColor = pct >= 50 ? '#3b82f6' : pct >= 25 ? '#60a5fa' : '#93c5fd';

  const volLine = cap
    ? `${fmtAcft(stor)} / ${fmtAcft(cap)} ac-ft`
    : `${fmtAcft(stor)} ac-ft`;

  return `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center;min-width:160px;">
      <div style="position:relative;width:80px;height:80px;margin:0 auto 10px;border:2px solid ${tierColor};border-radius:0 0 40px 40px;overflow:hidden;background:#1e293b;">
        <div style="position:absolute;bottom:0;left:0;right:0;height:${pct}%;background:${fillColor};transition:height .5s;border-radius:0 0 38px 38px;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;font-weight:700;color:#f1f5f9;z-index:1;">${pct.toFixed(0)}%</div>
      </div>
      <div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">${dam.name}</div>
      <div style="font-size:11px;color:#94a3b8;">${volLine}</div>
      <div style="font-size:11px;color:${tierColor};font-weight:600;margin-top:4px;">${tier ? tier.toUpperCase() : 'NORMAL'}</div>
    </div>`;
}

function damTableHtml(dams: MitsDam[]): string {
  const rows = dams.map((d) => {
    const pctColor = d.storage_pct < 20 ? '#ef4444' : d.storage_pct < 35 ? '#f0a63d' : '#33c17b';
    const releaseLabel = d.release_closed ? t('dam_closed', getLocale()) : `${d.release_q} Q`;
    return `
      <tr>
        <td style="text-align:left;font-weight:600;padding:8px 12px;border-bottom:1px solid #1e293b;">${d.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;">${d.level_ft}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;">${fmtAcft(d.storage_acft)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;color:${pctColor};font-weight:600;">${d.storage_pct.toFixed(1)}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;">${releaseLabel}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;">${d.spill_q}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;color:#60a5fa;">${fmtAcft(d.storage_acft_prev_year)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-family:monospace;color:#60a5fa;">${d.storage_pct_prev_year.toFixed(1)}%</td>
      </tr>`;
  }).join('');

  const totalStorage = dams.reduce((s, d) => s + (d.storage_acft || 0), 0);
  const totalRelease = dams.reduce((s, d) => s + (d.release_q || 0), 0);
  const totalSpill = dams.reduce((s, d) => s + (d.spill_q || 0), 0);

  return `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;text-align:left;">${t('dam_col_dam', getLocale())}</th>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;">${t('dam_row_level', getLocale())}</th>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;">Storage</th>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;">%</th>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;">Release</th>
            <th style="background:#1e293b;color:#22d3ee;padding:8px 12px;border:1px solid #334155;">Spill</th>
            <th style="background:#1e293b;color:#60a5fa;padding:8px 12px;border:1px solid #334155;">Prev Year</th>
            <th style="background:#1e293b;color:#60a5fa;padding:8px 12px;border:1px solid #334155;">Prev Year %</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="font-weight:700;background:#1e293b;">
            <td style="padding:8px 12px;border:1px solid #334155;">${t('dam_total', getLocale())}</td>
            <td style="padding:8px 12px;border:1px solid #334155;">—</td>
            <td style="padding:8px 12px;border:1px solid #334155;font-family:monospace;">${fmtAcft(totalStorage)}</td>
            <td style="padding:8px 12px;border:1px solid #334155;">—</td>
            <td style="padding:8px 12px;border:1px solid #334155;font-family:monospace;">${totalRelease}</td>
            <td style="padding:8px 12px;border:1px solid #334155;font-family:monospace;">${totalSpill}</td>
            <td style="padding:8px 12px;border:1px solid #334155;">—</td>
            <td style="padding:8px 12px;border:1px solid #334155;">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="font-size:11px;color:#64748b;margin-top:8px;">
      ${t('dam_note_prev', getLocale())}<br/>
      ${t('dam_note_year', getLocale())}<br/>
      ${t('dam_note_time', getLocale())}
    </div>`;
}

export function renderDsgPanel(container: HTMLElement, _app: unknown): void {
  const locale = getLocale();
  const dams = loadEntityStore<MitsDam>(STORAGE_KEYS.dams, SEED_DAMS);

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">
      <div style="padding:10px 16px;border-bottom:1px solid #1e293b;">
        <h3 style="margin:0;font-size:14px;font-weight:700;">${t('dam_storage_graph', locale)}</h3>
      </div>
      <div style="flex:1;overflow-y:auto;padding:16px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));gap:16px;margin-bottom:24px;">
          ${dams.map((d) => teacupHtml(d)).join('')}
        </div>
        <h4 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#22d3ee;">${t('dam_stage_heading', locale)}</h4>
        ${damTableHtml(dams)}
      </div>
    </div>`;
}

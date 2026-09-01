import { loadEntityStore } from '../data/store';
import { SEED_DAMS } from '../data/seed';
import { t } from '../i18n';
import { getLocale } from '../i18n';
import type { MitsDam } from '../types';
import { STORAGE_KEYS } from '../constants';

export function renderDamStatusPanel(container: HTMLElement): void {
  const locale = getLocale();
  const dams = loadEntityStore<MitsDam>(STORAGE_KEYS.dams, SEED_DAMS);

  const formatDate = () => {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const rows = dams.map((d) => {
    const prevDay = (v: number) => `(${v})`;
    return `
      <tr>
        <td style="text-align:left;font-weight:600;">${d.name}</td>
        <td style="color:#ef4444;font-weight:700;font-family:monospace;">${d.level_ft.toFixed(2)}</td>
        <td style="color:#94a3b8;font-size:11px;">${prevDay(d.level_ft_prev)}</td>
        <td style="color:#ef4444;font-weight:700;font-family:monospace;">${d.storage_acft.toLocaleString()}</td>
        <td style="color:#ef4444;font-weight:700;font-family:monospace;">${d.storage_pct.toFixed(2)}%</td>
        <td style="font-family:monospace;">${d.release_closed ? t('dam_closed', locale) : d.release_q.toLocaleString()}</td>
        <td style="font-family:monospace;">${d.spill_q.toLocaleString()}</td>
        <td style="color:#3b82f6;font-family:monospace;">${d.storage_acft_prev_year.toLocaleString()}</td>
        <td style="color:#3b82f6;font-family:monospace;">${d.storage_pct_prev_year.toFixed(2)}%</td>
        <td style="color:#3b82f6;font-family:monospace;">${d.release_q_prev_year.toLocaleString()}</td>
        <td style="color:#3b82f6;font-family:monospace;">${d.spill_q_prev_year.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="padding:16px;">
      <h2 style="margin:0 0 4px;font-size:16px;font-weight:700;text-align:center;">${t('dam_stage_heading', locale)}</h2>
      <p style="margin:0 0 16px;font-size:12px;color:#94a3b8;text-align:center;">${t('dam_stage_date', locale)}: ${formatDate()}</p>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;text-transform:uppercase;font-size:11px;">${t('dam_col_dam', locale)}</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">${t('dam_row_level', locale)}</th>
              <th style="background:#1e293b;color:#64748b;padding:8px;border:1px solid #334155;font-size:10px;">Prev</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">${t('dam_row_storage', locale)}</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">${t('dam_row_storage_pct', locale)}</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">${t('dam_row_release', locale)}</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">${t('dam_row_spill', locale)}</th>
              <th style="background:#1e293b;color:#3b82f6;padding:8px;border:1px solid #334155;">${t('dam_row_storage_year', locale)}</th>
              <th style="background:#1e293b;color:#3b82f6;padding:8px;border:1px solid #334155;">${t('dam_row_storage_pct_year', locale)}</th>
              <th style="background:#1e293b;color:#3b82f6;padding:8px;border:1px solid #334155;">${t('dam_row_release_year', locale)}</th>
              <th style="background:#1e293b;color:#3b82f6;padding:8px;border:1px solid #334155;">${t('dam_row_spill_year', locale)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="margin-top:12px;font-size:11px;color:#64748b;">
        <p style="margin:2px 0;">${t('dam_note_prev', locale)}</p>
        <p style="margin:2px 0;color:#3b82f6;">${t('dam_note_year', locale)}</p>
        <p style="margin:2px 0;">${t('dam_note_time', locale)}</p>
      </div>
    </div>
  `;
}

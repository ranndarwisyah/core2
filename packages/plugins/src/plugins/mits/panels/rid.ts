import { t, getLocale } from '../i18n';
import { RID_SEED } from '../data/seed';

export function renderRidPanel(container: HTMLElement): void {
  const locale = getLocale();

  const rows = RID_SEED.map((r) => `
    <tr>
      <td style="text-align:left;font-weight:600;">${r.region}</td>
      <td>${r.season}</td>
      <td>${r.phase}</td>
      <td style="font-family:monospace;">${r.area.toLocaleString()}</td>
      <td style="font-family:monospace;">${r.q != null ? r.q.toLocaleString() : '-'}</td>
      <td style="font-size:11px;">${r.plan}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="padding:16px;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;">${t('adv_region_duty', locale)}</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;text-align:left;">Region</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">Season</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">Phase</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">Area (ha)</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">Q (m³/s)</th>
              <th style="background:#1e293b;color:#22d3ee;padding:8px;border:1px solid #334155;">Plan</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

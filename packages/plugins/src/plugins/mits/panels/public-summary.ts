import type { GeoLibreAppAPI } from '../../../types';
import { STORAGE_KEYS } from '../constants';
import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { getLocale, t } from '../i18n';
import type { MitsAlertLevel, MitsRealtime, MitsStation } from '../types';
import { escapeHtml, latestReading, relativeTime, stationLevel, statusText } from './station-display';

const LEVEL_ORDER: Record<MitsAlertLevel, number> = { danger: 0, warning: 1, alert: 2, normal: 3 };

const PILL_BG: Record<MitsAlertLevel, string> = {
  normal: 'rgba(51,193,123,.15)',
  alert: 'rgba(34,211,238,.15)',
  warning: 'rgba(240,166,61,.18)',
  danger: 'rgba(239,68,68,.18)',
};

const PILL_FG: Record<MitsAlertLevel, string> = {
  normal: '#33c17b',
  alert: '#22d3ee',
  warning: '#f59e0b',
  danger: '#ef4444',
};

interface SummaryRow {
  id: string;
  name: string;
  district: string;
  type: string;
  value: string;
  unit: string;
  level: MitsAlertLevel;
  label: string;
  updated: string;
  lat: number;
  lon: number;
}

let overlayEl: HTMLElement | null = null;
let filterType = '';
let searchTerm = '';

function buildRows(): SummaryRow[] {
  const locale = getLocale();
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const realtime = loadEntityStore<MitsRealtime>(STORAGE_KEYS.realtime, SEED_REALTIME);
  const rtMap = new Map<string, MitsRealtime>();
  for (const r of realtime) rtMap.set(r.station_id, r);

  return stations
    .map((s) => {
      const rt = rtMap.get(s.station_id);
      const reading = latestReading(rt);
      const level = stationLevel(rt);
      return {
        id: s.station_id,
        name: s.station_name,
        district: s.district,
        type: s.station_type,
        value: reading ? `${reading.value}` : '—',
        unit: reading?.unit ?? '',
        level,
        label: statusText(rt, locale),
        updated:
          rt && rt.status === 'Normal' && rt.datetime
            ? relativeTime(rt.datetime, locale)
            : t('ui_offline', locale),
        lat: s.lat,
        lon: s.lon,
      };
    })
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}

function filteredRows(rows: SummaryRow[]): SummaryRow[] {
  return rows.filter((r) => {
    if (filterType && r.type !== filterType) return false;
    const q = searchTerm.trim().toLowerCase();
    if (q && !r.name.toLowerCase().includes(q) && !r.id.includes(q) && !r.district.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

function pill(level: MitsAlertLevel, label: string): string {
  return `<span style="display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;letter-spacing:.02em;background:${PILL_BG[level]};color:${PILL_FG[level]};">${label}</span>`;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportCsv(): void {
  const rows = filteredRows(buildRows());
  const headers = [
    t('ps_col_station', getLocale()),
    t('ps_col_district', getLocale()),
    t('ps_col_type', getLocale()),
    t('ps_col_value', getLocale()),
    t('ps_col_status', getLocale()),
    t('ps_col_updated', getLocale()),
  ];
  const lines = [headers.map(csvEscape).join(',')];
  rows.forEach((r) => {
    lines.push(
      [r.name, r.district, r.type, `${r.value}${r.unit}`, r.label, r.updated]
        .map(csvEscape)
        .join(','),
    );
  });
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MITS_Public_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPdf(): void {
  const rows = filteredRows(buildRows());
  const locale = getLocale();
  const headers = [
    t('ps_col_station', locale),
    t('ps_col_district', locale),
    t('ps_col_type', locale),
    t('ps_col_value', locale),
    t('ps_col_status', locale),
    t('ps_col_updated', locale),
  ];
  const title = t('ps_title_all', locale);
  const stamp = new Date().toLocaleString('en-GB', { hour12: false });
  const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:18px;margin:0 0 4px}.sub{color:#555;font-size:12px;margin-bottom:16px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #bbb;padding:4px 6px;text-align:left}th{background:#eef1f6}@media print{.no-print{display:none}}</style></head><body>
<h1>${escapeHtml(title)}</h1><div class="sub">Generated ${stamp} · MITS Public Summary</div>
<table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>
${rows.map((r) => `<tr>${[r.name, r.district, r.type, `${r.value}${r.unit}`, r.label, r.updated].map((c) => `<td>${escapeHtml(String(c))}</td>`).join('')}</tr>`).join('')}
</tbody></table>
<p class="no-print" style="margin-top:16px"><button onclick="print()">${escapeHtml(t('ps_export_pdf', locale))}</button></p></body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(htmlDoc);
  win.document.close();
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {}
  }, 350);
}

function renderBody(): void {
  if (!overlayEl) return;
  const locale = getLocale();
  const rows = filteredRows(buildRows());
  const table = overlayEl.querySelector('[data-ps-table]') as HTMLTableElement | null;
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (r) => `
      <tr data-id="${r.id}" style="cursor:pointer;">
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;color:#f1f5f9;font-weight:600;">${escapeHtml(r.name)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;color:#94a3b8;">${escapeHtml(r.district)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;color:#94a3b8;">${escapeHtml(r.type)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;color:#f1f5f9;font-family:ui-monospace,monospace;">${r.value}<span style="color:#64748b;">${r.unit}</span></td>
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;">${pill(r.level, r.label)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #1e293b;color:#94a3b8;">${r.updated}</td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="6" style="padding:16px;text-align:center;color:#64748b;font-size:12px;">${t('ps_no_match', locale)}</td></tr>`;

  tbody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const id = (row as HTMLElement).dataset.id;
      const target = rows.find((r) => r.id === id);
      if (!target) return;
      closePublicSummary();
      setTimeout(() => {
        appRef?.getMap?.()?.flyTo?.({ center: [target.lon, target.lat], zoom: 13 });
      }, 0);
    });
  });
}

let appRef: GeoLibreAppAPI | null = null;

function onFilterChange(): void {
  const typeSelect = overlayEl?.querySelector('[data-ps-type]') as HTMLSelectElement | null;
  const search = overlayEl?.querySelector('[data-ps-search]') as HTMLInputElement | null;
  if (typeSelect) filterType = typeSelect.value;
  if (search) searchTerm = search.value;
  renderBody();
}

export function openPublicSummary(app: GeoLibreAppAPI): void {
  const locale = getLocale();
  if (overlayEl) {
    overlayEl.style.display = 'flex';
    return;
  }
  appRef = app;

  const allTypes = [
    ...new Set(
      loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS).map((s) => s.station_type),
    ),
  ].sort();

  const overlay = document.createElement('div');
  overlay.setAttribute('data-mits-public-summary', '');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:2000;background:#0f172a;color:#e2e8f0;display:flex;flex-direction:column;overflow:hidden;';
  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 20px;border-bottom:1px solid #1e293b;">
      <h2 style="margin:0;font-size:17px;font-weight:600;color:#f1f5f9;">${t('ps_title_all', locale)}</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <select data-ps-type style="background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:7px 10px;font-size:13px;outline:none;">
          <option value="">${t('ps_all_types', locale)}</option>
          ${allTypes.map((tp) => `<option value="${tp}">${tp}</option>`).join('')}
        </select>
        <input type="text" data-ps-search placeholder="${t('ps_search_ph', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:7px 10px;font-size:13px;outline:none;min-width:200px;" />
        <button data-ps-export-csv style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;">${t('ps_export_csv', locale)}</button>
        <button data-ps-export-pdf style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;">${t('ps_export_pdf', locale)}</button>
        <button data-ps-close title="${t('ui_close', locale)}" aria-label="${t('ui_close', locale)}" style="background:transparent;border:none;color:#94a3b8;font-size:18px;line-height:1;cursor:pointer;padding:4px 8px;">×</button>
      </div>
    </div>
    <div style="padding:0 20px;border-bottom:1px solid #1e293b;">
      <div style="display:flex;gap:14px;flex-wrap:wrap;padding:10px 0;font-size:12px;color:#94a3b8;">${t('ps_note', locale)}</div>
    </div>
    <div style="flex:1;overflow:auto;padding:0 20px 24px;">
      <table data-ps-table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="position:sticky;top:0;background:#0f172a;">
            ${[t('ps_col_station', locale), t('ps_col_district', locale), t('ps_col_type', locale), t('ps_col_value', locale), t('ps_col_status', locale), t('ps_col_updated', locale)]
              .map(
                (h) =>
                  `<th style="text-align:left;padding:9px 10px;font-weight:600;color:#64748b;border-bottom:1px solid #1e293b;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">${h}</th>`,
              )
              .join('')}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  document.body.appendChild(overlay);
  overlayEl = overlay;

  overlay.querySelector('[data-ps-close]')?.addEventListener('click', closePublicSummary);
  overlay.querySelector('[data-ps-export-csv]')?.addEventListener('click', exportCsv);
  overlay.querySelector('[data-ps-export-pdf]')?.addEventListener('click', exportPdf);
  overlay.querySelector('[data-ps-type]')?.addEventListener('change', onFilterChange);
  overlay.querySelector('[data-ps-search]')?.addEventListener('input', onFilterChange);

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closePublicSummary();
  };
  document.addEventListener('keydown', onKeyDown);
  (overlay as unknown as { __psKeydown?: (e: KeyboardEvent) => void }).__psKeydown = onKeyDown;

  renderBody();
}

export function closePublicSummary(): void {
  if (!overlayEl) return;
  const keydown = (overlayEl as unknown as { __psKeydown?: (e: KeyboardEvent) => void }).__psKeydown;
  if (keydown) document.removeEventListener('keydown', keydown);
  overlayEl.remove();
  overlayEl = null;
}
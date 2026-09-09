import type { GeoLibreAppAPI } from '../../../types';
import { STORAGE_KEYS } from '../constants';
import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { t, getLocale } from '../i18n';
import type { MitsAlertLevel, MitsRealtime, MitsStation } from '../types';
import { openStationDetail } from './station-detail';
import { openPublicSummary } from './public-summary';
import { isAlertStation, latestReading, relativeTime, stationLevel, statusColor, statusText, escapeHtml } from './station-display';

const LEVEL_ORDER: Record<MitsAlertLevel, number> = { danger: 0, warning: 1, alert: 2, normal: 3 };

export function renderStationListPanel(container: HTMLElement, app: GeoLibreAppAPI): void {
  const locale = getLocale();
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const realtime = loadEntityStore<MitsRealtime>(STORAGE_KEYS.realtime, SEED_REALTIME);

  const rtMap = new Map<string, MitsRealtime>();
  for (const r of realtime) rtMap.set(r.station_id, r);

  let searchTerm = '';
  let filterWilayah = '';
  let filterType = '';
  let activeTab: 'stations' | 'alerts' = 'stations';

  const allWilayah = [...new Set(stations.map((s) => s.wilayah))].sort();
  const allTypes = [...new Set(stations.map((s) => s.station_type))].sort();

  const alertCount = stations.filter((s) => isAlertStation(rtMap.get(s.station_id))).length;

  function getFilteredStations(): MitsStation[] {
    return stations.filter((s) => {
      if (searchTerm && !s.station_name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.station_id.includes(searchTerm)) return false;
      if (filterWilayah && s.wilayah !== filterWilayah) return false;
      if (filterType && s.station_type !== filterType) return false;
      return true;
    });
  }

  function getAlertStations(): MitsStation[] {
    return stations
      .filter((s) => isAlertStation(rtMap.get(s.station_id)))
      .sort((a, b) => {
        const la = stationLevel(rtMap.get(a.station_id));
        const lb = stationLevel(rtMap.get(b.station_id));
        return (LEVEL_ORDER[la] ?? 9) - (LEVEL_ORDER[lb] ?? 9);
      });
  }

  function stationRow(s: MitsStation): string {
    const rt = rtMap.get(s.station_id);
    const dot = statusColor(rt);
    const reading = latestReading(rt);
    const valueStr = reading ? reading.value : '—';
    const unit = reading?.unit ?? '';
    const rel = relativeTime(rt?.datetime, locale);
    const status = statusText(rt, locale);
    const stDot = statusColor(rt);

    return `
      <div class="mits-station-row" data-id="${s.station_id}" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;cursor:pointer;transition:background .1s;">
        <span style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;box-shadow:0 0 4px ${dot};"></span>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;">
            <span style="font-size:12px;font-weight:600;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(s.station_name)}</span>
            <span style="font-size:11px;font-weight:700;color:#f1f5f9;font-family:ui-monospace,monospace;flex-shrink:0;">${valueStr}<span style="color:#64748b;font-size:9px;margin-left:1px;">${unit}</span></span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;gap:6px;">
            <span style="font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rel || '—'}</span>
            <span style="font-size:10px;display:inline-flex;align-items:center;gap:3px;color:${stDot};font-weight:600;flex-shrink:0;"><span style="width:5px;height:5px;border-radius:50%;background:${stDot};"></span>${escapeHtml(status)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function render(): void {
    const filtered = activeTab === 'alerts' ? getAlertStations() : getFilteredStations();

    const stationRows = filtered.map(stationRow).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="padding:8px 12px;border-bottom:1px solid #1e293b;">
          <button data-open-summary style="width:100%;text-align:center;padding:6px;border-radius:6px;font-size:11.5px;font-weight:600;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;margin-bottom:8px;">${t('nav_summary', locale)}</button>
          <div style="display:flex;gap:4px;margin-bottom:8px;">
            <button data-tab="stations" style="flex:1;text-align:center;padding:6px;border-radius:6px;font-size:11.5px;border:1px solid ${activeTab === 'stations' ? '#22d3ee' : '#334155'};background:${activeTab === 'stations' ? 'rgba(34,211,238,0.1)' : 'transparent'};color:${activeTab === 'stations' ? '#22d3ee' : '#94a3b8'};cursor:pointer;">${t('tab_stations', locale)}</button>
            <button data-tab="alerts" style="flex:1;text-align:center;padding:6px;border-radius:6px;font-size:11.5px;border:1px solid ${activeTab === 'alerts' ? '#f59e0b' : '#334155'};background:${activeTab === 'alerts' ? 'rgba(245,158,11,0.1)' : 'transparent'};color:${activeTab === 'alerts' ? '#f59e0b' : '#94a3b8'};cursor:pointer;">${t('tab_alerts', locale)} <span style="background:${alertCount > 0 ? '#ef4444' : '#334155'};color:#fff;border-radius:8px;font-size:9.5px;padding:0 5px;">${alertCount}</span></button>
          </div>
          ${activeTab === 'stations' ? `
            <input type="text" placeholder="${t('search_placeholder', locale)}" value="${searchTerm}" data-search style="width:100%;background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:12px;outline:none;margin-bottom:6px;" />
            <div style="display:flex;gap:4px;">
              <select data-filter-wilayah style="flex:1;background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:4px;font-size:11px;">
                <option value="">${t('ui_all_regions', locale)}</option>
                ${allWilayah.map((w) => `<option value="${w}" ${filterWilayah === w ? 'selected' : ''}>${w}</option>`).join('')}
              </select>
              <select data-filter-type style="flex:1;background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:4px;font-size:11px;">
                <option value="">${t('ps_all_types', locale)}</option>
                ${allTypes.map((tp) => `<option value="${tp}" ${filterType === tp ? 'selected' : ''}>${tp}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>
        <div style="flex:1;overflow-y:auto;padding:4px 8px;">
          ${stationRows || `<div style="padding:16px;text-align:center;color:#64748b;font-size:12px;">${t('ps_no_match', locale)}</div>`}
        </div>
      </div>
    `;

    container.querySelectorAll('.mits-station-row').forEach((row) => {
      const el = row as HTMLElement;
      el.addEventListener('mouseenter', () => { el.style.background = '#1e293b'; });
      el.addEventListener('mouseleave', () => { el.style.background = 'transparent'; });
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const station = stations.find((s) => s.station_id === id);
        if (!station) return;
        app.getMap?.()?.flyTo?.({ center: [station.lon, station.lat], zoom: 13 });
        openStationDetail(app, String(id));
      });
    });

    container.querySelector('[data-open-summary]')?.addEventListener('click', () => {
      openPublicSummary(app);
    });

    container.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = (btn as HTMLElement).dataset.tab as 'stations' | 'alerts';
        render();
      });
    });

    const searchInput = container.querySelector('[data-search]') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value;
        render();
      });
    }

    const wilayahSelect = container.querySelector('[data-filter-wilayah]') as HTMLSelectElement | null;
    if (wilayahSelect) {
      wilayahSelect.addEventListener('change', () => {
        filterWilayah = wilayahSelect.value;
        render();
      });
    }

    const typeSelect = container.querySelector('[data-filter-type]') as HTMLSelectElement | null;
    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        filterType = typeSelect.value;
        render();
      });
    }
  }

  render();
}
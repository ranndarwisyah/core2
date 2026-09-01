import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { t, getLocale } from '../i18n';
import type { MitsStation, MitsRealtime } from '../types';
import { STATION_COLORS, STATUS_COLORS, STORAGE_KEYS } from '../constants';

export function renderStationListPanel(container: HTMLElement, app: { getMap?: () => { flyTo?: (opts: Record<string, unknown>) => void; getZoom?: () => number } | null } | null): void {
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

  function getFilteredStations(): MitsStation[] {
    return stations.filter((s) => {
      if (searchTerm && !s.station_name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.station_id.includes(searchTerm)) return false;
      if (filterWilayah && s.wilayah !== filterWilayah) return false;
      if (filterType && s.station_type !== filterType) return false;
      return true;
    });
  }

  function getAlertStations(): MitsStation[] {
    return stations.filter((s) => {
      const rt = rtMap.get(s.station_id);
      if (!rt || rt.status === 'Offline') return false;
      if (rt.wl_current != null && rt.wl_alert != null && rt.wl_current >= rt.wl_alert) return true;
      if (rt.rf_since_08 != null && rt.rf_since_08 >= 50) return true;
      return false;
    });
  }

  function render(): void {
    const filtered = activeTab === 'alerts' ? getAlertStations() : getFilteredStations();

    const stationRows = filtered.map((s) => {
      const rt = rtMap.get(s.station_id);
      const status = rt?.status ?? 'Offline';
      const dotColor = status === 'Normal' ? STATUS_COLORS.Normal : STATUS_COLORS.Offline;
      const color = STATION_COLORS[s.station_type] ?? '#6b7280';
      const value = rt?.wl_current ?? rt?.rf_since_08 ?? null;
      const valueStr = value !== null ? `${value}` : '—';
      const time = rt?.datetime ?? '';

      return `
        <div class="mits-station-row" data-id="${s.station_id}" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;cursor:pointer;transition:background .1s;">
          <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;box-shadow:0 0 4px ${dotColor};"></span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:12px;font-weight:600;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.station_name}</span>
              <span style="font-size:12px;font-weight:700;color:#f1f5f9;font-family:monospace;">${valueStr}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:2px;">
              <span style="font-size:10px;color:#64748b;">${s.wilayah}</span>
              <span style="font-size:10px;color:${color};">${s.station_type}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="padding:8px 12px;border-bottom:1px solid #1e293b;">
          <div style="display:flex;gap:4px;margin-bottom:8px;">
            <button data-tab="stations" style="flex:1;text-align:center;padding:6px;border-radius:6px;font-size:11.5px;border:1px solid ${activeTab === 'stations' ? '#22d3ee' : '#334155'};background:${activeTab === 'stations' ? 'rgba(34,211,238,0.1)' : 'transparent'};color:${activeTab === 'stations' ? '#22d3ee' : '#94a3b8'};cursor:pointer;">${t('tab_stations', locale)}</button>
            <button data-tab="alerts" style="flex:1;text-align:center;padding:6px;border-radius:6px;font-size:11.5px;border:1px solid ${activeTab === 'alerts' ? '#f59e0b' : '#334155'};background:${activeTab === 'alerts' ? 'rgba(245,158,11,0.1)' : 'transparent'};color:${activeTab === 'alerts' ? '#f59e0b' : '#94a3b8'};cursor:pointer;">${t('tab_alerts', locale)} <span style="background:#ef4444;color:#fff;border-radius:8px;font-size:9.5px;padding:0 5px;">${getAlertStations().length}</span></button>
          </div>
          ${activeTab === 'stations' ? `
            <input type="text" placeholder="${t('search_placeholder', locale)}" value="${searchTerm}" data-search style="width:100%;background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:12px;outline:none;margin-bottom:6px;" />
            <div style="display:flex;gap:4px;">
              <select data-filter-wilayah style="flex:1;background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:4px;font-size:11px;">
                <option value="">${t('ui_all_regions', locale)}</option>
                ${allWilayah.map((w) => `<option value="${w}" ${filterWilayah === w ? 'selected' : ''}>${w}</option>`).join('')}
              </select>
              <select data-filter-type style="flex:1;background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:4px;font-size:11px;">
                <option value="">All types</option>
                ${allTypes.map((tp) => `<option value="${tp}" ${filterType === tp ? 'selected' : ''}>${tp}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>
        <div style="flex:1;overflow-y:auto;padding:4px 8px;">
          ${stationRows || '<div style="padding:16px;text-align:center;color:#64748b;font-size:12px;">No stations found.</div>'}
        </div>
      </div>
    `;

    container.querySelectorAll('.mits-station-row').forEach((row) => {
      row.addEventListener('mouseenter', () => { (row as HTMLElement).style.background = '#1e293b'; });
      row.addEventListener('mouseleave', () => { (row as HTMLElement).style.background = 'transparent'; });
      row.addEventListener('click', () => {
        const id = (row as HTMLElement).dataset.id;
        const station = stations.find((s) => s.station_id === id);
        if (station) {
          const map = app?.getMap?.();
          map?.flyTo?.({ center: [station.lon, station.lat], zoom: 13 });
        }
      });
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

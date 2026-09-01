import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { t, getLocale } from '../i18n';
import type { MitsStation, MitsRealtime } from '../types';
import { STORAGE_KEYS } from '../constants';

interface LeafletMap {
  remove(): void;
  invalidateSize(): void;
}

interface LeafletMarker {
  remove(): void;
  bindPopup(content: string): LeafletMarker;
  openPopup(): void;
  addTo(map: LeafletMap): LeafletMarker;
}

declare global {
  interface Window {
    L?: {
      map(el: HTMLElement, opts?: Record<string, unknown>): LeafletMap;
      tileLayer(url: string, opts?: Record<string, unknown>): { addTo(map: LeafletMap): unknown };
      marker(latlng: [number, number], opts?: Record<string, unknown>): LeafletMarker;
      circleMarker(latlng: [number, number], opts?: Record<string, unknown>): LeafletMarker;
      control?: { position?: Record<string, string> };
    };
  }
}

function rfColor(mm: number): string {
  if (mm >= 100) return '#7c3aed';
  if (mm >= 50) return '#ef4444';
  if (mm >= 30) return '#f59e0b';
  if (mm >= 10) return '#33c17b';
  if (mm > 0) return '#60a5fa';
  return '#94a3b8';
}

function rfRadius(mm: number): number {
  if (mm >= 100) return 12;
  if (mm >= 50) return 10;
  if (mm >= 30) return 8;
  if (mm >= 10) return 7;
  return 5;
}

export function renderRainfallContourPanel(container: HTMLElement): void {
  const locale = getLocale();
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const realtime = loadEntityStore<MitsRealtime>(STORAGE_KEYS.realtime, SEED_REALTIME);
  const rfStations = stations.filter((s) => s.station_type.includes('RF'));

  let map: LeafletMap | null = null;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">
      <div style="padding:10px 16px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
        <h3 style="margin:0;font-size:14px;font-weight:700;">${t('adv_rainfall_contour', locale)}</h3>
        <div style="display:flex;gap:8px;align-items:center;font-size:11px;">
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;display:inline-block;"></span> 0</span>
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:#60a5fa;display:inline-block;"></span> 1-10</span>
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#33c17b;display:inline-block;"></span> 10-30</span>
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;border-radius:50%;background:#f59e0b;display:inline-block;"></span> 30-50</span>
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;border-radius:50%;background:#ef4444;display:inline-block;"></span> 50-100</span>
          <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:16px;height:16px;border-radius:50%;background:#7c3aed;display:inline-block;"></span> 100+</span>
        </div>
      </div>
      <div id="rf-contour-map" style="flex:1;background:#1e293b;"></div>
    </div>`;

  const mapEl = container.querySelector('#rf-contour-map') as HTMLElement;

  function initMap() {
    if (!window.L) {
      mapEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:13px;">Leaflet library not loaded</div>`;
      return;
    }

    map = window.L.map(mapEl, {
      center: [6.2, 100.5],
      zoom: 10,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      maxZoom: 18,
    }).addTo(map);

    for (const st of rfStations) {
      const rt = realtime.find((r) => String(r.station_id) === String(st.station_id));
      const rf = rt?.rf_since_08 ?? 0;
      const color = rfColor(rf);
      const radius = rfRadius(rf);

      const marker = window.L.circleMarker([st.lat, st.lon], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      }).addTo(map);

      const statusHtml = `
        <div style="font-family:system-ui,sans-serif;font-size:12px;min-width:160px;">
          <div style="font-weight:700;margin-bottom:4px;">${st.station_name}</div>
          <div style="color:#64748b;">ID: ${st.station_id}</div>
          <div style="margin-top:4px;">Rainfall: <b style="color:${color};">${rf} mm</b></div>
          <div>District: ${st.district}</div>
        </div>`;

      marker.bindPopup(statusHtml);
    }

    setTimeout(() => map?.invalidateSize(), 100);
  }

  // Use MutationObserver to detect when the container becomes visible
  const observer = new MutationObserver(() => {
    if (mapEl.offsetHeight > 0 && !map) {
      initMap();
      observer.disconnect();
    }
  });
  observer.observe(container, { attributes: true, childList: true, subtree: true });

  // Also try immediate init
  setTimeout(() => {
    if (mapEl.offsetHeight > 0 && !map) {
      initMap();
      observer.disconnect();
    }
  }, 200);
}

import type { GeoLibreAppAPI } from '../../../types';
import { STORAGE_KEYS } from '../constants';
import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { getLocale, t } from '../i18n';
import type { MitsRealtime, MitsStation } from '../types';
import { openPanel } from './manager';
import { escapeHtml, latestReading, relativeTime, statusColor, statusText } from './station-display';

let activeDisposer: (() => void) | null = null;

function getStationData(stationId: string): {
  station: MitsStation | undefined;
  rt: MitsRealtime | undefined;
} {
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const realtime = loadEntityStore<MitsRealtime>(STORAGE_KEYS.realtime, SEED_REALTIME);
  const station = stations.find((s) => String(s.station_id) === String(stationId));
  const rt = realtime.find((r) => String(r.station_id) === String(stationId));
  return { station, rt };
}

function stationTitle(stationId: string): string {
  const { station } = getStationData(stationId);
  return station?.station_name ?? t('ui_station', getLocale());
}

function buildActions(container: HTMLElement, app: GeoLibreAppAPI, station: MitsStation): void {
  const buttons = container.querySelectorAll('[data-detail-action]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.detailAction;
      if (action === 'center') {
        app.getMap?.()?.flyTo?.({ center: [station.lon, station.lat], zoom: 13 });
      } else if (action === 'data') {
        if (station.station_type.includes('RF')) openPanel('charts-rain');
        else if (station.station_type.includes('WL')) openPanel('charts-wl');
      }
    });
  });
}

function buildEscapeAndOutsideClose(
  container: HTMLElement,
  id: string,
  app: GeoLibreAppAPI,
): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      app.closeFloatingPanel?.(id);
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    const card = container.closest('section');
    if (card && !card.contains(event.target as Node)) {
      app.closeFloatingPanel?.(id);
    }
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerdown', onPointerDown);
  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('pointerdown', onPointerDown);
  };
}

export function renderStationDetailContent(
  container: HTMLElement,
  app: GeoLibreAppAPI,
  stationId: string,
): () => void {
  const locale = getLocale();
  const { station, rt } = getStationData(stationId);
  const id = `mits-station-detail-${stationId}`;

  if (!station) {
    container.innerHTML = `<div style="padding:16px;color:#94a3b8;font-size:13px;">${t('ps_no_match', locale)}</div>`;
    return () => {};
  }

  const reading = latestReading(rt);
  const valueStr = reading ? `${reading.value}` : '—';
  const unit = reading?.unit ?? '';
  const dotColor = statusColor(rt);
  const rel = relativeTime(rt?.datetime, locale);

  const thresholds = rt?.wl_alert != null || rt?.wl_warning != null || rt?.wl_danger != null;
  const now = rt?.wl_current ?? 0;
  const maxThreshold = rt?.wl_danger ?? rt?.wl_warning ?? rt?.wl_alert ?? 1;
  const pct = Math.max(0, Math.min(100, (now / maxThreshold) * 100));

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:14px 16px;color:#e2e8f0;">
      <div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${dotColor};flex-shrink:0;box-shadow:0 0 6px ${dotColor};"></span>
          <span style="font-size:14px;font-weight:700;color:#f1f5f9;">${escapeHtml(station.station_name)}</span>
        </div>
        <div style="font-size:11px;color:#64748b;margin-top:3px;">${escapeHtml(station.station_type)} · ${escapeHtml(station.district)} · ${escapeHtml(station.wilayah)}</div>
      </div>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 12px;display:flex;align-items:baseline;justify-content:space-between;">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">${t('ps_col_value', locale)}</div>
          <div style="font-size:24px;font-weight:800;font-family:ui-monospace,monospace;color:#f1f5f9;">${valueStr}<span style="font-size:12px;color:#94a3b8;margin-left:3px;">${unit}</span></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">${t('ui_status', locale)}</div>
          <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
            <span style="color:${dotColor};font-size:12px;font-weight:700;">${statusText(rt, locale)}</span>
          </div>
          ${rel ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;">${t('ui_last_update', locale)} · ${rel}</div>` : ''}
        </div>
      </div>

      ${thresholds ? `
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px;">${t('sd_thresholds', locale)}</div>
          <div style="position:relative;height:6px;background:#1e293b;border-radius:3px;overflow:hidden;">
            <div style="position:absolute;inset:0;width:${pct}%;background:linear-gradient(90deg,#22d3ee,#f59e0b,#ef4444);"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:4px;">
            <span>${t('status_alert', locale)}${rt?.wl_alert != null ? ` ${rt.wl_alert}m` : ''}</span>
            <span>${t('status_warning', locale)}${rt?.wl_warning != null ? ` ${rt.wl_warning}m` : ''}</span>
            <span>${t('status_danger', locale)}${rt?.wl_danger != null ? ` ${rt.wl_danger}m` : ''}</span>
          </div>
        </div>
      ` : ''}

      <div style="display:flex;gap:8px;">
        <button data-detail-action="center" style="flex:1;background:#0284c7;border:none;color:#fff;border-radius:6px;padding:8px;font-size:12px;font-weight:600;cursor:pointer;">${t('sd_center_map', locale)}</button>
        ${reading ? `<button data-detail-action="data" style="flex:1;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:8px;font-size:12px;font-weight:600;cursor:pointer;">${t('sd_open_data', locale)}</button>` : ''}
      </div>
    </div>
  `;

  buildActions(container, app, station);
  return buildEscapeAndOutsideClose(container, id, app);
}

/**
 * Register and open the floating station detail panel for a station, replacing
 * any previously open station detail. Returns a disposer (call on deactivate).
 */
export function openStationDetail(app: GeoLibreAppAPI, stationId: string): (() => void) | null {
  if (!app?.registerFloatingPanel || !app.openFloatingPanel) return null;
  const id = `mits-station-detail-${stationId}`;
  activeDisposer?.();
  const disposer = app.registerFloatingPanel({
    id,
    title: () => stationTitle(stationId),
    position: 'top-right',
    defaultWidth: 340,
    render: (container) => renderStationDetailContent(container, app, stationId),
  });
  activeDisposer = disposer;
  app.openFloatingPanel(id);
  return disposer;
}

/** Dispose the currently-open station detail panel (plugin deactivate). */
export function disposeStationDetail(): void {
  activeDisposer?.();
  activeDisposer = null;
}
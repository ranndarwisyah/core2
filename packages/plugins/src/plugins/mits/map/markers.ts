import type { MitsRealtime, MitsStation } from '../types';
import { STATION_COLORS, STATUS_COLORS } from '../constants';
import { t } from '../i18n';
import { resolveStationStatus } from '../data/mock';

export function buildPopupHtml(
  feature: GeoJSON.Feature,
  locale: string = 'en',
): string {
  const p = feature.properties as Record<string, unknown>;
  const name = (p.name as string) ?? 'Unknown';
  const type = (p.type as string) ?? '';
  const district = (p.district as string) ?? '';
  const wilayah = (p.wilayah as string) ?? '';
  const rf = p.rf_since_08 as number | null;
  const wl = p.wl_current as number | null;
  const status = (p.status as string) ?? 'Offline';
  const color = (p.color as string) ?? STATION_COLORS[type] ?? '#6b7280';
  const stationId = (p.station_id as string) ?? '';

  const statusColor = status === 'Normal' ? STATUS_COLORS.Normal : STATUS_COLORS.Offline;
  const statusLabel = status === 'Normal'
    ? t('ui_normal', locale)
    : t('ui_close', locale);

  let readingsHtml = '';
  if (rf !== null) {
    readingsHtml += `<div style="margin-top:6px;font-size:12px;color:#94a3b8;">${t('ui_since_8am', locale)}: <b style="color:#e2e8f0;">${rf} mm</b></div>`;
  }
  if (wl !== null) {
    readingsHtml += `<div style="font-size:12px;color:#94a3b8;">WL: <b style="color:#e2e8f0;">${wl} m</b></div>`;
  }

  return `
    <div style="min-width:180px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></span>
        <b style="font-size:13px;color:#f1f5f9;">${name}</b>
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:4px;">${type} · ${district} · ${wilayah}</div>
      <div style="font-size:11px;display:flex;align-items:center;gap:4px;">
        <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};"></span>
        <span style="color:${statusColor};font-weight:600;">${statusLabel}</span>
      </div>
      ${readingsHtml}
      <div style="font-size:10px;color:#475569;margin-top:6px;">ID: ${stationId}</div>
    </div>
  `;
}

export function getStationPopupOptions(): Record<string, unknown> {
  return {
    maxWidth: '300px',
    className: 'mits-popup',
  };
}

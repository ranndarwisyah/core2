import type { MitsRealtime, MitsStation, MitsAlertLevel } from '../types';
import { STATION_COLORS } from '../constants';

export function mockStationReading(station: MitsStation): MitsRealtime {
  const hasRf = station.station_type.includes('RF');
  const hasWl = station.station_type.includes('WL');
  const isOffline = Math.random() < 0.08;

  if (isOffline) {
    return {
      station_id: station.station_id,
      station_name: station.station_name,
      wilayah: station.wilayah,
      datetime: null,
      rf_cum_00: null,
      rf_since_08: null,
      wl_current: null,
      wl_alert: null,
      wl_warning: null,
      wl_danger: null,
      status: 'Offline',
    };
  }

  const now = new Date();
  const dt = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    station_id: station.station_id,
    station_name: station.station_name,
    wilayah: station.wilayah,
    datetime: dt,
    rf_cum_00: hasRf ? Math.round(Math.random() * 1200) : null,
    rf_since_08: hasRf ? Math.round(Math.random() * 50) : null,
    wl_current: hasWl ? Math.round((Math.random() * 10 + 0.5) * 100) / 100 : null,
    wl_alert: hasWl ? station.thresholds.wl_alert ?? null : null,
    wl_warning: hasWl ? station.thresholds.wl_warning ?? null : null,
    wl_danger: hasWl ? station.thresholds.wl_danger ?? null : null,
    status: 'Normal',
  };
}

export function resolveStationStatus(reading: MitsRealtime): MitsAlertLevel {
  if (reading.status === 'Offline') return 'normal';
  if (reading.wl_current != null && reading.wl_danger != null && reading.wl_current >= reading.wl_danger) return 'danger';
  if (reading.wl_current != null && reading.wl_warning != null && reading.wl_current >= reading.wl_warning) return 'warning';
  if (reading.wl_current != null && reading.wl_alert != null && reading.wl_current >= reading.wl_alert) return 'alert';
  if (reading.rf_since_08 != null && reading.rf_since_08 >= 50) return 'alert';
  return 'normal';
}

export function explainAlertReason(
  reading: MitsRealtime,
  locale: string = 'en',
): string {
  const level = resolveStationStatus(reading);
  if (level === 'normal') return locale === 'ms' ? 'Bacaan berada dalam julat operasi normal.' : 'Reading is within the normal operating range.';

  const what = reading.wl_current != null
    ? (locale === 'ms' ? 'paras air' : 'water level')
    : (locale === 'ms' ? 'hujan' : 'rainfall');

  const value = reading.wl_current != null
    ? `${reading.wl_current} m`
    : `${reading.rf_since_08} mm`;

  const templates: Record<string, Record<string, string>> = {
    en: {
      alert: `Early caution: ${what} has risen above the usual range (${value}).`,
      warning: `Elevated risk: ${what} is high enough that nearby areas should stay aware (${value}).`,
      danger: `Critical: ${what} is at a high/critical level (${value}).`,
    },
    ms: {
      alert: `Amaran awal: ${what} telah meningkat melebihi julat biasa (${value}).`,
      warning: `Risiko meningkat: ${what} cukup tinggi supaya kawasan berdekatan perlu berwaspada (${value}).`,
      danger: `Kritikal: ${what} berada pada tahap tinggi/kritikal (${value}).`,
    },
  };

  return templates[locale]?.[level] ?? templates.en[level] ?? '';
}

export function getStationColor(type: string): string {
  return STATION_COLORS[type] ?? '#6b7280';
}

export function isStationOnline(reading: MitsRealtime): boolean {
  return reading.status === 'Normal' && reading.datetime !== null;
}

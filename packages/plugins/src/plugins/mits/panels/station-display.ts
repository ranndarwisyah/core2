import { resolveStationStatus } from '../data/mock';
import { STATUS_COLORS } from '../constants';
import { t } from '../i18n';
import type { MitsAlertLevel, MitsRealtime } from '../types';

export const OFFLINE_COLOR = '#6b7280';

/** Escape dataset strings before interpolating them into innerHTML. */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

/** Green (normal) / amber (alert + warning) / red (danger) status dot colors. */
export const LEVEL_COLORS: Record<MitsAlertLevel, string> = {
  normal: STATUS_COLORS.Normal,
  alert: '#f59e0b',
  warning: '#f59e0b',
  danger: STATUS_COLORS.Danger,
};

/** Map a realtime row to its alert level (Offline rows resolve to normal). */
export function stationLevel(rt: MitsRealtime | undefined): MitsAlertLevel {
  if (!rt) return 'normal';
  return resolveStationStatus(rt);
}

/** Dot color for a station row: red > amber > green, grey when offline. */
export function statusColor(rt: MitsRealtime | undefined): string {
  if (!rt || rt.status === 'Offline') return OFFLINE_COLOR;
  return LEVEL_COLORS[resolveStationStatus(rt)];
}

/** Plain status label (Normal / Alert / Warning / Danger / Offline). */
export function statusText(rt: MitsRealtime | undefined, locale: string): string {
  if (!rt || rt.status === 'Offline') return t('ui_offline', locale);
  const level = resolveStationStatus(rt);
  if (level === 'normal') return t('ui_normal', locale);
  return t(`status_${level}`, locale);
}

/** Whether a row counts as an active alert (Alert / Warning / Danger). */
export function isAlertStation(rt: MitsRealtime | undefined): boolean {
  if (!rt || rt.status === 'Offline') return false;
  return resolveStationStatus(rt) !== 'normal';
}

/** Latest reading for a station with the unit it is measured in. */
export function latestReading(rt: MitsRealtime | undefined): { value: string; unit: string } | null {
  if (!rt) return null;
  if (rt.wl_current != null) return { value: `${rt.wl_current}`, unit: 'm' };
  if (rt.rf_since_08 != null) return { value: `${rt.rf_since_08}`, unit: 'mm' };
  return null;
}

/**
 * Parse MITS datetime strings (`M/D/YY HH:mm`, `M/D/YYYY HH:mm`) into a Date.
 * Two-digit years are shifted toward the current century.
 */
export function parseStationDate(dt: string | null | undefined): Date | null {
  if (!dt) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(
    dt.trim(),
  );
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (match[3].length === 2) {
    const current = new Date().getFullYear();
    const century = Math.floor(current / 100) * 100;
    year = century + year;
    if (year > current + 50) year -= 100;
  }
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = match[6] ? parseInt(match[6], 10) : 0;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2 min ago" style relative time using the user's locale. */
export function relativeTime(dt: string | null | undefined, locale: string): string {
  const date = parseStationDate(dt);
  if (!date) return '';
  const minutes = Math.round((date.getTime() - Date.now()) / 60000);
  const tag = locale === 'ms' ? 'ms' : 'en';
  try {
    const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });
    const abs = Math.abs(minutes);
    if (abs < 1) return rtf.format(0, 'minute');
    if (abs < 60) return rtf.format(-minutes, 'minute');
    if (abs < 60 * 24) return rtf.format(-Math.round(minutes / 60), 'hour');
    if (abs < 60 * 24 * 30) return rtf.format(-Math.round(minutes / (60 * 24)), 'day');
    return rtf.format(-Math.round(minutes / (60 * 24 * 30)), 'month');
  } catch {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(0, 'minute');
  }
}
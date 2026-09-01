import type {
  MitsStation,
  MitsStationType,
  MitsExternalStation,
  MitsWaterwayType,
} from './types';
import { STATION_COLORS } from './constants';

/**
 * Map external function type to internal station type.
 * External: RF, WL, RF/WL, RF/WL/GO, WL/GO
 * Internal: Same values, but also 'RF' and 'GO' as standalone
 */
function mapStationType(func: string): MitsStationType {
  const normalized = func.trim().toUpperCase();
  if (normalized === 'RF') return 'RF';
  if (normalized === 'WL') return 'WL';
  if (normalized === 'RF/WL') return 'RF/WL';
  if (normalized === 'RF/WL/GO') return 'RF/WL/GO';
  if (normalized === 'WL/GO') return 'WL/GO';
  if (normalized === 'GO') return 'GO';
  return 'RF'; // fallback
}

/**
 * Map external status to internal status.
 * External: Online, Offline, Offline Gate, Offline WL
 * Internal: Normal, Offline
 */
function mapStatus(status: string): 'Normal' | 'Offline' {
  return status.toLowerCase().includes('online') ? 'Normal' : 'Offline';
}

/**
 * Convert an external station feature to internal MitsStation format.
 */
export function mapExternalStation(
  feature: { properties: MitsExternalStation; geometry: { coordinates: [number, number] } },
): MitsStation {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;

  return {
    station_id: props.station_no,
    station_name: props.station_name,
    station_type: mapStationType(props.function),
    district: props.daerah,
    state: props.state,
    lon,
    lat,
    thresholds: {},
    wilayah: props.wilayah,
  };
}

/**
 * Convert a list of external station features to internal format.
 */
export function mapExternalStations(
  features: Array<{ properties: MitsExternalStation; geometry: { coordinates: [number, number] } }>,
): MitsStation[] {
  return features.map(mapExternalStation);
}

/**
 * Check if a waterway type should be classified as a river.
 */
export function isRiverWaterway(waterway: MitsWaterwayType): boolean {
  return waterway === 'river' || waterway === 'stream' || waterway === 'flowline';
}

/**
 * Check if a waterway type should be classified as irrigation/conveyance.
 */
export function isIrrigationWaterway(waterway: MitsWaterwayType): boolean {
  return waterway === 'canal' || waterway === 'ditch' || waterway === 'drain' || waterway === 'weir';
}

/**
 * Get the color for a waterway type.
 */
export function getWaterwayColor(waterway: MitsWaterwayType): string {
  if (isRiverWaterway(waterway)) return '#3a7bd5';
  if (isIrrigationWaterway(waterway)) return '#2dd4a8';
  if (waterway === 'dam') return '#6b7280';
  return '#94a3b8';
}

/**
 * Get the station color by type.
 */
export function getStationColor(stationType: MitsStationType): string {
  return STATION_COLORS[stationType] ?? '#6b7280';
}

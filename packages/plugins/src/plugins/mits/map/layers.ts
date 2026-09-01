import type { FeatureCollection } from 'geojson';
import type { MitsStation, MitsRealtime } from '../types';
import { STATION_COLORS } from '../constants';

export function buildStationGeoJSON(
  stations: MitsStation[],
  realtime: MitsRealtime[],
): FeatureCollection {
  const rtMap = new Map<string, MitsRealtime>();
  for (const r of realtime) rtMap.set(r.station_id, r);

  return {
    type: 'FeatureCollection',
    features: stations.map((s) => {
      const rt = rtMap.get(s.station_id);
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lon, s.lat] as [number, number],
        },
        properties: {
          station_id: s.station_id,
          name: s.station_name,
          type: s.station_type,
          district: s.district,
          wilayah: s.wilayah,
          rf_cum_00: rt?.rf_cum_00 ?? null,
          rf_since_08: rt?.rf_since_08 ?? null,
          wl_current: rt?.wl_current ?? null,
          status: rt?.status ?? 'Offline',
          color: STATION_COLORS[s.station_type] ?? '#6b7280',
        },
      };
    }),
  };
}

export function buildRiverGeoJSON(riverData: FeatureCollection): FeatureCollection {
  return riverData;
}

export function buildConveyanceGeoJSON(conveyanceData: FeatureCollection): FeatureCollection {
  return conveyanceData;
}

/**
 * Paint properties for river lines (to match original MITS prototype).
 * Apply via GeoLibre Style panel after adding the GeoJSON layer:
 *   Stroke color: #3a7bd5
 *   Stroke width: 1.5 px (or use data-defined expression for zoom interpolation)
 *   Fill opacity: 0.9
 *
 * Zoom-interpolated width expression (for advanced users):
 *   ["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.7, 15, 2.6]
 */
export const RIVER_STYLE = {
  strokeColor: '#3a7bd5',
  strokeWidth: 1.5,
  fillOpacity: 0.9,
} as const;

/**
 * Paint properties for irrigation / conveyance lines.
 * Apply via GeoLibre Style panel after adding the GeoJSON layer:
 *   Stroke color: #2dd4a8
 *   Stroke width: 1.5 px (or use data-defined expression for zoom interpolation)
 *   Fill opacity: 0.9
 *
 * Zoom-interpolated width expression (for advanced users):
 *   ["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.6, 15, 2.5]
 */
export const IRRIGATION_STYLE = {
  strokeColor: '#2dd4a8',
  strokeWidth: 1.5,
  fillOpacity: 0.9,
} as const;

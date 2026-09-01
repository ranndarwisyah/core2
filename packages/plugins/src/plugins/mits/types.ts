export type MitsUserRole = 'superadmin' | 'user';
export type MitsAlertLevel = 'normal' | 'alert' | 'warning' | 'danger';
export type MitsEntityKind = 'station' | 'dam' | 'regulator' | 'webcam';
export type MitsStationType = 'RF/WL/GO' | 'RF/WL' | 'WL' | 'WL/GO' | 'RF' | 'GO';
export type MitsStreamType = 'HLS' | 'RTSP' | 'MJPEG';
export type MitsWaterwayType = 'canal' | 'river' | 'stream' | 'ditch' | 'drain' | 'weir' | 'dam' | 'flowline';

export interface MitsSession {
  username: string;
  role: MitsUserRole;
  displayName: string;
}

export interface MitsThresholds {
  wl_alert?: number;
  wl_warning?: number;
  wl_danger?: number;
  rf_alert?: number;
  rf_warning?: number;
  rf_danger?: number;
  sr_danger?: number;
}

export interface MitsStation {
  station_id: string;
  station_name: string;
  station_type: MitsStationType;
  district: string;
  state: string;
  lon: number;
  lat: number;
  thresholds: MitsThresholds;
  wilayah: string;
}

export interface MitsRealtime {
  station_id: string;
  station_name: string;
  wilayah: string;
  datetime: string | null;
  rf_cum_00: number | null;
  rf_since_08: number | null;
  wl_current: number | null;
  wl_alert: number | null;
  wl_warning: number | null;
  wl_danger: number | null;
  status: 'Normal' | 'Offline';
}

export interface MitsCrackmeter {
  id: string;
  location: string;
  baseline_mm: number;
}

export interface MitsDam {
  id: string;
  name: string;
  name_ms: string;
  station_id: string;
  station_name: string;
  district: string;
  state: string;
  wilayah: string;
  full_storage_level_ft: number;
  full_storage_level: number;
  live_storage_capacity_acft: number;
  live_storage_capacity: number;
  thresholds: MitsThresholds;
  level_ft: number;
  level_ft_prev: number;
  storage_acft: number;
  storage_acft_prev: number;
  storage_pct: number;
  storage_pct_prev: number;
  release_q: number;
  release_closed: boolean;
  spill_q: number;
  storage_acft_prev_year: number;
  storage_pct_prev_year: number;
  release_q_prev_year: number;
  spill_q_prev_year: number;
  crackmeters: MitsCrackmeter[];
}

export interface MitsGate {
  number: number;
  rtu_id: string;
  height_m: number;
  width_m: number;
  cill_level_m: number;
}

export interface MitsRegulator {
  id: string;
  name: string;
  station_id: string;
  station_name: string;
  district: string;
  num_gates: number;
  thresholds: MitsThresholds;
  gates: MitsGate[];
}

export interface MitsWebcam {
  id: string;
  name: string;
  station_id: string;
  station_name: string;
  stream_type: MitsStreamType;
  stream_url: string;
  district: string;
}

export interface MitsConfig {
  owmKey: string;
  mapCenter: [number, number];
  mapZoom: number;
  units: 'metric' | 'imperial';
}

export interface MitsAnnouncement {
  id: string;
  title: string;
  title_ms: string;
  body: string;
  body_ms: string;
  featured: boolean;
  createdAt: string;
  author: string;
}

export interface MitsFeedback {
  id: string;
  name: string;
  email: string;
  org: string;
  category: string;
  subject: string;
  message: string;
  rating: number;
  createdAt: string;
}

export interface MitsRidRecord {
  region: string;
  season: string;
  phase: string;
  area: number;
  q: number;
  plan: string;
}

export interface MitsLayerDef {
  id: string;
  name: string;
  type: 'geojson' | 'tile';
  visible: boolean;
  opacity: number;
}

export interface MitsPreset {
  name: string;
  layers: Record<string, { visible: boolean; opacity: number }>;
}

export interface MitsStationFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    station_id: string;
    name: string;
    type: MitsStationType;
    district: string;
    wilayah: string;
    rf_cum_00: number | null;
    rf_since_08: number | null;
    wl_current: number | null;
    status: 'Normal' | 'Offline';
    color: string;
  };
}

/** External station properties from mits_stations_official.geojson */
export interface MitsExternalStation {
  station_no: string;
  station_name: string;
  function: string;
  type: string;
  state: string;
  wilayah: string;
  status: string;
  daerah: string;
  parlimen?: string;
  dun?: string;
  remarks?: string;
}

/** External waterway properties from Riverline.geojson */
export interface MitsExternalWaterway {
  '@id'?: string;
  name?: string;
  waterway: MitsWaterwayType;
  'name:en'?: string;
  source?: string;
  wikidata?: string;
  wikipedia?: string;
}

export const MITS_PLUGIN_ID = "mits-telemetry";

export const STATION_COLORS: Record<string, string> = {
  'RF/WL/GO': '#33c17b',
  'RF/WL': '#22d3ee',
  'WL': '#3b82f6',
  'WL/GO': '#f0a63d',
};

export const LAYER_IDS = {
  stations: 'mits-stations',
  rivers: 'mits-rivers',
  canals: 'mits-canals',
  rainfall: 'mits-rainfall',
  temperature: 'mits-temperature',
  wind: 'mits-wind',
} as const;

export const STORAGE_KEYS = {
  stations: 'mits_stations',
  dams: 'mits_dams',
  regulators: 'mits_regulators',
  webcams: 'mits_webcams',
  realtime: 'mits_realtime',
  users: 'mits_users',
  announcements: 'mits_announcements',
  feedback: 'mits_feedback',
  config: 'mits_config',
  session: 'mits_session',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  Normal: '#33c17b',
  Offline: '#6b7280',
  Alert: '#f0a63d',
  Warning: '#f59e0b',
  Danger: '#ef4444',
};

export const DEFAULT_MAP_CENTER: [number, number] = [100.5, 6.2];
export const DEFAULT_MAP_ZOOM = 10;

export const OWM_KEY_DEFAULT = 'f2ee2c53a484274a504622212effe55c';

import type { GeoLibreAppAPI, GeoLibreMapControlPosition, GeoLibrePlugin } from '../../types';
import { MITS_PLUGIN_ID, LAYER_IDS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from './constants';
import { getSession } from './auth';
import { t, getLocale } from './i18n';
import { loadEntityStore } from './data/store';
import { SEED_STATIONS, SEED_REALTIME, SEED_DAMS, SEED_REGULATORS, SEED_WEBCAMS, DSG_MAIN_CONVEYANCE, RC_RIVERLINE_DATA } from './data/seed';
import { buildStationGeoJSON, buildRiverGeoJSON, buildConveyanceGeoJSON } from './map/layers';
import { buildPopupHtml, getStationPopupOptions } from './map/markers';
import { initRadar, startRadar, stopRadar, getRadarFrames, setRadarFrame } from './map/radar';
import { openPanel, closePanel, closeAllPanels, registerPanel, unregisterPanel } from './panels/manager';
import { openPublicSummary, closePublicSummary } from './panels/public-summary';
import { disposeStationDetail } from './panels/station-detail';
import type { MitsStation, MitsRealtime } from './types';
import { STORAGE_KEYS } from './constants';

let appRef: GeoLibreAppAPI | null = null;
let toolbarDisposer: (() => void) | null = null;
let rightPanelDisposer: (() => void) | null = null;
let floatingPanelDisposers: (() => void)[] = [];
let mapControlPosition: GeoLibreMapControlPosition = 'top-right';
let stationLayerId: string | null = null;
let riverLayerId: string | null = null;
let canalLayerId: string | null = null;
let radarLayerId: string | null = null;
let unsubscribeLocale: (() => void) | null = null;

function getLocaleCode(): string {
  return getLocale();
}

function openFloatingPanel(
  app: GeoLibreAppAPI,
  id: string,
  title: string,
  width: number,
  renderFn: (container: HTMLElement) => void | (() => void),
): void {
  const disposer = app.registerFloatingPanel?.({
    id,
    title: () => t(title, getLocaleCode()),
    defaultWidth: width,
    render: renderFn,
  });
  if (disposer) floatingPanelDisposers.push(disposer);
  app.openFloatingPanel?.(id);
}

function registerMapLayers(app: GeoLibreAppAPI): void {
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const realtime = loadEntityStore<MitsRealtime>(STORAGE_KEYS.realtime, SEED_REALTIME);

  const riverGeoJSON = buildRiverGeoJSON(RC_RIVERLINE_DATA);
  riverLayerId = app.addGeoJsonLayer?.(
    t('layer_riverline2', getLocaleCode()),
    riverGeoJSON,
  ) ?? null;

  const canalGeoJSON = buildConveyanceGeoJSON(DSG_MAIN_CONVEYANCE);
  canalLayerId = app.addGeoJsonLayer?.(
    t('layer_riverline', getLocaleCode()),
    canalGeoJSON,
  ) ?? null;

  initRadar().then((frames) => {
    if (frames.length > 0 && app.addTileLayer) {
      radarLayerId = app.addTileLayer(
        t('layer_precipitation', getLocaleCode()),
        frames[0],
        { opacity: 0.5, visible: true, maxzoom: 7 },
      );
    }
  });

  const stationGeoJSON = buildStationGeoJSON(stations, realtime);
  stationLayerId = app.addGeoJsonLayer?.(
    t('layer_stations', getLocaleCode()),
    stationGeoJSON,
  ) ?? null;
}

function removeMapLayers(_app: GeoLibreAppAPI): void {
  // Layers persist in the store; they can be removed manually from the Layers panel.
  stationLayerId = null;
  riverLayerId = null;
  canalLayerId = null;
  radarLayerId = null;
}

function buildToolbarMenu(app: GeoLibreAppAPI) {
  const loc = () => getLocaleCode();
  return {
    id: MITS_PLUGIN_ID,
    label: () => t('nav_home', loc()),
    items: [
      { id: 'home', label: () => t('realtime_head', loc()), onSelect: () => openPanel('station-list') },
      { type: 'separator' as const },
      { id: 'dam', label: () => t('nav_dam', loc()), onSelect: () => openPanel('dam-status') },
      { id: 'rainfall', label: () => t('nav_rainfall', loc()), onSelect: () => openPanel('charts-rain') },
      { id: 'waterlevel', label: () => t('nav_waterlevel', loc()), onSelect: () => openPanel('charts-wl') },
      { id: 'gate', label: () => t('nav_gateopening', loc()), onSelect: () => openPanel('rid') },
      { id: 'webcam', label: () => t('nav_webcam', loc()), onSelect: () => {} },
      { type: 'separator' as const },
      { id: 'public-summary', label: () => t('nav_summary', loc()), onSelect: () => openPanel('public-summary') },
      {
        type: 'submenu' as const,
        id: 'services',
        label: () => t('nav_services', loc()),
        items: [
          { id: 'announce', label: () => t('svc_announcement', loc()), onSelect: () => openPanel('announcements') },
          { id: 'feedback', label: () => t('svc_feedback', loc()), onSelect: () => openPanel('feedback') },
        ],
      },
      {
        type: 'submenu' as const,
        id: 'advance',
        label: () => t('nav_advance', loc()),
        items: [
          { id: 'dsg', label: () => t('dam_storage_graph', loc()), onSelect: () => openPanel('dsg') },
          { id: 'contour', label: () => t('adv_rainfall_contour', loc()), onSelect: () => openPanel('rainfall-contour') },
          { id: 'rid', label: () => t('adv_region_duty', loc()), onSelect: () => openPanel('rid') },
          { id: 'slideshow', label: () => t('adv_slideshow', loc()), onSelect: () => openPanel('quality-system') },
          { id: 'rotate', label: () => t('adv_rotate_view', loc()), onSelect: () => openPanel('rotate-view') },
          { id: 'schematic', label: () => t('map_plan', loc()), onSelect: () => openPanel('schematic') },
          {
            type: 'submenu' as const,
            id: 'configuration',
            label: () => t('adv_config_h', loc()),
            items: [
              { id: 'use-config', label: () => t('adv_user_config', loc()), onSelect: () => openPanel('admin') },
              { id: 'users', label: () => t('adv_users_group', loc()), onSelect: () => openPanel('admin') },
              { id: 'station-config', label: () => t('adv_station_config', loc()), onSelect: () => openPanel('admin') },
              { id: 'map-config', label: () => t('adv_map_config', loc()), onSelect: () => openPanel('admin') },
            ],
          },
        ],
      },
      { type: 'separator' as const },
      { id: 'admin', label: () => t('admin_config_label', loc()), onSelect: () => openPanel('admin') },
    ],
  };
}

export const mitsPlugin: GeoLibrePlugin = {
  id: MITS_PLUGIN_ID,
  name: 'MITS Telemetry',
  version: '1.0.0',
  activeByDefault: true,

  activate: (app: GeoLibreAppAPI) => {
    appRef = app;

    toolbarDisposer = app.registerToolbarMenu?.(buildToolbarMenu(app)) ?? null;

    rightPanelDisposer = app.registerRightPanel?.({
      id: `${MITS_PLUGIN_ID}-stations`,
      title: () => t('realtime_head', getLocaleCode()),
      dock: 'replace-style',
      defaultWidth: 288,
      render: (container) => {
        container.innerHTML = '<div style="padding:16px;color:#94a3b8;font-size:13px;">Loading station list...</div>';
        import('./panels/station-list').then(({ renderStationListPanel }) => {
          renderStationListPanel(container, app);
        });
        return () => {};
      },
    }) ?? null;

    app.openRightPanel?.(`${MITS_PLUGIN_ID}-stations`);
    app.collapseRightPanel?.(`${MITS_PLUGIN_ID}-stations`);

    registerMapLayers(app);

    registerPanel('station-list', () => app.openRightPanel?.(`${MITS_PLUGIN_ID}-stations`), () => app.closeRightPanel?.(`${MITS_PLUGIN_ID}-stations`));

    registerPanel('public-summary', () => openPublicSummary(app), () => closePublicSummary());

    registerPanel('dam-status', () => {
      openFloatingPanel(app, 'mits-dam-status', 'dam_stage_title', 700, (container) => {
        import('./panels/dam-status').then(({ renderDamStatusPanel }) => renderDamStatusPanel(container));
      });
    }, () => closePanel('dam-status'));

    registerPanel('dsg', () => {
      openFloatingPanel(app, 'mits-dsg', 'dam_storage_graph', 1100, (container) => {
        import('./panels/dsg').then(({ renderDsgPanel }) => renderDsgPanel(container, app));
      });
    }, () => closePanel('dsg'));

    registerPanel('rainfall-contour', () => {
      openFloatingPanel(app, 'mits-rainfall-contour', 'adv_rainfall_contour', 900, (container) => {
        import('./panels/rainfall-contour').then(({ renderRainfallContourPanel }) => renderRainfallContourPanel(container));
      });
    }, () => closePanel('rainfall-contour'));

    registerPanel('rid', () => {
      openFloatingPanel(app, 'mits-rid', 'adv_region_duty', 800, (container) => {
        import('./panels/rid').then(({ renderRidPanel }) => renderRidPanel(container));
      });
    }, () => closePanel('rid'));

    registerPanel('quality-system', () => {
      openFloatingPanel(app, 'mits-quality-system', 'about_quality', 800, (container) => {
        import('./panels/quality-system').then(({ renderQualitySystemPanel }) => renderQualitySystemPanel(container));
      });
    }, () => closePanel('quality-system'));

    registerPanel('announcements', () => {
      openFloatingPanel(app, 'mits-announcements', 'svc_announcement', 600, (container) => {
        import('./panels/announcements').then(({ renderAnnouncementsPanel }) => renderAnnouncementsPanel(container));
      });
    }, () => closePanel('announcements'));

    registerPanel('feedback', () => {
      openFloatingPanel(app, 'mits-feedback', 'svc_feedback', 500, (container) => {
        import('./panels/feedback').then(({ renderFeedbackPanel }) => renderFeedbackPanel(container));
      });
    }, () => closePanel('feedback'));

    registerPanel('rotate-view', () => {
      openFloatingPanel(app, 'mits-rotate-view', 'adv_rotate_view', 600, (container) => {
        import('./panels/rotate-view').then(({ renderRotateViewPanel }) => renderRotateViewPanel(container));
      });
    }, () => closePanel('rotate-view'));

    registerPanel('schematic', () => {
      openFloatingPanel(app, 'mits-schematic', 'map_plan', 1000, (container) => {
        import('./panels/schematic').then(({ renderSchematicPanel }) => renderSchematicPanel(container));
      });
    }, () => closePanel('schematic'));

    registerPanel('admin', () => {
      openFloatingPanel(app, 'mits-admin', 'admin_config_label', 900, (container) => {
        import('./admin/panel').then(({ renderAdminPanel }) => renderAdminPanel(container, app));
      });
    }, () => closePanel('admin'));

    registerPanel('charts-rain', () => {
      openFloatingPanel(app, 'mits-charts-rain', 'rain_monthly', 900, (container) => {
        import('./panels/charts').then(({ renderRainChartPanel }) => renderRainChartPanel(container));
      });
    }, () => closePanel('charts-rain'));

    registerPanel('charts-wl', () => {
      openFloatingPanel(app, 'mits-charts-wl', 'wl_graph', 900, (container) => {
        import('./panels/charts').then(({ renderWlChartPanel }) => renderWlChartPanel(container));
      });
    }, () => closePanel('charts-wl'));

    unsubscribeLocale = app.onLocaleChange?.(() => {
      toolbarDisposer?.();
      toolbarDisposer = app.registerToolbarMenu?.(buildToolbarMenu(app)) ?? null;
    }) ?? null;
  },

  deactivate: (app: GeoLibreAppAPI) => {
    stopRadar();
    toolbarDisposer?.();
    toolbarDisposer = null;
    rightPanelDisposer?.();
    rightPanelDisposer = null;
    floatingPanelDisposers.forEach((d) => d());
    floatingPanelDisposers = [];
    disposeStationDetail();
    unsubscribeLocale?.();
    unsubscribeLocale = null;
    removeMapLayers(app);
    closeAllPanels();
    appRef = null;
  },

  getMapControlPosition: () => mapControlPosition,
  setMapControlPosition: (_app, position) => {
    mapControlPosition = position;
  },

  getProjectState: () => ({
    radarPlaying: false,
  }),

  applyProjectState: (_app, state) => {
    if (typeof state === 'object' && state !== null) {
      const s = state as Record<string, unknown>;
      if (s.radarPlaying === true) {
        startRadar(() => {});
      }
    }
  },
};

export { MITS_PLUGIN_ID };

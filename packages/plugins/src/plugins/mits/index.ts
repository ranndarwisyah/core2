import type { GeoLibreAppAPI, GeoLibreMapControlPosition, GeoLibrePlugin } from '../../types';
import type * as maplibregl from 'maplibre-gl';
import { MITS_PLUGIN_ID, LAYER_IDS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from './constants';
import { getSession } from './auth';
import { t, getLocale } from './i18n';
import { loadEntityStore } from './data/store';
import { SEED_STATIONS, SEED_REALTIME, SEED_DAMS, SEED_REGULATORS, SEED_WEBCAMS, DSG_MAIN_CONVEYANCE, RC_RIVERLINE_DATA } from './data/seed';
import { buildStationGeoJSON, buildRiverGeoJSON, buildConveyanceGeoJSON } from './map/layers';
import { buildPopupHtml, getStationPopupOptions } from './map/markers';
import { initRadar, startRadar, stopRadar, getRadarFrames, setRadarFrame } from './map/radar';
import { openPanel, closePanel, closeAllPanels, registerPanel, unregisterPanel } from './panels/manager';
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
let bottomTabBarControl: BottomTabControl | null = null;

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
        ],
      },
      { type: 'separator' as const },
      { id: 'admin', label: () => t('admin_config_label', loc()), onSelect: () => openPanel('admin') },
    ],
  };
}

class BottomTabControl {
  private _container: HTMLDivElement | null = null;
  private _host: HTMLDivElement | null = null;
  private _barEl: HTMLDivElement | null = null;
  private _tabButtons: HTMLButtonElement[] = [];
  private _tabIds: string[] = [];
  private _submenuEl: HTMLDivElement | null = null;
  private _activeTabId: string | null = null;
  private _submenuForTabId: string | null = null;
  private _outsideClickListener: (() => void) | null = null;
  private _cleanup: (() => void) | null = null;

  onAdd(map: maplibregl.Map) {
    const mapContainer = map.getContainer();
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl mits-bottom-tab-host';
    this._container.style.cssText = 'position:absolute;bottom:0;left:0;right:0;z-index:10;pointer-events:none;';

    const bar = document.createElement('div');
    bar.style.cssText = `
      display:flex;align-items:center;gap:0;width:100%;height:44px;
      background:#0f172a;border-top:1px solid #1e293b;overflow-x:auto;
      scrollbar-width:thin;scrollbar-color:#334155 transparent;
      font-family:system-ui,-apple-system,sans-serif;pointer-events:auto;
    `;
    this._barEl = bar;

    const loc = () => getLocaleCode();
    const tabs = [
      { id: 'home', label: t('nav_home', loc()), onClick: () => openPanel('station-list') },
      { id: 'about', label: t('nav_about', loc()) || 'About Us', submenu: [
        { id: 'overview', label: t('about_overview', loc()) || 'SHT MADA Overview', onClick: () => openPanel('quality-system') },
        { id: 'quality', label: t('about_quality', loc()) || 'MADA Quality System', onClick: () => openPanel('quality-system') },
        { id: 'plan', label: t('about_plan', loc()) || 'Pelan Kawasan Muda', onClick: () => openPanel('schematic') },
      ]},
      { id: 'map', label: t('nav_map', loc()) || 'Map', submenu: [
        { id: 'station-map', label: t('map_station', loc()) || 'Station Location Map', onClick: () => openPanel('station-list') },
      ]},
      { id: 'dam', label: t('nav_dam', loc()), submenu: [
        { id: 'dam-data', label: t('dam_data', loc()) || 'Dam Data', onClick: () => openPanel('dam-status') },
        { id: 'dam-storage', label: t('dam_storage_graph', loc()), onClick: () => openPanel('dsg') },
      ]},
      { id: 'rainfall', label: t('nav_rainfall', loc()), submenu: [
        { id: 'rf-monthly', label: t('rain_monthly', loc()), onClick: () => openPanel('charts-rain') },
        { id: 'rf-daily', label: t('rain_daily', loc()), onClick: () => openPanel('charts-rain') },
        { id: 'rf-contour', label: t('adv_rainfall_contour', loc()), onClick: () => openPanel('rainfall-contour') },
      ]},
      { id: 'waterlevel', label: t('nav_waterlevel', loc()), submenu: [
        { id: 'wl-catchment', label: t('wl_catchment', loc()) || 'Catchment River Data', onClick: () => openPanel('charts-wl') },
        { id: 'wl-multi', label: t('wl_multiple', loc()), onClick: () => openPanel('charts-wl') },
        { id: 'wl-graph', label: t('wl_graph', loc()), onClick: () => openPanel('charts-wl') },
      ]},
      { id: 'gate', label: t('nav_gateopening', loc()), submenu: [
        { id: 'gate-map', label: t('gate_map', loc()) || 'Regulator Map', onClick: () => openPanel('rid') },
        { id: 'gate-data', label: t('gate_data', loc()) || 'Regulator Data', onClick: () => openPanel('rid') },
      ]},
      { id: 'webcam', label: t('nav_webcam', loc()), onClick: () => {} },
      { id: 'services', label: t('nav_services', loc()), submenu: [
        { id: 'svc-announce', label: t('svc_announcement', loc()), onClick: () => openPanel('announcements') },
        { id: 'svc-feedback', label: t('svc_feedback', loc()), onClick: () => openPanel('feedback') },
      ]},
      { id: 'advance', label: t('nav_advance', loc()), submenu: [
        { id: 'adv-rid', label: t('adv_region_duty', loc()), onClick: () => openPanel('rid') },
        { id: 'adv-contour', label: t('adv_rainfall_contour', loc()), onClick: () => openPanel('rainfall-contour') },
        { id: 'adv-slideshow', label: t('adv_slideshow', loc()), onClick: () => openPanel('quality-system') },
        { id: 'adv-rotate', label: t('adv_rotate_view', loc()), onClick: () => openPanel('rotate-view') },
        { id: 'adv-schematic', label: t('map_plan', loc()), onClick: () => openPanel('schematic') },
        { id: 'adv-config', label: t('admin_config_label', loc()), onClick: () => openPanel('admin') },
      ]},
    ];

    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.textContent = tab.label;
      btn.style.cssText = `
        flex:none;padding:0 14px;height:100%;
        background:none;border:none;color:#94a3b8;font-size:12px;font-weight:500;
        cursor:pointer;white-space:nowrap;transition:all .15s;
        border-bottom:2px solid transparent;position:relative;
      `;
      btn.addEventListener('mouseenter', () => {
        if (this._activeTabId !== tab.id) btn.style.color = '#e2e8f0';
      });
      btn.addEventListener('mouseleave', () => {
        if (this._activeTabId !== tab.id) btn.style.color = '#94a3b8';
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._activeTabId === tab.id && !tab.submenu) {
          this._activeTabId = null;
          this._updateStyles(tabs);
          this._closeSubmenu();
          return;
        }
        if (tab.submenu && tab.submenu.length > 0) {
          this._toggleSubmenu(tab.id, tab.submenu, btn);
          return;
        }
        this._closeSubmenu();
        this._activeTabId = tab.id;
        this._updateStyles(tabs);
        tab.onClick?.();
      });
      bar.appendChild(btn);
      this._tabButtons.push(btn);
      this._tabIds.push(tab.id);
    }

    this._container.appendChild(bar);
    // Append the full-width bar directly to the map container, not to a
    // maplibre control corner: the corner containers are sized/inset for small
    // widgets (bottom-left has margin + max-width), so a full-width bar must
    // live on the map root. We still return a small inert host to maplibre so
    // addControl/removeControl bookkeeping (and onRemove) behave normally.
    const host = document.createElement('div');
    this._host = host;
    mapContainer.appendChild(this._container);

    this._cleanup = () => {
      this._closeSubmenu();
      this._barEl = null;
      this._container = null;
      this._tabButtons = [];
      this._tabIds = [];
    };

    return host;
  }

  onRemove() {
    this._cleanup?.();
    this._cleanup = null;
    this._host?.remove();
    this._host = null;
    this._barEl = null;
    this._submenuEl = null;
    this._submenuForTabId = null;
    this._container?.remove();
    this._container = null;
    this._tabButtons = [];
    this._tabIds = [];
  }

  private _closeSubmenu() {
    if (this._submenuEl) { this._submenuEl.remove(); this._submenuEl = null; }
    this._submenuForTabId = null;
    if (this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener, true);
      this._outsideClickListener = null;
    }
  }

  private _toggleSubmenu(
    tabId: string,
    items: { id: string; label: string; onClick?: () => void }[],
    anchor: HTMLElement,
  ) {
    // Toggle: clicking the same parent tab again closes its submenu.
    if (this._submenuForTabId === tabId) {
      this._activeTabId = null;
      this._updateStylesForSubmenu();
      this._closeSubmenu();
      return;
    }
    this._closeSubmenu();
    if (!this._container || !this._barEl) return;
    this._submenuEl = document.createElement('div');
    // Anchor under the clicked tab: button.offsetLeft is relative to the host
    // (the bar is static, so the positioned host is the offsetParent), minus
    // the bar's horizontal scroll. Appended to the host — not the button or
    // the bar — so the bar's overflow-x:auto cannot clip the upward menu and
    // the menu is not squeezed to the tab's width.
    const left = Math.max(0, anchor.offsetLeft - this._barEl.scrollLeft);
    this._submenuEl.style.cssText = `
      position:absolute;bottom:100%;left:${left}px;min-width:220px;max-width:320px;
      background:#1e293b;border:1px solid #334155;border-radius:8px 8px 0 0;
      padding:8px 0;max-height:40vh;overflow-y:auto;z-index:1000;pointer-events:auto;
      box-shadow:0 -4px 12px rgba(0,0,0,0.4);
    `;
    for (const item of items) {
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.style.cssText = `
        display:block;width:100%;text-align:left;padding:8px 16px;white-space:nowrap;
        background:none;border:none;color:#e2e8f0;font-size:13px;cursor:pointer;
      `;
      btn.addEventListener('mouseenter', () => { btn.style.background = '#334155'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'none'; });
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this._closeSubmenu();
        this._activeTabId = null;
        item.onClick?.();
      });
      this._submenuEl.appendChild(btn);
    }
    this._container.appendChild(this._submenuEl);
    this._submenuForTabId = tabId;
    this._activeTabId = tabId;
    this._updateStylesForSubmenu();
    // Close on outside click (capture phase; tab clicks stopPropagation).
    this._outsideClickListener = () => {
      this._activeTabId = null;
      this._updateStylesForSubmenu();
      this._closeSubmenu();
    };
    document.addEventListener('click', this._outsideClickListener, true);
  }

  private _updateStylesForSubmenu() {
    this._tabButtons.forEach((btn, i) => {
      const isActive = this._activeTabId === this._tabIds[i];
      btn.style.color = isActive ? '#22d3ee' : '#94a3b8';
      btn.style.borderBottomColor = isActive ? '#22d3ee' : 'transparent';
      btn.style.fontWeight = isActive ? '700' : '500';
    });
  }

  private _updateStyles(tabs: { id: string }[]) {
    if (!this._barEl) return;
    const btns = this._barEl.querySelectorAll('button');
    btns.forEach((btn, i) => {
      const isActive = this._activeTabId === tabs[i].id;
      btn.style.color = isActive ? '#22d3ee' : '#94a3b8';
      btn.style.borderBottomColor = isActive ? '#22d3ee' : 'transparent';
      btn.style.fontWeight = isActive ? '700' : '500';
    });
  }
}

export const mitsPlugin: GeoLibrePlugin = {
  id: MITS_PLUGIN_ID,
  name: 'MITS Telemetry',
  version: '1.0.0',
  activeByDefault: true,

  activate: (app: GeoLibreAppAPI) => {
    appRef = app;

    toolbarDisposer = app.registerToolbarMenu?.(buildToolbarMenu(app)) ?? null;

    if (!bottomTabBarControl) {
      bottomTabBarControl = new BottomTabControl();
      app.addMapControl(bottomTabBarControl as any, 'bottom-left');
    }

    rightPanelDisposer = app.registerRightPanel?.({
      id: `${MITS_PLUGIN_ID}-stations`,
      title: () => t('realtime_head', getLocaleCode()),
      dock: 'replace-style',
      defaultWidth: 320,
      render: (container) => {
        container.innerHTML = '<div style="padding:16px;color:#94a3b8;font-size:13px;">Loading station list...</div>';
        import('./panels/station-list').then(({ renderStationListPanel }) => {
          renderStationListPanel(container, app);
        });
        return () => {};
      },
    }) ?? null;

    registerMapLayers(app);

    registerPanel('station-list', () => app.openRightPanel?.(`${MITS_PLUGIN_ID}-stations`), () => app.closeRightPanel?.(`${MITS_PLUGIN_ID}-stations`));

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
    unsubscribeLocale?.();
    unsubscribeLocale = null;
    if (bottomTabBarControl) {
      app.removeMapControl(bottomTabBarControl as any);
      bottomTabBarControl = null;
    }
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

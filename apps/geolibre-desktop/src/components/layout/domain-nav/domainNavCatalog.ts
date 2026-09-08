/**
 * Domain navigation catalog for the water-resources application shell.
 *
 * Implements panels.md §2 (top-level order) with the submenu hierarchy from
 * navbar.md. Module-scope constants must not call `t()` (no hook in scope),
 * so every human-readable string is a stable i18n catalog key resolved with
 * `t(item.labelKey)` at the render site (see docs/i18n.md).
 */

import type { ParseKeys } from "i18next";

export type DomainNavId =
  | "home"
  | "about"
  | "map"
  | "dam"
  | "rainfall"
  | "waterlevel"
  | "gate"
  | "webcam"
  | "services"
  | "advance";

export type DomainNavLabelKey = ParseKeys;

export interface DomainNavSubItem {
  /** Stable id, unique within its top-level entry. */
  id: string;
  /** i18n key resolved at the render site, e.g. `domainNav.dam.data`. */
  labelKey: DomainNavLabelKey;
  /** Data-heavy items open the full overlay page panel (§4). */
  opensPagePanel?: boolean;
  /** Advance groups carry nested options rendered as a dropdown (§3.2). */
  children?: DomainNavSubItem[];
}

export interface DomainNavEntry {
  id: DomainNavId;
  labelKey: DomainNavLabelKey;
  items: DomainNavSubItem[];
}

/** panels.md §2 order — the sole primary top bar. */
export const DOMAIN_NAV_ORDER: DomainNavId[] = [
  "home",
  "about",
  "map",
  "dam",
  "rainfall",
  "waterlevel",
  "gate",
  "webcam",
  "services",
  "advance",
];

function item(id: string, labelKey: DomainNavLabelKey, opensPagePanel = false): DomainNavSubItem {
  return opensPagePanel ? { id, labelKey, opensPagePanel } : { id, labelKey };
}

export const DOMAIN_NAV_CATALOG: DomainNavEntry[] = [
  {
    id: "home",
    labelKey: "domainNav.home.label",
    items: [item("overview", "domainNav.home.overview", true)],
  },
  {
    id: "about",
    labelKey: "domainNav.about.label",
    items: [
      item("overview", "domainNav.about.overview"),
      item("message", "domainNav.about.message"),
      item("quality", "domainNav.about.quality"),
      item("contact", "domainNav.about.contact"),
      item("plan", "domainNav.about.plan"),
    ],
  },
  {
    id: "map",
    labelKey: "domainNav.map.label",
    items: [
      // Map views. The original GeoLibre top-bar functions (Project / Edit /
      // View / Add Data / …) render in the same toolbar row via the Map
      // secondary panel's embedded TopToolbar (panels.md §3.2).
      item("stations", "domainNav.map.stations", true),
      item("mudaAreaPlan", "domainNav.map.mudaAreaPlan", true),
      item("qualitySystem", "domainNav.map.qualitySystem", true),
      item("contactUs", "domainNav.map.contactUs", true),
    ],
  },
  {
    id: "dam",
    labelKey: "domainNav.dam.label",
    items: [
      item("data", "domainNav.dam.data", true),
      item("storageGraph", "domainNav.dam.storageGraph", true),
      item("inflowOutflow", "domainNav.dam.inflowOutflow", true),
    ],
  },
  {
    id: "rainfall",
    labelKey: "domainNav.rainfall.label",
    items: [
      item("monthly", "domainNav.rainfall.monthly", true),
      item("daily", "domainNav.rainfall.daily", true),
      item("inflowOutflow", "domainNav.rainfall.inflowOutflow", true),
      item("dam", "domainNav.rainfall.dam", true),
      item("river", "domainNav.rainfall.river", true),
      item("mudaArea", "domainNav.rainfall.mudaArea", true),
      item("sevenDays", "domainNav.rainfall.sevenDays", true),
      item("hourly", "domainNav.rainfall.hourly", true),
    ],
  },
  {
    id: "waterlevel",
    labelKey: "domainNav.waterlevel.label",
    items: [
      item("catchment", "domainNav.waterlevel.catchment", true),
      item("multiple", "domainNav.waterlevel.multiple", true),
      item("graph", "domainNav.waterlevel.graph", true),
      item("data", "domainNav.waterlevel.data", true),
    ],
  },
  {
    id: "gate",
    labelKey: "domainNav.gate.label",
    items: [
      item("map", "domainNav.gate.map"),
      item("data", "domainNav.gate.data", true),
      item("level", "domainNav.gate.level", true),
      item("distribution", "domainNav.gate.distribution", true),
    ],
  },
  {
    id: "webcam",
    labelKey: "domainNav.webcam.label",
    items: [
      item("sht", "domainNav.webcam.sht", true),
      item("ampangJajar", "domainNav.webcam.ampangJajar", true),
      item("spai", "domainNav.webcam.spai", true),
    ],
  },
  {
    id: "services",
    labelKey: "domainNav.services.label",
    items: [
      item("announcement", "domainNav.services.announcement", true),
      item("feedback", "domainNav.services.feedback", true),
    ],
  },
  {
    id: "advance",
    labelKey: "domainNav.advance.label",
    items: [
      {
        id: "data",
        labelKey: "domainNav.advance.data",
        children: [
          item("dataEntry", "domainNav.advance.dataEntry", true),
          item("damData", "domainNav.advance.damData", true),
          item("tableBpah", "domainNav.advance.tableBpah", true),
          item("dutyOverall", "domainNav.advance.dutyOverall", true),
          item("dutyRegion", "domainNav.advance.dutyRegion", true),
          item("discharge", "domainNav.advance.discharge", true),
          item("dataTable", "domainNav.advance.dataTable", true),
          item("realtime", "domainNav.advance.realtime", true),
          item("query", "domainNav.advance.query", true),
        ],
      },
      {
        id: "report",
        labelKey: "domainNav.advance.report",
        children: [
          item("dailyOps", "domainNav.advance.dailyOps", true),
          item("drought", "domainNav.advance.drought", true),
          item("floodOps", "domainNav.advance.floodOps", true),
          item("dailyReport", "domainNav.advance.dailyReport", true),
        ],
      },
      {
        id: "info",
        labelKey: "domainNav.advance.info",
        children: [
          item("record", "domainNav.advance.record", true),
          item("slideshow", "domainNav.advance.slideshow"),
          item("rotate", "domainNav.advance.rotate"),
        ],
      },
      {
        id: "analysis",
        labelKey: "domainNav.advance.analysis",
        children: [
          item("contour", "domainNav.advance.contour", true),
          item("rainblock", "domainNav.advance.rainblock", true),
          item("simulation", "domainNav.advance.simulation", true),
          item("distribution", "domainNav.advance.distribution", true),
          item("opsMap", "domainNav.advance.opsMap"),
          item("floodMap", "domainNav.advance.floodMap", true),
        ],
      },
      {
        id: "config",
        labelKey: "domainNav.advance.config",
        children: [
          item("useConfig", "domainNav.advance.useConfig", true),
          item("users", "domainNav.advance.users", true),
          item("stations", "domainNav.advance.stations", true),
          item("mapConfig", "domainNav.advance.mapConfig", true),
        ],
      },
    ],
  },
];

const CATALOG_BY_ID = new Map<DomainNavId, DomainNavEntry>(
  DOMAIN_NAV_CATALOG.map((entry) => [entry.id, entry]),
);

export function getDomainNavEntry(id: DomainNavId): DomainNavEntry {
  const entry = CATALOG_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown domain nav id: ${id}`);
  return entry;
}

/** Finds a sub-item (or nested Advance child) by id for page-panel titles. */
export function findDomainNavSubItem(
  navId: DomainNavId,
  itemId: string,
): DomainNavSubItem | null {
  const entry = CATALOG_BY_ID.get(navId);
  if (!entry) return null;
  for (const child of entry.items) {
    if (child.id === itemId) return child;
    if (child.children) {
      const nested = child.children.find((c) => c.id === itemId);
      if (nested) return nested;
    }
  }
  return null;
}

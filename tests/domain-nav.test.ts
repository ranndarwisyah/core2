import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DOMAIN_NAV_CATALOG,
  DOMAIN_NAV_ORDER,
  findDomainNavSubItem,
  getDomainNavEntry,
} from "../apps/geolibre-desktop/src/components/layout/domain-nav/domainNavCatalog";
import { nextSecondaryId } from "../apps/geolibre-desktop/src/components/layout/domain-nav/useDomainNav";

describe("domain nav catalog (panels.md §2)", () => {
  it("exposes the ten top-level items in order", () => {
    assert.deepEqual(DOMAIN_NAV_ORDER, [
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
    ]);
    assert.equal(DOMAIN_NAV_CATALOG.length, 10);
    assert.deepEqual(
      DOMAIN_NAV_CATALOG.map((entry) => entry.id),
      DOMAIN_NAV_ORDER,
    );
  });

  it("keeps the navbar.md submenu hierarchy", () => {
    assert.equal(getDomainNavEntry("dam").items.length, 3);
    assert.equal(getDomainNavEntry("rainfall").items.length, 8);
    assert.equal(getDomainNavEntry("waterlevel").items.length, 4);
    assert.equal(getDomainNavEntry("about").items.length, 5);
    // Advance groups nest via inline dropdowns, not nested panels.
    const advance = getDomainNavEntry("advance");
    assert.equal(advance.items.length, 5);
    for (const group of advance.items) {
      assert.ok(group.children && group.children.length > 0);
    }
  });

  it("lists Advance first level as Data/Report/Info/Analysis/Configuration groups", () => {
    const advance = getDomainNavEntry("advance");
    assert.deepEqual(
      advance.items.map((item) => item.id),
      ["data", "report", "info", "analysis", "config"],
    );
    // Every first-level entry is a group (rendered as a plain row with an
    // inline nested dropdown), never a leaf.
    for (const group of advance.items) {
      assert.equal(group.opensPagePanel, undefined);
    }
  });

  it("resolves page-panel items including nested Advance children", () => {
    assert.equal(findDomainNavSubItem("dam", "data")?.opensPagePanel, true);
    assert.equal(findDomainNavSubItem("advance", "contour")?.opensPagePanel, true);
    assert.equal(findDomainNavSubItem("map", "stations")?.opensPagePanel, undefined);
    assert.equal(findDomainNavSubItem("dam", "missing"), null);
  });
});

describe("secondary panel toggle (panels.md §3)", () => {
  it("opens a closed panel", () => {
    assert.equal(nextSecondaryId(null, "dam"), "dam");
  });

  it("toggles the active item closed", () => {
    assert.equal(nextSecondaryId("dam", "dam"), null);
  });

  it("switching items closes the previous panel (single-open)", () => {
    assert.equal(nextSecondaryId("dam", "rainfall"), "rainfall");
  });
});

import { useCallback, useState } from "react";
import type { DomainNavId } from "./domainNavCatalog";

/**
 * Secondary + page-panel state for panels.md §3–§4.
 *
 * Rules: only one secondary panel open at a time; clicking the active
 * top-level item toggles it closed; switching items closes the previous one.
 * Closing the page panel returns to the map with the secondary state kept
 * (panels.md §4: "restored or cleared" — keeping it is the least surprising).
 */
export interface DomainPageRef {
  navId: DomainNavId;
  itemId: string;
}

export interface DomainNavState {
  /** Currently open secondary panel, or null when only the map shows. */
  activeId: DomainNavId | null;
  /** Open full-overlay page panel, or null. */
  page: DomainPageRef | null;
}

export const INITIAL_DOMAIN_NAV_STATE: DomainNavState = {
  activeId: null,
  page: null,
};

/** Pure toggle used by the hook and unit-tested directly. */
export function nextSecondaryId(
  current: DomainNavId | null,
  clicked: DomainNavId,
): DomainNavId | null {
  return current === clicked ? null : clicked;
}

export interface DomainNavApi extends DomainNavState {
  toggleSecondary: (id: DomainNavId) => void;
  closeSecondary: () => void;
  openPage: (ref: DomainPageRef) => void;
  closePage: () => void;
}

export function useDomainNav(initial: DomainNavState = INITIAL_DOMAIN_NAV_STATE): DomainNavApi {
  const [activeId, setActiveId] = useState<DomainNavId | null>(initial.activeId);
  const [page, setPage] = useState<DomainPageRef | null>(initial.page);

  const toggleSecondary = useCallback((id: DomainNavId) => {
    setActiveId((current) => nextSecondaryId(current, id));
  }, []);

  const closeSecondary = useCallback(() => {
    setActiveId(null);
  }, []);

  const openPage = useCallback((ref: DomainPageRef) => {
    setPage(ref);
  }, []);

  const closePage = useCallback(() => {
    setPage(null);
  }, []);

  return { activeId, page, toggleSecondary, closeSecondary, openPage, closePage };
}

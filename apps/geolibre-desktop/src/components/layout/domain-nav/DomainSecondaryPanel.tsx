import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { getDomainNavEntry, type DomainNavId } from "./domainNavCatalog";
import { DomainToolbar } from "./DomainToolbar";
import type { DomainPageRef } from "./useDomainNav";

interface DomainSecondaryPanelProps {
  activeId: DomainNavId;
  onClose: () => void;
  onOpenPage: (ref: DomainPageRef) => void;
  /**
   * Map tools slot: the relocated GeoLibre top bar with the domain items +
   * close control embedded on the same row (§3.2). When present, the panel
   * renders only this (no extra row); other panels render their toolbar row.
   */
  mapTools?: ReactNode;
}

/**
 * Secondary panel directly under the top bar (panels.md §3). Same card/border
 * visual language — not a left/right side panel. Collapsible via the close
 * control or by clicking the active top-level item again (handled by the
 * parent toggle); auto-closed when another item is selected.
 *
 * Every panel renders its sub-items as a horizontal toolbar (icon + label
 * buttons), matching the Map secondary panel's style — never a vertical list.
 * Advance groups expand as dropdowns inside the same panel. There is no title
 * bar: the panel starts directly with the toolbar row, and the close control
 * sits on that same row, aligned to the panel's right edge.
 */
export function DomainSecondaryPanel({
  activeId,
  onClose,
  onOpenPage,
  mapTools,
}: DomainSecondaryPanelProps) {
  const { t } = useTranslation();
  const entry = getDomainNavEntry(activeId);

  return (
    <section
      data-testid={`domain-secondary-${activeId}`}
      aria-label={t(entry.labelKey)}
      className="max-h-[46vh] min-w-0 shrink-0 overflow-y-auto border-b bg-card"
    >
      {mapTools ? (
        <div data-testid="domain-map-tools">{mapTools}</div>
      ) : (
        <div className="flex items-center gap-1 px-2 py-1.5">
          <DomainToolbar activeId={activeId} onOpenPage={onOpenPage} />
          <button
            type="button"
            data-testid="domain-secondary-close"
            onClick={onClose}
            aria-label={t("domainNav.closeSecondary")}
            className="ms-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
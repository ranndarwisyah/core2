import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@geolibre/ui";
import { getDomainNavEntry, type DomainNavId } from "./domainNavCatalog";
import type { DomainPageRef } from "./useDomainNav";

interface DomainSecondaryPanelProps {
  activeId: DomainNavId;
  onClose: () => void;
  onOpenPage: (ref: DomainPageRef) => void;
  /** Map tools slot: the relocated GeoLibre top bar (§3.2). */
  mapTools?: ReactNode;
}

/** Shared row style: first-level groups and leaf items look identical. */
const ROW_BUTTON_CLASS =
  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-accent";

/**
 * Secondary panel directly under the top bar (panels.md §3). Same card/border
 * visual language — not a left/right side panel. Collapsible via the close
 * control or by clicking the active top-level item again (handled by the
 * parent toggle); auto-closed when another item is selected.
 *
 * Every first-level sub-item renders as a plain row (no first-level
 * dropdowns). Items with nested options (e.g. Advance → Analysis) expand an
 * inline dropdown inside this same panel — never another full panel.
 */
export function DomainSecondaryPanel({
  activeId,
  onClose,
  onOpenPage,
  mapTools,
}: DomainSecondaryPanelProps) {
  const { t } = useTranslation();
  const entry = getDomainNavEntry(activeId);
  // Single-expand accordion: only one group open at a time, reset whenever
  // the user switches to another top-level item.
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  useEffect(() => {
    setExpandedGroupId(null);
  }, [activeId]);

  return (
    <section
      data-testid={`domain-secondary-${activeId}`}
      aria-label={t(entry.labelKey)}
      className="max-h-[46vh] min-w-0 shrink-0 overflow-y-auto border-b bg-card"
    >
      <div className="flex items-start justify-between gap-2 px-3 pt-2">
        <h2 className="text-start text-sm font-semibold">{t(entry.labelKey)}</h2>
        <button
          type="button"
          data-testid="domain-secondary-close"
          onClick={onClose}
          aria-label={t("domainNav.closeSecondary")}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {activeId === "map" && mapTools ? (
        <div data-testid="domain-map-tools" className="border-b px-1 pb-1">
          {mapTools}
        </div>
      ) : null}

      <ul className="flex flex-col gap-0.5 px-2 py-2">
        {entry.items.map((item) => {
          if (item.children) {
            const expanded = expandedGroupId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-testid={`domain-group-${item.id}`}
                  aria-expanded={expanded}
                  onClick={() => setExpandedGroupId(expanded ? null : item.id)}
                  className={ROW_BUTTON_CLASS}
                >
                  <span>{t(item.labelKey)}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded ? (
                  <ul className="ms-3 flex flex-col gap-0.5 border-s ps-2">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <SecondaryItemButton
                          label={t(child.labelKey)}
                          opensPage={child.opensPagePanel}
                          openLabel={t("domainNav.openPage")}
                          onClick={() =>
                            child.opensPagePanel
                              ? onOpenPage({ navId: activeId, itemId: child.id })
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          }
          return (
            <li key={item.id}>
              <SecondaryItemButton
                label={t(item.labelKey)}
                opensPage={item.opensPagePanel}
                openLabel={t("domainNav.openPage")}
                testId={`domain-item-${item.id}`}
                onClick={() =>
                  item.opensPagePanel ? onOpenPage({ navId: activeId, itemId: item.id }) : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SecondaryItemButton({
  label,
  opensPage,
  openLabel,
  onClick,
  testId,
}: {
  label: string;
  opensPage?: boolean;
  openLabel: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} className={ROW_BUTTON_CLASS}>
      <span>{label}</span>
      {opensPage ? (
        <span aria-hidden="true" className="shrink-0 text-xs text-muted-foreground">
          {openLabel} →
        </span>
      ) : null}
    </button>
  );
}

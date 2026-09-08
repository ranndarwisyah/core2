import { cn } from "@geolibre/ui";
import { useTranslation } from "react-i18next";
import { DOMAIN_NAV_CATALOG, type DomainNavId } from "./domainNavCatalog";

interface DomainTopBarProps {
  activeId: DomainNavId | null;
  onSelect: (id: DomainNavId) => void;
}

/**
 * Sole primary top bar (panels.md §2). Full-width, same card/border language
 * as the existing toolbar, horizontally scrollable on narrow widths. The nav
 * is centered with `mx-auto`: auto margins collapse to zero when the content
 * overflows, so narrow viewports still scroll from the first item instead of
 * clipping it (unlike `justify-center`), and it stays RTL-safe.
 */
export function DomainTopBar({ activeId, onSelect }: DomainTopBarProps) {
  const { t } = useTranslation();
  return (
    <header
      data-testid="domain-top-bar"
      aria-label={t("domainNav.topBarLabel")}
      className="flex min-h-11 min-w-0 shrink-0 items-center gap-1 overflow-x-auto border-b bg-card px-2 py-1"
    >
      <nav
        aria-label={t("domainNav.topBarLabel")}
        className="mx-auto flex min-w-0 items-center gap-1"
      >
        {DOMAIN_NAV_CATALOG.map((entry) => {
          const active = activeId === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              data-testid={`domain-top-bar-${entry.id}`}
              aria-pressed={active}
              onClick={() => onSelect(entry.id)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {t(entry.labelKey)}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

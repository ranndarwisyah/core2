import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { findDomainNavSubItem, getDomainNavEntry } from "./domainNavCatalog";
import type { DomainPageRef } from "./useDomainNav";

interface DomainPagePanelProps {
  page: DomainPageRef;
  onClose: () => void;
}

/**
 * Full-overlay page panel for content-heavy views (panels.md §4). It covers
 * the workspace below the top bar while the live map keeps running behind;
 * closing returns to the previous map + secondary state. Per-panel content
 * (tables, charts, forms) lands in follow-up specs (dam-panel.md, …) — this
 * shell provides the overlay, title, and close control.
 */
export function DomainPagePanel({ page, onClose }: DomainPagePanelProps) {
  const { t } = useTranslation();
  const entry = getDomainNavEntry(page.navId);
  const item = findDomainNavSubItem(page.navId, page.itemId);

  return (
    <div
      data-testid="domain-page-panel"
      role="dialog"
      aria-modal="false"
      aria-label={item ? t(item.labelKey) : t(entry.labelKey)}
      className="absolute inset-0 z-30 flex min-h-0 min-w-0 flex-col bg-background"
    >
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b bg-card px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{t(entry.labelKey)}</p>
          <h2 className="truncate text-start text-base font-semibold">
            {item ? t(item.labelKey) : t(entry.labelKey)}
          </h2>
        </div>
        <button
          type="button"
          data-testid="domain-page-close"
          onClick={onClose}
          aria-label={t("domainNav.closePage")}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="text-start text-sm text-muted-foreground">{t("domainNav.pagePlaceholder")}</p>
      </div>
    </div>
  );
}

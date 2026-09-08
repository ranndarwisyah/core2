import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@geolibre/ui";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  CircleHelp,
  ClipboardList,
  Clock,
  Contact,
  Dam,
  Database,
  Droplets,
  FileText,
  Gauge,
  Info,
  Layers,
  LayoutDashboard,
  LineChart,
  Map as MapIcon,
  MapPinned,
  Megaphone,
  MessageSquare,
  RadioTower,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Waves,
  Webcam,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDomainNavEntry, type DomainNavId } from "./domainNavCatalog";
import type { DomainPageRef } from "./useDomainNav";

/**
 * Category icon for each sub-item, keyed as `${navId}:${itemId}` so views that
 * share an id (several "data"/"overview" items) can still differ per section.
 * Unknown items fall back to CircleHelp.
 */
const ITEM_ICONS: Record<string, LucideIcon> = {
  "home:overview": LayoutDashboard,
  "about:overview": Info,
  "about:message": MessageSquare,
  "about:quality": ShieldCheck,
  "about:contact": Contact,
  "about:plan": ClipboardList,
  "map:stations": RadioTower,
  "dam:data": Table2,
  "dam:storageGraph": LineChart,
  "dam:inflowOutflow": Waves,
  "rainfall:monthly": CalendarDays,
  "rainfall:daily": CalendarRange,
  "rainfall:inflowOutflow": Waves,
  "rainfall:dam": Dam,
  "rainfall:river": MapIcon,
  "rainfall:mudaArea": MapPinned,
  "rainfall:sevenDays": CalendarClock,
  "rainfall:hourly": Clock,
  "waterlevel:catchment": Droplets,
  "waterlevel:multiple": Layers,
  "waterlevel:graph": LineChart,
  "waterlevel:data": Table2,
  "gate:map": MapIcon,
  "gate:data": Table2,
  "gate:level": Gauge,
  "gate:distribution": ChartColumn,
  "webcam:sht": Webcam,
  "webcam:ampangJajar": Webcam,
  "webcam:spai": Webcam,
  "services:announcement": Megaphone,
  "services:feedback": MessageSquare,
  "advance:data": Database,
  "advance:report": FileText,
  "advance:info": Info,
  "advance:analysis": ChartColumn,
  "advance:config": SlidersHorizontal,
};

const FALLBACK_ICON: LucideIcon = CircleHelp;

function itemIcon(navId: DomainNavId, itemId: string): LucideIcon {
  return ITEM_ICONS[`${navId}:${itemId}`] ?? FALLBACK_ICON;
}

const TOOLBAR_BUTTON_CLASS = "shrink-0";

interface DomainToolbarProps {
  activeId: DomainNavId;
  onOpenPage: (ref: DomainPageRef) => void;
}

/**
 * Horizontal secondary-panel toolbar: every first-level sub-item renders as a
 * ghost icon+label button, matching the Map secondary panel's toolbar look.
 * Advance-style groups (items with `children`) render as dropdown buttons —
 * their nested options appear only when the group is clicked, never as another
 * panel. Sub-items that have no page registered yet render disabled so the row
 * stays present but not messy.
 */
export function DomainToolbar({ activeId, onOpenPage }: DomainToolbarProps) {
  const { t } = useTranslation();
  const entry = getDomainNavEntry(activeId);

  return (
    <div
      data-testid={`domain-toolbar-${activeId}`}
      className="flex min-w-0 flex-1 flex-wrap items-center gap-1 md:flex-nowrap md:overflow-x-auto"
    >
      {entry.items.map((item) => {
        const Icon = itemIcon(activeId, item.id);
        if (item.children) {
          // Group (Advance): a dropdown — options appear on click.
          return (
            <DropdownMenu key={item.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  className={TOOLBAR_BUTTON_CLASS}
                  variant="ghost"
                  size="sm"
                  data-testid={`domain-group-${item.id}`}
                  aria-label={t(item.labelKey)}
                >
                  <Icon className="me-1 h-3.5 w-3.5" />
                  <span>{t(item.labelKey)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-52">
                {item.children.map((child) => (
                  <DropdownMenuItem
                    key={child.id}
                    disabled={!child.opensPagePanel}
                    data-testid={`domain-item-${child.id}`}
                    onSelect={
                      child.opensPagePanel
                        ? () => onOpenPage({ navId: activeId, itemId: child.id })
                        : undefined
                    }
                  >
                    {t(child.labelKey)}
                    {child.opensPagePanel ? (
                      <span className="ms-2 text-xs text-muted-foreground">
                        {t("domainNav.openPage")} →
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        // Leaf: opens its page panel when one exists; otherwise disabled.
        return (
          <Button
            key={item.id}
            className={TOOLBAR_BUTTON_CLASS}
            variant="ghost"
            size="sm"
            disabled={!item.opensPagePanel}
            data-testid={`domain-item-${item.id}`}
            onClick={
              item.opensPagePanel
                ? () => onOpenPage({ navId: activeId, itemId: item.id })
                : undefined
            }
          >
            <Icon className="me-1 h-3.5 w-3.5" />
            <span>{t(item.labelKey)}</span>
          </Button>
        );
      })}
    </div>
  );
}
type PanelCloseFn = () => void;

const panelRegistry = new Map<string, { open: () => void; close: () => void }>();
const openPanels = new Set<string>();

export function registerPanel(
  id: string,
  openFn: () => void,
  closeFn: () => void,
): void {
  panelRegistry.set(id, { open: openFn, close: closeFn });
}

export function unregisterPanel(id: string): void {
  panelRegistry.delete(id);
  openPanels.delete(id);
}

export function openPanel(id: string): void {
  const panel = panelRegistry.get(id);
  if (!panel) return;
  panel.open();
  openPanels.add(id);
}

export function closePanel(id: string): void {
  const panel = panelRegistry.get(id);
  if (!panel) return;
  panel.close();
  openPanels.delete(id);
}

export function closeAllPanels(exceptId?: string): void {
  for (const [id, panel] of panelRegistry) {
    if (id !== exceptId) {
      panel.close();
      openPanels.delete(id);
    }
  }
}

export function isPanelOpen(id: string): boolean {
  return openPanels.has(id);
}

export function getOpenPanels(): string[] {
  return Array.from(openPanels);
}

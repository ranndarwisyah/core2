import { loadEntityStore, saveEntityStore } from '../data/store';
import { t, getLocale } from '../i18n';
import { getSession } from '../auth';
import type { MitsAnnouncement } from '../types';
import { STORAGE_KEYS } from '../constants';

function esc(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(getLocale() === 'ms' ? 'ms-MY' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadAnnouncements(): MitsAnnouncement[] {
  return loadEntityStore<MitsAnnouncement>(STORAGE_KEYS.announcements, []);
}

function saveAnnouncements(list: MitsAnnouncement[]): void {
  saveEntityStore(STORAGE_KEYS.announcements, list);
}

function seedDemoAnnouncements(): MitsAnnouncement[] {
  const existing = loadAnnouncements();
  if (existing.length > 0) return existing;
  const demos: MitsAnnouncement[] = [
    {
      id: generateId(),
      title: 'System Maintenance Notice',
      title_ms: 'Notis Penyelenggaraan Sistem',
      body: 'Scheduled maintenance on Saturday 2:00 AM - 6:00 AM MYT. Some telemetry feeds may be temporarily unavailable.',
      body_ms: 'Penyelenggaraan berjadual pada Sabtu 2:00 PG - 6:00 PG MYT. Sesuatu feed telemetri mungkin tidak tersedia buat sementara waktu.',
      featured: true,
      createdAt: new Date().toISOString(),
      author: 'MITS Admin',
    },
    {
      id: generateId(),
      title: 'New Station Online: Sg. Kedah Lebuh Raya',
      title_ms: 'Stesen Baharu Dalam Talian: Sg. Kedah Lebuh Raya',
      body: 'Station 120 (Sg. Kedah Lebuh Raya) is now reporting real-time data. RF/WL type with 15-minute intervals.',
      body_ms: 'Stesen 120 (Sg. Kedah Lebuh Raya) kini melaporkan data masa nyata. Jenis RF/WL dengan selang 15 minit.',
      featured: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      author: 'System',
    },
  ];
  saveAnnouncements(demos);
  return demos;
}

function renderCard(a: MitsAnnouncement): string {
  const locale = getLocale();
  const title = locale === 'ms' ? (a.title_ms || a.title) : a.title;
  const body = locale === 'ms' ? (a.body_ms || a.body) : a.body;
  return `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:10px;${a.featured ? 'border-left:3px solid #22d3ee;' : ''}">
      ${a.featured ? `<div style="display:inline-block;background:#22d3ee22;color:#22d3ee;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:6px;">${t('ann_featured', locale)}</div>` : ''}
      <div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">${esc(title)}</div>
      <div style="font-size:12px;color:#94a3b8;line-height:1.5;">${esc(body)}</div>
      <div style="font-size:11px;color:#64748b;margin-top:8px;">${fmtDate(a.createdAt)} · ${esc(a.author)}</div>
    </div>`;
}

function renderForm(container: HTMLElement, editItem: MitsAnnouncement | null, onDone: () => void): void {
  const locale = getLocale();
  const isEdit = !!editItem;

  container.innerHTML = `
    <div style="padding:16px;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;">${isEdit ? t('ann_edit', locale) : t('ann_new', locale)}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <input id="annTitle" value="${esc(editItem?.title || '')}" placeholder="${t('ann_title', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
        <input id="annTitleMs" value="${esc(editItem?.title_ms || '')}" placeholder="${t('ann_title_ms', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
        <textarea id="annBody" rows="3" placeholder="${t('ann_body', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;resize:vertical;">${esc(editItem?.body || '')}</textarea>
        <textarea id="annBodyMs" rows="3" placeholder="${t('ann_body_ms', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;resize:vertical;">${esc(editItem?.body_ms || '')}</textarea>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8;">
          <input type="checkbox" id="annFeatured" ${editItem?.featured ? 'checked' : ''} style="accent-color:#22d3ee;" />
          ${t('ann_featured', locale)}
        </label>
        <div style="display:flex;gap:8px;">
          <button id="annSave" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:12px;">${t('ann_save', locale)}</button>
          <button id="annCancel" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;">${t('ann_cancel', locale)}</button>
        </div>
      </div>
    </div>`;

  container.querySelector('#annCancel')?.addEventListener('click', onDone);
  container.querySelector('#annSave')?.addEventListener('click', () => {
    const title = (container.querySelector('#annTitle') as HTMLInputElement)?.value.trim();
    const titleMs = (container.querySelector('#annTitleMs') as HTMLInputElement)?.value.trim();
    const body = (container.querySelector('#annBody') as HTMLTextAreaElement)?.value.trim();
    const bodyMs = (container.querySelector('#annBodyMs') as HTMLTextAreaElement)?.value.trim();
    const featured = (container.querySelector('#annFeatured') as HTMLInputElement)?.checked;

    if (!title && !body) return;

    const list = loadAnnouncements();
    const session = getSession();
    const author = session?.displayName || 'Admin';

    if (isEdit && editItem) {
      const idx = list.findIndex((a) => a.id === editItem.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], title, title_ms: titleMs, body, body_ms: bodyMs, featured };
      }
    } else {
      list.unshift({ id: generateId(), title, title_ms: titleMs, body, body_ms: bodyMs, featured, createdAt: new Date().toISOString(), author });
    }
    saveAnnouncements(list);
    onDone();
  });
}

export function renderAnnouncementsPanel(container: HTMLElement): void {
  const locale = getLocale();
  seedDemoAnnouncements();

  function renderList(): void {
    const list = loadAnnouncements();
    const session = getSession();
    const isSuper = session?.role === 'superadmin';

    container.innerHTML = `
      <div style="padding:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:14px;font-weight:700;">${t('svc_announcement', locale)}</h3>
          ${isSuper ? `<button id="annNewBtn" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;">${t('ann_new', locale)}</button>` : ''}
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:12px;">${list.length} ${list.length === 1 ? 'announcement' : 'announcements'}</div>
        <div id="annList">${list.map((a) => renderCard(a)).join('')}</div>
      </div>`;

    container.querySelector('#annNewBtn')?.addEventListener('click', () => {
      renderForm(container, null, renderList);
    });

    // Add edit/delete buttons for superadmin
    if (isSuper) {
      list.forEach((a) => {
        const cardEl = container.querySelector(`[data-ann-id="${a.id}"]`);
        if (cardEl) {
          // We'll add buttons via event delegation
        }
      });

      container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const editBtn = target.closest('[data-ann-edit]') as HTMLElement;
        const delBtn = target.closest('[data-ann-delete]') as HTMLElement;

        if (editBtn) {
          const id = editBtn.dataset.annEdit;
          const item = list.find((a) => a.id === id);
          if (item) renderForm(container, item, renderList);
        }

        if (delBtn) {
          const id = delBtn.dataset.annDelete;
          if (id && confirm(locale === 'ms' ? 'Padam pengumuman ini?' : 'Delete this announcement?')) {
            const updated = list.filter((a) => a.id !== id);
            saveAnnouncements(updated);
            renderList();
          }
        }
      });
    }
  }

  renderList();
}

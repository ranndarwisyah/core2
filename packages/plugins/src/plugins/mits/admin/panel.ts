import { loadEntityStore, saveEntityStore } from '../data/store';
import { t, getLocale } from '../i18n';
import { getSession, login } from '../auth';
import type { MitsStation, MitsDam, MitsRegulator, MitsWebcam } from '../types';
import { STORAGE_KEYS } from '../constants';
import { SEED_STATIONS, SEED_DAMS, SEED_REGULATORS, SEED_WEBCAMS } from '../data/seed';

type EntityKind = 'stations' | 'dams' | 'regulators' | 'webcams';

function esc(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadEntities<T>(kind: EntityKind): T[] {
  const defaults: Record<EntityKind, unknown[]> = {
    stations: SEED_STATIONS,
    dams: SEED_DAMS,
    regulators: SEED_REGULATORS,
    webcams: SEED_WEBCAMS,
  };
  return loadEntityStore<T>(STORAGE_KEYS[kind], defaults[kind] as T[]);
}

function saveEntities<T>(kind: EntityKind, list: T[]): void {
  saveEntityStore(STORAGE_KEYS[kind], list);
}

function loginForm(container: HTMLElement): void {
  const locale = getLocale();
  container.innerHTML = `
    <div style="padding:24px;text-align:center;">
      <h3 style="margin:0 0 8px;font-size:15px;">${t('admin_login_title', locale)}</h3>
      <p style="font-size:12px;color:#94a3b8;margin:0 0 16px;">${t('admin_login_sub', locale)}</p>
      <div style="display:flex;flex-direction:column;gap:8px;max-width:240px;margin:0 auto;">
        <input id="admUser" placeholder="${t('admin_username', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
        <input id="admPass" type="password" placeholder="${t('admin_password', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
        <button id="admLogin" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:8px;font-weight:600;cursor:pointer;">${t('admin_sign_in', locale)}</button>
        <p style="font-size:11px;color:#64748b;margin:4px 0 0;">${t('admin_demo_accounts', locale)}</p>
      </div>
    </div>`;

  container.querySelector('#admLogin')?.addEventListener('click', () => {
    const user = (container.querySelector('#admUser') as HTMLInputElement)?.value.trim();
    const pass = (container.querySelector('#admPass') as HTMLInputElement)?.value;
    if (login(user, pass)) {
      renderDashboard(container);
    } else {
      alert(locale === 'ms' ? 'Kelayakan tidak sah.' : 'Invalid credentials.');
    }
  });
}

function renderDashboard(container: HTMLElement): void {
  const locale = getLocale();
  const session = getSession();
  const counts = {
    stations: loadEntities<MitsStation>('stations').length,
    dams: loadEntities<MitsDam>('dams').length,
    regulators: loadEntities<MitsRegulator>('regulators').length,
    webcams: loadEntities<MitsWebcam>('webcams').length,
  };

  container.innerHTML = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="margin:0;font-size:15px;font-weight:700;">${t('admin_config_label', locale)}</h3>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:12px;color:#94a3b8;">${t('admin_logged_as', locale)}: <b style="color:#f1f5f9;">${session?.displayName}</b></span>
          <button id="admLogout" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;">${t('admin_logout', locale) || 'Logout'}</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:12px;">
        <div data-card="stations" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='#1e293b'">
          <div style="font-size:24px;margin-bottom:8px;">&#128225;</div>
          <div style="font-size:13px;font-weight:600;">${t('admin_tab_stations', locale)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${counts.stations} records</div>
        </div>
        <div data-card="dams" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='#1e293b'">
          <div style="font-size:24px;margin-bottom:8px;">&#127959;</div>
          <div style="font-size:13px;font-weight:600;">${t('admin_tab_dams', locale)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${counts.dams} records</div>
        </div>
        <div data-card="regulators" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='#1e293b'">
          <div style="font-size:24px;margin-bottom:8px;">&#9881;</div>
          <div style="font-size:13px;font-weight:600;">${t('admin_tab_regulators', locale)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${counts.regulators} records</div>
        </div>
        <div data-card="webcams" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='#1e293b'">
          <div style="font-size:24px;margin-bottom:8px;">&#128247;</div>
          <div style="font-size:13px;font-weight:600;">${t('admin_tab_webcams', locale)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${counts.webcams} records</div>
        </div>
      </div>
    </div>`;

  container.querySelector('#admLogout')?.addEventListener('click', () => {
    loginForm(container);
  });

  container.querySelectorAll('[data-card]').forEach((card) => {
    card.addEventListener('click', () => {
      const kind = (card as HTMLElement).dataset.card as EntityKind;
      renderCrudList(container, kind);
    });
  });
}

function renderCrudList(container: HTMLElement, kind: EntityKind): void {
  const locale = getLocale();
  const entities = loadEntities<Record<string, unknown>>(kind);

  const labels: Record<EntityKind, { name: string; fields: string[] }> = {
    stations: { name: t('admin_tab_stations', locale), fields: ['station_id', 'station_name', 'station_type', 'district', 'wilayah'] },
    dams: { name: t('admin_tab_dams', locale), fields: ['id', 'name', 'district', 'storage_pct', 'level_ft'] },
    regulators: { name: t('admin_tab_regulators', locale), fields: ['id', 'name', 'station_id', 'district', 'num_gates'] },
    webcams: { name: t('admin_tab_webcams', locale), fields: ['id', 'name', 'station_id', 'stream_type', 'district'] },
  };

  const cfg = labels[kind];
  const headerCells = cfg.fields.map((f) => `<th style="background:#1e293b;color:#22d3ee;padding:6px 8px;border:1px solid #334155;text-align:left;font-size:11px;">${f}</th>`).join('');

  const rows = entities.map((e, idx) => {
    const cells = cfg.fields.map((f) => `<td style="padding:6px 8px;border-bottom:1px solid #1e293b;font-size:12px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(String(e[f] ?? ''))}</td>`).join('');
    return `<tr>
      ${cells}
      <td style="padding:6px 8px;border-bottom:1px solid #1e293b;">
        <button data-edit="${idx}" style="background:#1e293b;color:#22d3ee;border:1px solid #334155;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:10px;margin-right:4px;">Edit</button>
        <button data-del="${idx}" style="background:#1e293b;color:#ef4444;border:1px solid #334155;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:10px;">Del</button>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;font-size:14px;font-weight:700;">${cfg.name}</h3>
        <div style="display:flex;gap:6px;">
          <button id="crudNew" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;">${t('admin_new', locale) || 'New'}</button>
          <button id="crudBack" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;">${t('admin_back', locale) || 'Back'}</button>
        </div>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:8px;">${entities.length} records</div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${headerCells}<th style="background:#1e293b;color:#22d3ee;padding:6px 8px;border:1px solid #334155;font-size:11px;">Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  container.querySelector('#crudBack')?.addEventListener('click', () => renderDashboard(container));
  container.querySelector('#crudNew')?.addEventListener('click', () => renderCrudForm(container, kind, null));

  container.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.edit || '-1', 10);
      if (idx >= 0) renderCrudForm(container, kind, entities[idx]);
    });
  });

  container.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.del || '-1', 10);
      if (idx >= 0 && confirm(locale === 'ms' ? 'Padam rekod ini?' : 'Delete this record?')) {
        const list = loadEntities<Record<string, unknown>>(kind);
        list.splice(idx, 1);
        saveEntities(kind, list);
        renderCrudList(container, kind);
      }
    });
  });
}

function renderCrudForm(container: HTMLElement, kind: EntityKind, item: Record<string, unknown> | null): void {
  const locale = getLocale();
  const isEdit = !!item;

  const fieldConfigs: Record<EntityKind, { key: string; label: string; type: string }[]> = {
    stations: [
      { key: 'station_id', label: 'ID', type: 'text' },
      { key: 'station_name', label: 'Name', type: 'text' },
      { key: 'station_type', label: 'Type', type: 'select', } ,
      { key: 'district', label: 'District', type: 'text' },
      { key: 'wilayah', label: 'Wilayah', type: 'text' },
      { key: 'lon', label: 'Longitude', type: 'number' },
      { key: 'lat', label: 'Latitude', type: 'number' },
    ],
    dams: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'district', label: 'District', type: 'text' },
      { key: 'level_ft', label: 'Level (ft)', type: 'number' },
      { key: 'storage_acft', label: 'Storage (ac-ft)', type: 'number' },
      { key: 'storage_pct', label: 'Storage %', type: 'number' },
      { key: 'release_q', label: 'Release (Q)', type: 'number' },
    ],
    regulators: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'station_id', label: 'Station ID', type: 'text' },
      { key: 'district', label: 'District', type: 'text' },
      { key: 'num_gates', label: 'Num Gates', type: 'number' },
    ],
    webcams: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'station_id', label: 'Station ID', type: 'text' },
      { key: 'stream_type', label: 'Stream Type', type: 'select' },
      { key: 'stream_url', label: 'Stream URL', type: 'text' },
      { key: 'district', label: 'District', type: 'text' },
    ],
  };

  const fields = fieldConfigs[kind];
  const formFields = fields.map((f) => {
    const val = item ? String(item[f.key] ?? '') : '';
    if (f.type === 'select') {
      const options = kind === 'stations'
        ? ['RF/WL/GO', 'RF/WL', 'WL', 'WL/GO']
        : kind === 'webcams'
        ? ['HLS', 'RTSP', 'MJPEG']
        : [];
      const opts = options.map((o) => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('');
      return `<div><label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:2px;">${f.label}</label><select data-field="${f.key}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:12px;width:100%;">${opts}</select></div>`;
    }
    return `<div><label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:2px;">${f.label}</label><input data-field="${f.key}" value="${esc(val)}" type="${f.type}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:12px;width:100%;box-sizing:border-box;" /></div>`;
  }).join('');

  container.innerHTML = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;font-size:14px;font-weight:700;">${isEdit ? t('admin_edit', locale) || 'Edit' : t('admin_new', locale) || 'New'}</h3>
        <button id="crudCancel" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;">${t('ann_cancel', locale)}</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:500px;">
        ${formFields}
      </div>
      <button id="crudSave" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:12px;margin-top:16px;">${t('ann_save', locale)}</button>
    </div>`;

  container.querySelector('#crudCancel')?.addEventListener('click', () => renderCrudList(container, kind));
  container.querySelector('#crudSave')?.addEventListener('click', () => {
    const data: Record<string, unknown> = item ? { ...item } : {};
    container.querySelectorAll('[data-field]').forEach((el) => {
      const key = (el as HTMLElement).dataset.field!;
      const val = (el as HTMLInputElement | HTMLSelectElement).value;
      data[key] = val;
    });

    const list = loadEntities<Record<string, unknown>>(kind);
    if (isEdit) {
      const idx = list.findIndex((e) => e.id === item?.id || e.station_id === item?.station_id);
      if (idx >= 0) list[idx] = data;
    } else {
      if (!data.id) data.id = generateId();
      list.push(data);
    }
    saveEntities(kind, list);
    renderCrudList(container, kind);
  });
}

export function renderAdminPanel(container: HTMLElement, _app: unknown): void {
  const session = getSession();
  if (session) {
    renderDashboard(container);
  } else {
    loginForm(container);
  }
}

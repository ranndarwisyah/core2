import { t, getLocale } from '../i18n';
import { MP_HTML_B64 } from '../data/seed';

export function renderSchematicPanel(container: HTMLElement): void {
  const locale = getLocale();

  let blobUrl = '';
  try {
    const html = atob(MP_HTML_B64);
    const blob = new Blob([html], { type: 'text/html' });
    blobUrl = URL.createObjectURL(blob);
  } catch {}

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">
      <div style="padding:10px 16px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
        <h3 style="margin:0;font-size:14px;font-weight:700;">${t('map_plan', locale)}</h3>
      </div>
      <div style="flex:1;position:relative;">
        ${blobUrl
          ? `<iframe src="${blobUrl}" style="width:100%;height:100%;border:0;background:#fff;"></iframe>`
          : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;">Schematic unavailable</div>'
        }
      </div>
    </div>
  `;
}

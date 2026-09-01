import { loadEntityStore, saveEntityStore } from '../data/store';
import { t, getLocale } from '../i18n';
import { getSession } from '../auth';
import type { MitsFeedback } from '../types';
import { STORAGE_KEYS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadFeedback(): MitsFeedback[] {
  return loadEntityStore<MitsFeedback>(STORAGE_KEYS.feedback, []);
}

function saveFeedback(list: MitsFeedback[]): void {
  saveEntityStore(STORAGE_KEYS.feedback, list);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(getLocale() === 'ms' ? 'ms-MY' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function ratingStars(current: number, interactive: boolean): string {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= current;
    stars.push(`<span class="fb-star" data-val="${i}" style="cursor:${interactive ? 'pointer' : 'default'};font-size:18px;color:${filled ? '#f0a63d' : '#334155'};">${filled ? '\u2605' : '\u2606'}</span>`);
  }
  return stars.join('');
}

export function renderFeedbackPanel(container: HTMLElement): void {
  const locale = getLocale();
  const session = getSession();
  const isSuper = session?.role === 'superadmin';
  let currentRating = 0;

  function renderForm(): void {
    container.innerHTML = `
      <div style="padding:16px;">
        <h3 style="margin:0 0 4px;font-size:14px;font-weight:700;">${t('svc_feedback', locale)}</h3>
        <p style="margin:0 0 16px;font-size:12px;color:#94a3b8;">${t('fb_sub', locale)}</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input id="fbName" placeholder="${t('fb_name', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
          <input id="fbEmail" placeholder="${t('fb_email', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
          <select id="fbCategory" style="background:#0f172a;border:1px solid #334155;color:#94a3b8;border-radius:6px;padding:8px 10px;font-size:13px;">
            <option value="">${t('fb_cat_select', locale)}</option>
            <option value="bug">${t('fb_cat_bug', locale)}</option>
            <option value="data">${t('fb_cat_data', locale)}</option>
            <option value="ui">${t('fb_cat_ui', locale)}</option>
            <option value="feature">${t('fb_cat_feature', locale)}</option>
            <option value="ops">${t('fb_cat_ops', locale)}</option>
            <option value="other">${t('fb_cat_other', locale)}</option>
          </select>
          <input id="fbSubject" placeholder="${t('fb_subject', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;" />
          <textarea id="fbMessage" rows="4" placeholder="${t('fb_message', locale)}" style="background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:8px 10px;font-size:13px;resize:vertical;"></textarea>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#94a3b8;">${t('fb_rating', locale) || 'Rating'}:</span>
            <div id="fbStars" style="display:flex;gap:2px;">${ratingStars(currentRating, true)}</div>
          </div>
          <button id="fbSubmit" style="background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:13px;">${t('fb_submit', locale)}</button>
        </div>
      </div>`;

    // Star rating interaction
    container.querySelectorAll('.fb-star').forEach((el) => {
      el.addEventListener('click', () => {
        currentRating = parseInt((el as HTMLElement).dataset.val || '0', 10);
        const starsEl = container.querySelector('#fbStars');
        if (starsEl) starsEl.innerHTML = ratingStars(currentRating, true);
      });
    });

    // Submit handler
    container.querySelector('#fbSubmit')?.addEventListener('click', () => {
      const name = (container.querySelector('#fbName') as HTMLInputElement)?.value.trim();
      const email = (container.querySelector('#fbEmail') as HTMLInputElement)?.value.trim();
      const category = (container.querySelector('#fbCategory') as HTMLSelectElement)?.value;
      const subject = (container.querySelector('#fbSubject') as HTMLInputElement)?.value.trim();
      const message = (container.querySelector('#fbMessage') as HTMLTextAreaElement)?.value.trim();

      if (!message) {
        alert(locale === 'ms' ? 'Sila masukkan mesej.' : 'Please enter a message.');
        return;
      }

      const feedback: MitsFeedback = {
        id: generateId(),
        name: name || (session?.displayName ?? 'Anonymous'),
        email: email || '',
        org: '',
        category: category || 'other',
        subject: subject || '',
        message,
        rating: currentRating,
        createdAt: new Date().toISOString(),
      };

      const list = loadFeedback();
      list.unshift(feedback);
      saveFeedback(list);

      renderSuccess();
    });
  }

  function renderSuccess(): void {
    container.innerHTML = `
      <div style="padding:16px;">
        <div style="text-align:center;padding:32px 16px;">
          <div style="font-size:48px;margin-bottom:12px;">&#10003;</div>
          <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#33c17b;">${t('fb_thanks', locale) || 'Thank You!'}</h3>
          <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;">${t('fb_success', locale) || 'Your feedback has been submitted successfully.'}</p>
          <button id="fbAnother" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;">${t('fb_another', locale) || 'Submit Another'}</button>
          ${isSuper ? `<button id="fbViewAll" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;margin-left:8px;">${t('fb_view_all', locale) || 'View All Feedback'}</button>` : ''}
        </div>
      </div>`;

    container.querySelector('#fbAnother')?.addEventListener('click', () => {
      currentRating = 0;
      renderForm();
    });

    container.querySelector('#fbViewAll')?.addEventListener('click', renderHistory);
  }

  function renderHistory(): void {
    const list = loadFeedback();
    container.innerHTML = `
      <div style="padding:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:14px;font-weight:700;">${t('fb_view_all', locale) || 'All Feedback'}</h3>
          <button id="fbBack" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;">${t('fb_new', locale) || 'New'}</button>
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:12px;">${list.length} submissions</div>
        ${list.length === 0 ? `<div style="text-align:center;padding:24px;color:#64748b;font-size:13px;">${t('fb_empty', locale) || 'No feedback yet.'}</div>` : ''}
        ${list.map((f) => `
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:12px;font-weight:600;color:#f1f5f9;">${f.name}</span>
              <span style="font-size:11px;color:#64748b;">${fmtDate(f.createdAt)}</span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:4px;">${f.category} · ${f.email || 'no email'}</div>
            <div style="font-size:12px;color:#22d3ee;font-weight:600;margin-bottom:4px;">${f.subject}</div>
            <div style="font-size:12px;color:#94a3b8;line-height:1.5;">${f.message}</div>
            ${f.rating > 0 ? `<div style="margin-top:6px;">${ratingStars(f.rating, false)}</div>` : ''}
          </div>
        `).join('')}
      </div>`;

    container.querySelector('#fbBack')?.addEventListener('click', () => {
      currentRating = 0;
      renderForm();
    });
  }

  renderForm();
}

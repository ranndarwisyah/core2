import { t, getLocale } from '../i18n';

export function renderRotateViewPanel(container: HTMLElement): void {
  const locale = getLocale();
  const slides = ['Map', t('tab_alerts', locale), t('rain_hourly', locale), t('wl_data', locale), t('svc_announcement', locale)];
  let currentIndex = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  function render(): void {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="padding:14px 18px;border-bottom:1px solid #1e293b;">
          <h3 style="margin:0;font-size:14px;font-weight:700;">${t('adv_rotate_view', locale)}</h3>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px;">
          <div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">${currentIndex === 0 ? '🗺️' : currentIndex === 1 ? '⚠️' : currentIndex === 2 ? '🌧️' : currentIndex === 3 ? '💧' : '📢'}</div>
            <h2 style="font-size:18px;color:#f1f5f9;margin:0 0 8px;">${slides[currentIndex]}</h2>
            <p style="font-size:12px;color:#64748b;">Slide ${currentIndex + 1} of ${slides.length}</p>
          </div>
        </div>
        <div style="padding:12px 18px;border-top:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:6px;">
            ${slides.map((_, i) => `<button data-slide="${i}" style="width:8px;height:8px;border-radius:50%;border:none;background:${i === currentIndex ? '#22d3ee' : '#334155'};cursor:pointer;"></button>`).join('')}
          </div>
          <div style="display:flex;gap:6px;">
            <button data-toggle style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;">${timer ? 'Pause' : 'Play'}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentIndex = parseInt((btn as HTMLElement).dataset.slide ?? '0');
        render();
      });
    });

    container.querySelector('[data-toggle]')?.addEventListener('click', () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      } else {
        timer = setInterval(() => {
          currentIndex = (currentIndex + 1) % slides.length;
          render();
        }, 5000);
      }
      render();
    });
  }

  render();
}

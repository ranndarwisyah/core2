import { t, getLocale } from '../i18n';

const SLIDES = [
  { title: 'Quality Policy', content: 'MADA is committed to delivering high-quality water management services through continuous improvement and innovation.' },
  { title: 'Quality Objectives', content: 'Ensure reliable telemetry data, maintain infrastructure integrity, and support sustainable water resource management.' },
  { title: 'Quality Management', content: 'Systematic approach to quality through documented procedures, regular audits, and performance monitoring.' },
  { title: 'Quality Assurance', content: 'Verification and validation processes ensure data accuracy and system reliability across all MADA operations.' },
  { title: 'Quality Improvement', content: 'Continuous improvement through feedback loops, technology upgrades, and stakeholder engagement.' },
];

export function renderQualitySystemPanel(container: HTMLElement): void {
  const locale = getLocale();
  let currentSlide = 0;
  let autoTimer: ReturnType<typeof setInterval> | null = null;

  function render(): void {
    const slide = SLIDES[currentSlide];
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="padding:14px 18px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
          <h3 style="margin:0;font-size:15px;font-weight:700;">${t('about_quality', locale)}</h3>
          <span style="font-size:12px;color:#64748b;font-family:monospace;">${currentSlide + 1}/${SLIDES.length}</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:#fefce8;">
          <div style="max-width:600px;text-align:center;">
            <h2 style="font-family:Georgia,serif;font-size:24px;color:#8B0000;margin:0 0 16px;">${slide.title}</h2>
            <p style="font-size:15px;line-height:1.6;color:#0d4f4f;margin:0;">${slide.content}</p>
          </div>
        </div>
        <div style="padding:12px 18px;border-top:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:8px;">
            ${SLIDES.map((_, i) => `<button data-slide="${i}" style="width:9px;height:9px;border-radius:50%;border:none;background:${i === currentSlide ? '#22d3ee' : '#334155'};cursor:pointer;"></button>`).join('')}
          </div>
          <div style="display:flex;gap:8px;">
            <button data-prev style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;">Prev</button>
            <button data-next style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;">Next</button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentSlide = parseInt((btn as HTMLElement).dataset.slide ?? '0');
        render();
      });
    });

    container.querySelector('[data-prev]')?.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + SLIDES.length) % SLIDES.length;
      render();
    });

    container.querySelector('[data-next]')?.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % SLIDES.length;
      render();
    });
  }

  render();
}

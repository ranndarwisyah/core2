import { loadEntityStore } from '../data/store';
import { SEED_STATIONS, SEED_REALTIME } from '../data/seed';
import { t, getLocale } from '../i18n';
import type { MitsStation, MitsRealtime } from '../types';
import { STORAGE_KEYS, STATUS_COLORS } from '../constants';

type ChartInstance = { destroy(): void } | null;

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

const RF_LEVEL_COLORS: Record<string, string> = {
  normal: '#33c17b',
  alert: '#f0a63d',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const CHART_COLORS = {
  level: '#3b82f6',
  scatter: '#22d3ee',
};

function rfMmToLevel(mm: number, th: { alert: number; danger: number }): string {
  if (mm >= th.danger) return 'danger';
  if (mm >= th.alert) return 'alert';
  return 'normal';
}

function getRfChartThresholds(stationId: string): { alert: number; danger: number } {
  const defaults = { alert: 60, danger: 120 };
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const st = stations.find((s) => String(s.station_id) === String(stationId));
  if (st?.thresholds) {
    const a = st.thresholds.rf_alert;
    const d = st.thresholds.rf_danger;
    if (a != null && d != null) return { alert: a, danger: d };
  }
  return defaults;
}

function createCanvas(container: HTMLElement): HTMLCanvasElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;height:280px;width:100%;';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;';
  wrap.appendChild(canvas);
  container.appendChild(wrap);
  return canvas;
}

function getActiveRfStations(district: string | null): MitsStation[] {
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const rf = stations.filter((s) => s.station_type.includes('RF'));
  if (district) return rf.filter((s) => s.district === district);
  return rf;
}

function getActiveWlStations(district: string | null): MitsStation[] {
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const wl = stations.filter((s) => s.station_type.includes('WL'));
  if (district) return wl.filter((s) => s.district === district);
  return wl;
}

function getDistricts(): string[] {
  const stations = loadEntityStore<MitsStation>(STORAGE_KEYS.stations, SEED_STATIONS);
  const set = new Set(stations.map((s) => s.district).filter(Boolean));
  return Array.from(set).sort();
}

function buildToolbar(container: HTMLElement, options: { id: string; label: string; value: string; choices: { value: string; label: string }[] }[]): HTMLDivElement {
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;';
  for (const opt of options) {
    const label = document.createElement('label');
    label.style.cssText = 'font-size:12px;color:#94a3b8;';
    label.textContent = opt.label;
    const select = document.createElement('select');
    select.id = opt.id;
    select.style.cssText = 'background:#1e293b;border:1px solid #334155;color:#f1f5f9;border-radius:6px;padding:5px 8px;font-size:12px;min-width:120px;';
    for (const c of opt.choices) {
      const o = document.createElement('option');
      o.value = c.value;
      o.textContent = c.label;
      select.appendChild(o);
    }
    toolbar.appendChild(label);
    toolbar.appendChild(select);
  }
  const btn = document.createElement('button');
  btn.textContent = t('ui_query', getLocale());
  btn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 14px;font-weight:600;cursor:pointer;font-size:12px;';
  toolbar.appendChild(btn);
  container.appendChild(toolbar);
  return toolbar;
}

// ==================== RAINFALL CHARTS ====================

export function renderRainChartPanel(container: HTMLElement): void {
  const locale = getLocale();
  const rfStations = getActiveRfStations(null);
  let activeChart: ChartInstance = null;

  const header = document.createElement('div');
  header.style.cssText = 'padding:0 0 10px;';
  header.innerHTML = `<h3 style="margin:0 0 4px;font-size:14px;font-weight:700;">${t('rain_monthly', locale)}</h3>
    <p style="font-size:12px;color:#94a3b8;margin:0;">${t('rain_monthly_note', locale)}</p>`;
  container.appendChild(header);

  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;';
  const monthlyBtn = document.createElement('button');
  monthlyBtn.textContent = t('rain_monthly', locale);
  monthlyBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
  const dailyBtn = document.createElement('button');
  dailyBtn.textContent = t('rain_daily', locale);
  dailyBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
  tabRow.appendChild(monthlyBtn);
  tabRow.appendChild(dailyBtn);
  container.appendChild(tabRow);

  const toolbar = buildToolbar(container, [
    { id: 'rfStation', label: t('ui_station', locale), value: 'all', choices: [{ value: 'all', label: t('ui_all_stations', locale) }, ...rfStations.map((s) => ({ value: s.station_id, label: s.station_name }))]},
    { id: 'rfMonths', label: t('ui_no_of_months', locale), value: '12', choices: [{ value: '3', label: '3' }, { value: '6', label: '6' }, { value: '12', label: '12' }, { value: '24', label: '24' }]},
  ]);

  const chartHost = document.createElement('div');
  chartHost.style.cssText = 'background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;min-height:300px;';
  container.appendChild(chartHost);

  const noteEl = document.createElement('div');
  noteEl.style.cssText = 'font-size:11px;color:#64748b;margin-top:8px;';
  container.appendChild(noteEl);

  function drawMonthly() {
    if (activeChart) { try { activeChart.destroy(); } catch {} }
    activeChart = null;
    chartHost.innerHTML = '';

    const stId = (toolbar.querySelector('#rfStation') as HTMLSelectElement)?.value || 'all';
    const nMonths = parseInt((toolbar.querySelector('#rfMonths') as HTMLSelectElement)?.value || '12', 10);
    const th = getRfChartThresholds(stId);

    const monthDates = Array.from({ length: nMonths }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (nMonths - 1 - i));
      return d;
    });
    const labels = monthDates.map((d) => d.toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-GB', { month: 'short', year: '2-digit' }));
    const rnd = seededRand(hashSeed('m-' + stId + nMonths + labels[0]));
    const data = monthDates.map((d) => {
      const m = d.getMonth();
      return Math.round(40 + rnd() * 120 + (m >= 3 && m <= 10 ? 40 : 0));
    });
    const levels = data.map((v) => rfMmToLevel(v, th));
    const bg = levels.map((l) => RF_LEVEL_COLORS[l] || RF_LEVEL_COLORS.normal);
    const yMax = Math.max(20, Math.ceil(Math.max(...data) * 1.2 / 10) * 10);

    const canvas = createCanvas(chartHost);
    // Dynamic import Chart.js
    import('chart.js').then(({ Chart }) => {
      activeChart = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label: t('rain_monthly_axis', locale), data, backgroundColor: bg, borderRadius: 4 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 18 } },
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: yMax, title: { display: true, text: t('rain_monthly_axis', locale) } } },
        },
      });
    });

    const stLabel = stId === 'all' ? t('ui_all_stations', locale) : rfStations.find((s) => String(s.station_id) === stId)?.station_name || stId;
    noteEl.textContent = `${t('rain_monthly_note', locale)} · ${nMonths} · ${stLabel} · mock`;
  }

  function drawDaily() {
    if (activeChart) { try { activeChart.destroy(); } catch {} }
    activeChart = null;
    chartHost.innerHTML = '';

    const stId = (toolbar.querySelector('#rfStation') as HTMLSelectElement)?.value || 'all';
    const nDays = 7;
    const th = getRfChartThresholds(stId);

    const dayDates = Array.from({ length: nDays }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (nDays - 1 - i));
      return d;
    });
    const labels = dayDates.map((d) => d.toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-GB', { day: '2-digit', month: '2-digit' }));
    const rnd = seededRand(hashSeed('d-' + stId + nDays + labels[0]));
    const maxMm = Math.max(th.danger * 1.15, 40);
    const data = dayDates.map((_, i) => {
      const spike = (i === nDays - 2 || hashSeed('x' + i) % 7 === 0) ? 0.55 + rnd() * 0.45 : rnd() * 0.45;
      return +(spike * maxMm).toFixed(1);
    });
    const levels = data.map((v) => rfMmToLevel(v, th));
    const bg = levels.map((l) => RF_LEVEL_COLORS[l] || RF_LEVEL_COLORS.normal);
    const yMax = Math.max(10, Math.ceil((Math.max(...data, th.danger) + 5) / 5) * 5);

    const canvas = createCanvas(chartHost);
    import('chart.js').then(({ Chart }) => {
      activeChart = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label: t('rain_daily_axis', locale), data, backgroundColor: bg, borderRadius: 3 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 18 } },
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: yMax, title: { display: true, text: t('rain_daily_axis', locale) } } },
        },
      });
    });

    noteEl.textContent = `${t('rain_daily_note', locale)} · ${nDays} · mock`;
  }

  let currentMode: 'monthly' | 'daily' = 'monthly';

  monthlyBtn.addEventListener('click', () => {
    currentMode = 'monthly';
    monthlyBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
    dailyBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
    drawMonthly();
  });

  dailyBtn.addEventListener('click', () => {
    currentMode = 'daily';
    dailyBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
    monthlyBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
    drawDaily();
  });

  toolbar.querySelector('#rfStation')?.addEventListener('change', () => currentMode === 'monthly' ? drawMonthly() : drawDaily());
  toolbar.querySelector('#rfMonths')?.addEventListener('change', drawMonthly);
  toolbar.querySelector('button')?.addEventListener('click', () => currentMode === 'monthly' ? drawMonthly() : drawDaily());

  drawMonthly();
}

// ==================== WATER LEVEL CHARTS ====================

const MULTI_WL_STATIONS = [
  { id: '18', name: 'Matang Paku', base: 2.34 },
  { id: '34', name: 'Senara', base: 1.60 },
  { id: '42', name: 'Pondok Chegar River', base: 2.15 },
  { id: '42U', name: 'Pondok Chegar U/S', base: 5.15 },
  { id: '42D', name: 'Pondok Chegar D/S', base: 4.98 },
  { id: '60', name: 'Kuala Nerang', base: 13.29 },
  { id: '67', name: 'Padang Sanai', base: 27.00 },
  { id: '68', name: 'Sg.Naka', base: 27.32 },
  { id: '69', name: 'Sungai Bata', base: 6.59 },
  { id: '70', name: 'Sungai Arau', base: 4.81 },
  { id: '73', name: 'Empangan Ahning', base: 97.44 },
  { id: '90', name: 'Pedu Bukit Sena', base: 1.88 },
  { id: '116', name: 'Sg.Bkt.Pinang Pelubang DS', base: 1.50 },
  { id: '117', name: 'Sg.Bkt.Pinang T.Hj.K.Batas', base: 3.03 },
  { id: '118', name: 'Sg.Anak Bkt Jbt.TAR', base: 1.32 },
  { id: '119', name: 'Sg.Tajar PN15', base: 1.06 },
  { id: '120', name: 'Sg.Kedah Lebuh Raya', base: 1.41 },
  { id: '121', name: 'Sg.Kedah Jbt.KTM', base: 0.93 },
  { id: '125', name: 'Tandop Kuala Tunjang', base: 1.88 },
  { id: '134', name: 'Sg.Gurun Kg.Perupok', base: 2.03 },
  { id: '135', name: 'Sg.Sala PAM S3', base: 0.98 },
  { id: '147', name: 'Sg.Pdg.Terap Kg.Kuala Pai', base: 8.11 },
];

const PALETTE = [
  '#4d8dff', '#33c17b', '#f0a63d', '#ef5865', '#22d3ee', '#a78bfa',
  '#f472b6', '#84cc16', '#fb923c', '#38bdf8', '#e879f9', '#facc15',
  '#2dd4bf', '#f87171', '#60a5fa', '#c084fc', '#4ade80', '#fbbf24',
  '#67e8f9', '#fb7185', '#818cf8', '#a3e635',
];

export function renderWlChartPanel(container: HTMLElement): void {
  const locale = getLocale();
  let activeChart: ChartInstance = null;

  const header = document.createElement('div');
  header.style.cssText = 'padding:0 0 10px;';
  header.innerHTML = `<h3 style="margin:0 0 4px;font-size:14px;font-weight:700;">${t('wl_graph', locale)}</h3>
    <p style="font-size:12px;color:#94a3b8;margin:0;">${t('wl_data', locale)}</p>`;
  container.appendChild(header);

  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;';
  const scatterBtn = document.createElement('button');
  scatterBtn.textContent = 'Scatter';
  scatterBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
  const multiBtn = document.createElement('button');
  multiBtn.textContent = t('wl_multiple', locale);
  multiBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
  tabRow.appendChild(scatterBtn);
  tabRow.appendChild(multiBtn);
  container.appendChild(tabRow);

  const toolbar = buildToolbar(container, [
    { id: 'wlDistrict', label: t('ui_district', locale), value: 'all', choices: [{ value: 'all', label: t('ui_all_stations', locale) }, ...getDistricts().map((d) => ({ value: d, label: d }))]},
  ]);

  const chartHost = document.createElement('div');
  chartHost.style.cssText = 'background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;min-height:350px;position:relative;';
  container.appendChild(chartHost);

  const noteEl = document.createElement('div');
  noteEl.style.cssText = 'font-size:11px;color:#64748b;margin-top:8px;';
  container.appendChild(noteEl);

  let currentMode: 'scatter' | 'multi' = 'scatter';

  function drawScatter() {
    if (activeChart) { try { activeChart.destroy(); } catch {} }
    activeChart = null;
    chartHost.innerHTML = '';

    const dist = (toolbar.querySelector('#wlDistrict') as HTMLSelectElement)?.value || 'all';
    const wlStations = getActiveWlStations(dist === 'all' ? null : dist);
    const rnd = seededRand(hashSeed('scatter-' + dist + '-' + wlStations.length));
    const now = Date.now();
    const points = Array.from({ length: 40 }, (_, i) => {
      const rain = +(rnd() * 40).toFixed(1);
      const level = +(1.2 + rain * 0.045 + rnd() * 0.4).toFixed(2);
      const ts = new Date(now - (39 - i) * 30 * 60 * 1000);
      return { x: rain, y: level, ts };
    });

    const canvas = createCanvas(chartHost);
    import('chart.js').then(({ Chart }) => {
      activeChart = new Chart(canvas, {
        type: 'scatter',
        data: { datasets: [{ label: 'Reading', data: points, backgroundColor: CHART_COLORS.scatter }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => items.length ? new Date((items[0].raw as { ts: Date }).ts).toLocaleString() : '',
                label: (item) => {
                  const r = item.raw as { x: number; y: number };
                  return `Rainfall: ${r.x} mm, Water level: ${r.y} m`;
                },
              },
            },
          },
          scales: {
            x: { title: { display: true, text: t('ui_rainfall_mm', locale) || 'Rainfall (mm)' } },
            y: { title: { display: true, text: t('ui_water_level_m', locale) || 'Water level (m)' } },
          },
        },
      });
    });

    const scope = dist === 'all' ? t('ui_all_stations', locale) : dist;
    noteEl.textContent = `${t('wl_scatter_note', locale) || 'Catchment river data'} — ${scope} (${wlStations.length} stations)`;
  }

  function drawMulti() {
    if (activeChart) { try { activeChart.destroy(); } catch {} }
    activeChart = null;
    chartHost.innerHTML = '';

    const nDays = 7;
    const now = Date.now();
    const nPoints = nDays * 24;

    const datasets = MULTI_WL_STATIONS.map((st, idx) => {
      const rnd = seededRand(hashSeed('wl-' + st.id + nDays));
      const color = PALETTE[idx % PALETTE.length];
      const data: (number | null)[] = [];
      for (let i = 0; i < nPoints; i++) {
        const drift = Math.sin(i / 24 * Math.PI * 2) * 0.3;
        const val = +(st.base + drift + (rnd() - 0.5) * 0.4).toFixed(2);
        data.push(val);
      }
      return {
        label: `${st.id} ${st.name}`,
        data,
        borderColor: color,
        backgroundColor: color + '33',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        stationId: st.id,
      };
    });

    const labels = Array.from({ length: nPoints }, (_, i) => {
      const d = new Date(now - (nPoints - 1 - i) * 3600000);
      return d.toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-GB', { day: '2-digit', month: '2-digit' }) + ' ' +
        d.toLocaleTimeString(locale === 'ms' ? 'ms-MY' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    });

    const canvas = createCanvas(chartHost);
    import('chart.js').then(({ Chart }) => {
      activeChart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 18 } },
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
            y: { title: { display: true, text: 'Water Level (m)' } },
          },
        },
      });
    });

    noteEl.textContent = `${t('wl_multiple', locale)} · ${nDays} days · ${MULTI_WL_STATIONS.length} stations`;
  }

  scatterBtn.addEventListener('click', () => {
    currentMode = 'scatter';
    scatterBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
    multiBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
    drawScatter();
  });

  multiBtn.addEventListener('click', () => {
    currentMode = 'multi';
    multiBtn.style.cssText = 'background:#22d3ee;color:#0f172a;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;font-size:12px;';
    scatterBtn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;';
    drawMulti();
  });

  toolbar.querySelector('#wlDistrict')?.addEventListener('change', () => currentMode === 'scatter' ? drawScatter() : drawMulti());
  toolbar.querySelector('button')?.addEventListener('click', () => currentMode === 'scatter' ? drawScatter() : drawMulti());

  drawScatter();
}

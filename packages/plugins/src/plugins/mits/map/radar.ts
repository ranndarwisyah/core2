let radarFrames: string[] = [];
let radarCurrentIndex = 0;
let radarTimer: ReturnType<typeof setInterval> | null = null;
let radarPlaying = false;

interface RainViewerFrame {
  path: string;
  time: number;
}

export async function initRadar(): Promise<string[]> {
  try {
    const resp = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await resp.json();
    const radar = data.radar as { past?: RainViewerFrame[]; nowcast?: RainViewerFrame[] } | undefined;
    const frames: string[] = [];
    if (radar?.past) {
      for (const f of radar.past) {
        frames.push(`https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png`);
      }
    }
    if (radar?.nowcast) {
      for (const f of radar.nowcast) {
        frames.push(`https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png`);
      }
    }
    radarFrames = frames;
    return frames;
  } catch {
    return [];
  }
}

export function getRadarFrames(): string[] {
  return radarFrames;
}

export function getRadarCurrentIndex(): number {
  return radarCurrentIndex;
}

export function getRadarCurrentUrl(): string | null {
  if (radarFrames.length === 0) return null;
  return radarFrames[radarCurrentIndex] ?? null;
}

export function startRadar(onFrame: (url: string, index: number) => void): void {
  if (radarPlaying) return;
  radarPlaying = true;
  radarTimer = setInterval(() => {
    if (radarFrames.length === 0) return;
    radarCurrentIndex = (radarCurrentIndex + 1) % radarFrames.length;
    onFrame(radarFrames[radarCurrentIndex], radarCurrentIndex);
  }, 800);
}

export function stopRadar(): void {
  radarPlaying = false;
  if (radarTimer) {
    clearInterval(radarTimer);
    radarTimer = null;
  }
}

export function isRadarPlaying(): boolean {
  return radarPlaying;
}

export function setRadarFrame(index: number): void {
  if (index >= 0 && index < radarFrames.length) {
    radarCurrentIndex = index;
  }
}

export function getRadarFrameCount(): number {
  return radarFrames.length;
}

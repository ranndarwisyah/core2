export function loadEntityStore<T>(key: string, seed: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[];
    }
  } catch {}
  const clone = JSON.parse(JSON.stringify(seed)) as T[];
  try {
    localStorage.setItem(key, JSON.stringify(clone));
  } catch {}
  return clone;
}

export function saveEntityStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadConfig<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return defaults;
}

export function saveConfig<T>(key: string, config: T): void {
  localStorage.setItem(key, JSON.stringify(config));
}

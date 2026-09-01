import type { MitsSession, MitsUserRole } from './types';
import { STORAGE_KEYS } from './constants';

interface UserRecord {
  password: string;
  role: MitsUserRole;
  displayName: string;
}

const USERS: Record<string, UserRecord> = {
  root: {
    password: 'cd370d8c37a4fa39',
    role: 'superadmin',
    displayName: 'Administrator',
  },
  superadmintester1: {
    password: 'longenough1',
    role: 'user',
    displayName: 'Test User',
  },
};

export function login(username: string, password: string): MitsSession | null {
  const user = USERS[username];
  if (!user || user.password !== password) return null;
  const session: MitsSession = {
    username,
    role: user.role,
    displayName: user.displayName,
  };
  saveSession(session);
  return session;
}

export function getSession(): MitsSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MitsSession;
    if (parsed && parsed.username && parsed.role) return parsed;
  } catch {}
  return null;
}

export function saveSession(session: MitsSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
  } catch {}
}

export function hasPermission(
  session: MitsSession | null,
  action: string,
): boolean {
  if (!session) return action === 'view';
  if (session.role === 'superadmin') return true;
  const userActions = [
    'view',
    'charts',
    'export',
    'rainfall',
    'dam-status',
    'dsg',
    'public-summary',
    'announcements',
    'feedback',
    'quality-system',
    'rotate-view',
    'schematic',
    'rainfall-contour',
    'rid',
  ];
  return userActions.includes(action);
}

export function isSuperAdmin(session: MitsSession | null): boolean {
  return session?.role === 'superadmin';
}

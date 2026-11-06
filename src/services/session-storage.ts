/**
 * Persists the auth session (JWT, role, family code, phone verification).
 * Native platforms use expo-secure-store (encrypted keychain/keystore);
 * the web build falls back to localStorage, which SecureStore doesn't support.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from '@/types/smart-home';

const SESSION_KEY = 'mshome_session';

export async function readSession(): Promise<Session | null> {
  const serialized = Platform.OS === 'web'
    ? globalThis.localStorage?.getItem(SESSION_KEY) ?? null
    : await SecureStore.getItemAsync(SESSION_KEY);
  if (!serialized) return null;
  try {
    const session = JSON.parse(serialized) as Session;
    return session.token && session.role ? session : null;
  } catch {
    await clearSession();
    return null;
  }
}

export async function writeSession(session: Session): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

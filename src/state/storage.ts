import type { StateStorage } from 'zustand/middleware';

// Storage backend selection (defensive):
//   - Try MMKV first — fast, sync, encrypted; lives natively in dev/standalone builds.
//   - On any error (Expo Go can't load the JSI module), fall back to AsyncStorage.
// Both expose the StateStorage shape; zustand persist accepts sync or async values.

export const zustandStorage: StateStorage = pickBackend();

function pickBackend(): StateStorage {
  try {
    const mmkv = createMMKV();
    if (mmkv) return mmkv;
  } catch {
    // MMKV not available — fall through to AsyncStorage.
  }
  return createAsyncBackend();
}

function createMMKV(): StateStorage | null {
  // Dynamic require so the JSI module isn't touched if it's missing.
  const mod = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = new mod.MMKV({ id: 'eleve' });
  // Probe with a write; if the host function throws, we'll catch above.
  mmkv.set('__probe__', '1');
  mmkv.delete('__probe__');
  return {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => mmkv.delete(name),
  };
}

function createAsyncBackend(): StateStorage {
  const AsyncStorage = require('@react-native-async-storage/async-storage')
    .default as typeof import('@react-native-async-storage/async-storage').default;
  return {
    getItem: (name) => AsyncStorage.getItem(name),
    setItem: (name, value) => AsyncStorage.setItem(name, value),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
}

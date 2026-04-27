import Constants from 'expo-constants';
import type { StateStorage } from 'zustand/middleware';

// Storage backend selection:
//   - Dev client / standalone build → react-native-mmkv (sync, fast, encrypted)
//   - Expo Go → AsyncStorage (MMKV's JSI binding isn't included in Go)
// Both are exposed through the same StateStorage shape; zustand's persist
// middleware accepts sync or async values from getItem.

const isExpoGo = Constants.appOwnership === 'expo';

export const zustandStorage: StateStorage = isExpoGo
  ? createAsyncStorageBackend()
  : createMMKVBackend();

function createMMKVBackend(): StateStorage {
  // Dynamic require so Expo Go doesn't try to register the missing native
  // module at module-load time.
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = new MMKV({ id: 'eleve' });
  return {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => mmkv.delete(name),
  };
}

function createAsyncStorageBackend(): StateStorage {
  const AsyncStorage =
    require('@react-native-async-storage/async-storage')
      .default as typeof import('@react-native-async-storage/async-storage').default;
  return {
    getItem: (name) => AsyncStorage.getItem(name),
    setItem: (name, value) => AsyncStorage.setItem(name, value),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
}

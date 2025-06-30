/**
 * Shared Utils Index
 * Central export point for all shared utilities
 */

// Storage utilities
export * from './storage.utils';

// Re-export commonly used functions with shorter names
export {
  getStorageItem as getStorage,
  setStorageItem as setStorage,
  removeStorageItem as removeStorage,
  clearStorage,
  getStorageObject,
  setStorageObject,
  hasStorageItem as hasStorage,
  isLocalStorageAvailable,
  TokenStorage,
  SessionStorage,
} from './storage.utils';

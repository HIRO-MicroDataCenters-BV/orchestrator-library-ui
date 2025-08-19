/**
 * Core Services Index
 * Exports all core services for the application
 */

// Main API service - unified service for all API operations
export { ApiService } from './api.service';

// DEX Authentication service
export { DexAuthService } from './dex-auth.service';
export type { DexAuthState, DexApiRequest, DexAuthResult } from './dex-auth.service';

// Re-export for backward compatibility
export { ApiService as BaseApiService } from './api.service';

// Default export
export { ApiService as default } from './api.service';

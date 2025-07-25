/**
 * Application Constants
 * Contains shared constants used across the entire application
 */

import { environment } from '../../../environments/environment';

// ===================
// API Constants
// ===================

export const API_CONSTANTS = {
  BASE_URL: environment.apiUrl,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const API_PATHS = {
  BASE: '',
  WORKLOAD_ACTIONS: '/workload_action',
  WORKLOAD_DECISIONS: '/workload_request_decision',
  ALERTS: '/alerts',
  KUBERNETES: '/k8s',
  TUNING_PARAMETERS: '/tuning_parameters',
} as const;

// ===================
// HTTP Status Codes
// ===================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ===================
// Storage Keys
// ===================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: environment.tokenKey,
  REFRESH_TOKEN: environment.refreshTokenKey,
  USER_KEY: environment.userKey,
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// ===================
// Route Constants
// ===================

export const ROUTES = {
  HOME: '/',
  COG: '/cog',
  K8S: '/k8s',
  OVERVIEW: '/overview',
  EMDC: {
    BASE: '/emdc',
    ALERTS: '/emdc/alerts',
    WORKLOADS: {
      REQUEST_DECISIONS: '/emdc/workloads/request_decisions',
      ACTIONS: '/emdc/workloads/actions',
    },
  },
  ERROR: {
    NOT_FOUND: '/error/404',
    FORBIDDEN: '/error/403',
    SERVER_ERROR: '/error/500',
  },
} as const;

// ===================
// UI Constants
// ===================

export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 25,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 1000,
  },
  DEBOUNCE_TIME: 300, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
  TOAST_DURATION: 5000, // milliseconds
  DIALOG: {
    WIDTH: '600px',
    MAX_WIDTH: '90vw',
    MAX_HEIGHT: '90vh',
  },
} as const;

// ===================
// Validation Constants
// ===================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-()]+$/,
} as const;

// ===================
// Date and Time Constants
// ===================

export const DATE_TIME = {
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM DD, YYYY',
    DISPLAY_TIME: 'h:mm A',
    DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  },
  REFRESH_INTERVALS: {
    SHORT: 5000, // 5 seconds
    MEDIUM: 30000, // 30 seconds
    LONG: 300000, // 5 minutes
  },
} as const;

// ===================
// Environment Constants
// ===================

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  TEST: 'test',
  CURRENT: environment.production ? 'production' : 'development',
} as const;

// ===================
// External URLs
// ===================

export const EXTERNAL_URLS = {
  DASHBOARD: environment.dashboardUrl,
  COG: environment.cogUrl,
  API: environment.apiUrl,
} as const;

// ===================
// Feature Flags
// ===================

export const FEATURE_FLAGS = {
  ENABLE_DEBUG_MODE: false,
  ENABLE_MOCK_DATA: false,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
} as const;

// ===================
// Resource Constants
// ===================

export const RESOURCE_UNITS = {
  CPU: {
    MILLICORES: 'm',
    CORES: '',
  },
  MEMORY: {
    BYTES: 'B',
    KILOBYTES: 'KB',
    MEGABYTES: 'MB',
    GIGABYTES: 'GB',
    TERABYTES: 'TB',
    KIBIBYTES: 'Ki',
    MEBIBYTES: 'Mi',
    GIBIBYTES: 'Gi',
    TEBIBYTES: 'Ti',
  },
  STORAGE: {
    BYTES: 'B',
    KILOBYTES: 'KB',
    MEGABYTES: 'MB',
    GIGABYTES: 'GB',
    TERABYTES: 'TB',
  },
} as const;

// ===================
// Status Colors
// ===================

export const STATUS_COLORS = {
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  PENDING: '#6b7280',
  ACTIVE: '#10b981',
  INACTIVE: '#6b7280',
} as const;

// ===================
// Table Constants
// ===================

export const TABLE_CONSTANTS = {
  DEFAULT_COLUMNS: {
    ACTIONS: 'actions',
    ID: 'id',
    NAME: 'name',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  COLUMN_WIDTHS: {
    SMALL: '80px',
    MEDIUM: '120px',
    LARGE: '200px',
    EXTRA_LARGE: '300px',
    AUTO: 'auto',
  },
} as const;

// ===================
// Kubernetes Constants
// ===================

export const K8S_CONSTANTS = {
  NAMESPACES: {
    DEFAULT: 'default',
    KUBE_SYSTEM: 'kube-system',
    KUBE_PUBLIC: 'kube-public',
    HIROS: 'hiros',
  },
  RESOURCE_TYPES: {
    POD: 'Pod',
    DEPLOYMENT: 'Deployment',
    SERVICE: 'Service',
    CONFIGMAP: 'ConfigMap',
    SECRET: 'Secret',
    NAMESPACE: 'Namespace',
    NODE: 'Node',
    PERSISTENT_VOLUME: 'PersistentVolume',
    PERSISTENT_VOLUME_CLAIM: 'PersistentVolumeClaim',
  },
  POD_PHASES: {
    PENDING: 'Pending',
    RUNNING: 'Running',
    SUCCEEDED: 'Succeeded',
    FAILED: 'Failed',
    UNKNOWN: 'Unknown',
  },
  DEFAULT_VALUES: {
    NAMESPACE: 'hiros',
    SERVICE_ACCOUNT_NAME: 'readonly-user',
  },
} as const;

// ===================
// Error Messages
// ===================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to view this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

// ===================
// Success Messages
// ===================

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  SAVED: 'Changes saved successfully.',
  COPIED: 'Copied to clipboard.',
  UPLOADED: 'File uploaded successfully.',
  DOWNLOADED: 'File downloaded successfully.',
} as const;

// ===================
// Loading Messages
// ===================

export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  DOWNLOADING: 'Downloading...',
  PROCESSING: 'Processing...',
} as const;

// ===================
// Type Guards
// ===================

export const isProduction = (env: string): boolean =>
  env === ENVIRONMENT.PRODUCTION;
export const isDevelopment = (env: string): boolean =>
  env === ENVIRONMENT.DEVELOPMENT;
export const isStaging = (env: string): boolean => env === ENVIRONMENT.STAGING;
export const isTest = (env: string): boolean => env === ENVIRONMENT.TEST;

/**
 * Shared Models Index
 * Central export point for all shared models and types
 */

// ===================
// API Base Models
// ===================
export * from './api-base.model';

// ===================
// Kubernetes Models
// ===================
export * from './kubernetes.model';

// ===================
// Alerts Models
// ===================
export * from './alerts.model';

// ===================
// Tuning Parameters Models
// ===================
export * from './tuning-parameters.model';

// ===================
// Workload Models
// ===================
export * from './workload-action.model';
export * from './workload-request-decision.model';

// ===================
// Re-export shared types for convenience
// ===================
export type {
  // Base types
  BaseEntity,
  PaginatedResponse,
  FilterParams,
  PaginationParams,
  DateRangeParams,
  LoadingState,
  OperationResult,
  MenuItem,
  TableColumn,
  // Common HTTP types
  HttpMethod,
  ApiResponse,
  ApiError,
  ApiRequestConfig,
} from '../types';

// ===================
// Export enums from types
// ===================
export {
  GenericStatus,
  WorkloadActionType,
  WorkloadActionStatus,
  PodParentType,
} from '../types';

// ===================
// Export utility functions from types
// ===================
export {
  getActionTypeDisplayName,
  getActionStatusDisplayName,
  getPodParentTypeDisplayName,
  isWorkloadActionType,
  isWorkloadActionStatus,
  isPodParentType,
} from '../types';

// ===================
// Legacy aliases for backward compatibility
// ===================
// Alert aliases
export type { Alert, AlertCreate, AlertUpdate } from './alerts.model';

// Kubernetes aliases
export type {
  K8sPod,
  K8sNode,
  K8sPodResponse,
  K8sNodeResponse,
  K8sClusterInfoResponse,
  K8sTokenResponse,
  K8sPodParent,
} from './kubernetes.model';

// Tuning Parameters aliases
export type {
  TuningParameterCreate,
  TuningParameterResponse,
  TuningParameterUpdate,
} from './tuning-parameters.model';

// Workload aliases
export type {
  WorkloadAction,
  WorkloadActionCreate,
  WorkloadActionUpdate,
} from './workload-action.model';

export type {
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
} from './workload-request-decision.model';

// ===================
// Common Query Parameters
// ===================
export interface CommonQueryParams {
  skip?: number;
  limit?: number;
}

export interface DateRangeQueryParams extends CommonQueryParams {
  start_date?: string;
  end_date?: string;
}

// ===================
// Common Response Types
// ===================
export interface ListResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface MessageResponse {
  message: string;
}

export interface IdResponse {
  id: string | number;
}

// ===================
// Error Response Types
// ===================
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ===================
// Utility type guards
// ===================
export const isListResponse = <T>(obj: unknown): obj is ListResponse<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray((obj as ListResponse<T>).items) &&
    typeof (obj as ListResponse<T>).total === 'number' &&
    typeof (obj as ListResponse<T>).skip === 'number' &&
    typeof (obj as ListResponse<T>).limit === 'number'
  );
};

export const isMessageResponse = (obj: unknown): obj is MessageResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as MessageResponse).message === 'string'
  );
};

export const isHTTPValidationError = (
  obj: unknown
): obj is HTTPValidationError => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray((obj as HTTPValidationError).detail)
  );
};

// ===================
// Default exports for convenience
// ===================
export { AlertType } from './alerts.model';
export type {
  AlertCreateRequest,
  AlertResponse,
  AlertQueryParams,
} from './alerts.model';

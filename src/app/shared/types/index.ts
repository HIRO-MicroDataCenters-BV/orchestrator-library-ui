/**
 * Shared Types Index
 * Central export point for all shared types and interfaces
 */

// Common types and interfaces
export * from './common.types';

// API-specific types
export * from './api.types';

// Workload-specific types
export * from './workload.types';

// Alert-specific types
export * from './alert.types';

// Re-export commonly used types with shorter names
export type {
  ApiResponse,
  ApiError,
  BaseEntity,
  PaginatedResponse,
  FilterParams,
  PaginationParams,
  DateRangeParams,
  LoadingState,
  OperationResult,
  MenuItem,
  TableColumn,
  MessageResponse,
  IdResponse,
  ValidationError,
  HTTPValidationError,
} from './common.types';

export type {
  WorkloadAction,
  WorkloadActionCreate,
  WorkloadActionUpdate,
  WorkloadActionQueryParams,
  WorkloadActionListResponse,
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
  WorkloadRequestDecisionQueryParams,
  WorkloadRequestDecisionListResponse,
  WorkloadActionStatistics,
  WorkloadRequestDecisionStatistics,
  ResourceDemandSummary,
  WorkloadTimingCreate,
  WorkloadTimingSchema,
  WorkloadTimingUpdate,
  WorkloadTimingQueryParams,
  WorkloadDecisionActionFlowItem,
  WorkloadDecisionActionFlowQueryParams,
} from './workload.types';

export type {
  Alert,
  AlertCreate,
  AlertUpdate,
  AlertQueryParams,
  AlertListResponse,
  AlertStatistics,
  AlertSummary,
  AlertActionRequest,
  AlertActionResponse,
} from './alert.types';

export type {
  ResourceUsage,
  ClusterInfo,
  ClusterMetrics,
  K8sTokenRequest,
  TuningParameter,
  TuningParameterCreate,
  TuningParameterUpdate,
  TuningParameterQueryParams,
  ClusterInfoQueryParams,
  TuningParameterListResponse,
  TuningParameterResponse,
  HttpRequestOptions,
  HttpResponse,
  PodQueryParams,
  UserPodQueryParams,
  PodParentQueryParams,
  DeletePodParams,
  NodeQueryParams,
  TokenQueryParams,
} from './api.types';

// Re-export enums
export {
  WorkloadActionType,
  WorkloadActionStatus,
  WorkloadDecisionStatus,
  PodParentType,
  WorkloadTimingSchedulerEnum,
} from './workload.types';

export {
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertSource,
  AlertActionType,
} from './alert.types';

export { GenericStatus } from './common.types';

// Re-export utility functions
export {
  getActionTypeDisplayName,
  getActionStatusDisplayName,
  getPodParentTypeDisplayName,
  isWorkloadActionType,
  isWorkloadActionStatus,
  isPodParentType,
} from './workload.types';

export {
  getAlertTypeDisplayName,
  getAlertSeverityDisplayName,
  getAlertStatusDisplayName,
  getAlertSourceDisplayName,
  getAlertSeverityColor,
  getAlertStatusColor,
  isAlertType,
  isAlertSeverity,
  isAlertStatus,
  isAlertSource,
} from './alert.types';

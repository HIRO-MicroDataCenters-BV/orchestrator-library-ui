/**
 * Workload Types and Enums
 * Contains all workload-related types, enums, and interfaces
 */

import { BaseEntity, PaginatedResponse, FilterParams } from './common.types';

// ===================
// Workload Action Types
// ===================

/**
 * Action types enum
 */
export enum WorkloadActionType {
  BIND = 'bind',
  CREATE = 'create',
  DELETE = 'delete',
  MOVE = 'move',
  SWAP_X = 'swap_x',
  SWAP_Y = 'swap_y',
}

/**
 * Action status enum (from OpenAPI spec)
 */
export enum WorkloadActionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

/**
 * Pod parent types enum (from OpenAPI spec)
 */
export enum PodParentType {
  DEPLOYMENT = 'deployment',
  STATEFULSET = 'statefulset',
  REPLICASET = 'replicaset',
  JOB = 'job',
  DAEMONSET = 'daemonset',
  CRONJOB = 'cronjob',
}

// ===================
// Workload Action Interfaces
// ===================

/**
 * Workload Action create request (from OpenAPI spec)
 */
export interface WorkloadActionCreate {
  action_type?: WorkloadActionType; // default: 'bind'
  action_status?: WorkloadActionStatus; // default: 'pending'
  action_start_time?: string | null; // ISO 8601 datetime
  action_end_time?: string | null; // ISO 8601 datetime
  action_reason?: string | null;
  pod_parent_name?: string | null;
  pod_parent_type?: PodParentType | null; // default: 'deployment'
  pod_parent_uid?: string | null; // UUID format
  created_pod_name?: string | null;
  created_pod_namespace?: string | null;
  created_node_name?: string | null;
  deleted_pod_name?: string | null;
  deleted_pod_namespace?: string | null;
  deleted_node_name?: string | null;
  bound_pod_name?: string | null;
  bound_pod_namespace?: string | null;
  bound_node_name?: string | null;
  created_at?: string | null; // ISO 8601 datetime
  updated_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload Action response/schema (from OpenAPI spec)
 */
export interface WorkloadAction {
  id: string; // UUID format
  action_type: WorkloadActionType;
  action_status?: WorkloadActionStatus | null;
  action_start_time?: string | null; // ISO 8601 datetime
  action_end_time?: string | null; // ISO 8601 datetime
  action_reason?: string | null;
  pod_parent_name?: string | null;
  pod_parent_type?: PodParentType | null;
  pod_parent_uid?: string | null; // UUID format
  created_pod_name?: string | null;
  created_pod_namespace?: string | null;
  created_node_name?: string | null;
  deleted_pod_name?: string | null;
  deleted_pod_namespace?: string | null;
  deleted_node_name?: string | null;
  bound_pod_name?: string | null;
  bound_pod_namespace?: string | null;
  bound_node_name?: string | null;
  durationInSeconds?: number | null;
  created_at: string; // ISO 8601 datetime
  updated_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload Action update request
 */
export interface WorkloadActionUpdate {
  action_type?: WorkloadActionType | null;
  action_status?: WorkloadActionStatus | null;
  action_start_time?: string | null;
  action_end_time?: string | null;
  action_reason?: string | null;
  pod_parent_name?: string | null;
  pod_parent_type?: PodParentType | null;
  pod_parent_uid?: string | null;
  created_pod_name?: string | null;
  created_pod_namespace?: string | null;
  created_node_name?: string | null;
  deleted_pod_name?: string | null;
  deleted_pod_namespace?: string | null;
  deleted_node_name?: string | null;
  bound_pod_name?: string | null;
  bound_pod_namespace?: string | null;
  bound_node_name?: string | null;
}

/**
 * Workload Action query parameters
 */
export interface WorkloadActionQueryParams extends FilterParams {
  action_type?: WorkloadActionType;
  action_status?: WorkloadActionStatus;
  pod_parent_type?: PodParentType;
  start_date?: string;
  end_date?: string;
  namespace?: string;
  node_name?: string;
  skip?: number;
  limit?: number;
}

/**
 * Workload Action list response
 */
export interface WorkloadActionListResponse
  extends PaginatedResponse<WorkloadAction> {
  actions: WorkloadAction[];
}

// ===================
// Workload Request Decision Types
// ===================

/**
 * Decision status enum (from OpenAPI spec)
 */
export enum WorkloadDecisionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

/**
 * Workload Request Decision create request (from OpenAPI spec)
 */
export interface WorkloadRequestDecisionCreate {
  is_elastic?: boolean | null;
  queue_name?: string | null;
  demand_cpu?: number | null;
  demand_memory?: number | null;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  pod_id: string; // UUID format
  pod_name: string;
  namespace: string;
  node_id: string; // UUID format
  node_name: string;
  action_type: WorkloadActionType;
  decision_status: WorkloadDecisionStatus;
  pod_parent_id: string; // UUID format
  pod_parent_name: string;
  pod_parent_kind: PodParentType;
  decision_start_time?: string | null; // ISO 8601 datetime
  decision_end_time?: string | null; // ISO 8601 datetime
  created_at?: string | null; // ISO 8601 datetime
  deleted_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload Request Decision schema/response (from OpenAPI spec)
 */
export interface WorkloadRequestDecisionSchema {
  id: string; // UUID format
  is_elastic?: boolean | null;
  queue_name?: string | null;
  demand_cpu?: number | null;
  demand_memory?: number | null;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  pod_id: string; // UUID format
  pod_name: string;
  namespace: string;
  node_id: string; // UUID format
  node_name: string;
  action_type: WorkloadActionType;
  decision_status: WorkloadDecisionStatus;
  pod_parent_id: string; // UUID format
  pod_parent_name: string;
  pod_parent_kind: PodParentType;
  decision_start_time?: string | null; // ISO 8601 datetime
  decision_end_time?: string | null; // ISO 8601 datetime
  created_at?: string | null; // ISO 8601 datetime
  deleted_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload Request Decision update request (from OpenAPI spec)
 */
export interface WorkloadRequestDecisionUpdate {
  is_elastic?: boolean | null;
  queue_name?: string | null;
  demand_cpu?: number | null;
  demand_memory?: number | null;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  pod_name?: string | null;
  namespace?: string | null;
  node_id?: string | null; // UUID format
  node_name?: string | null;
  action_type?: WorkloadActionType | null;
  decision_status?: WorkloadDecisionStatus | null;
  pod_parent_id?: string | null; // UUID format
  pod_parent_name?: string | null;
  pod_parent_kind?: PodParentType | null;
  decision_start_time?: string | null; // ISO 8601 datetime
  decision_end_time?: string | null; // ISO 8601 datetime
  deleted_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload Request Decision query parameters
 */
export interface WorkloadRequestDecisionQueryParams extends FilterParams {
  skip?: number;
  limit?: number;
  pod_name?: string;
  namespace?: string;
  node_id?: string;
  is_elastic?: boolean;
  queue_name?: string;
  decision_status?: string;
  pod_parent_kind?: string;
}

/**
 * Workload Request Decision list response
 */
export interface WorkloadRequestDecisionListResponse
  extends PaginatedResponse<WorkloadRequestDecisionSchema> {
  decisions: WorkloadRequestDecisionSchema[];
}

// ===================
// Statistics and Analytics
// ===================

/**
 * Workload Action statistics
 */
export interface WorkloadActionStatistics {
  total_actions: number;
  actions_by_type: Record<WorkloadActionType, number>;
  actions_by_status: Record<WorkloadActionStatus, number>;
  actions_by_parent_type: Record<PodParentType, number>;
  recent_actions: WorkloadAction[];
  success_rate: number;
  avg_execution_time: number;
}

/**
 * Workload Request Decision statistics
 */
export interface WorkloadRequestDecisionStatistics {
  total_decisions: number;
  elastic_decisions: number;
  non_elastic_decisions: number;
  decisions_by_namespace: Record<string, number>;
  decisions_by_queue: Record<string, number>;
  decisions_by_parent_kind: Record<string, number>;
  avg_cpu_demand: number;
  avg_memory_demand: number;
  recent_decisions: WorkloadRequestDecisionSchema[];
}

/**
 * Resource demand summary
 */
export interface ResourceDemandSummary {
  total_cpu_demand: number;
  total_memory_demand: number;
  total_slack_cpu_demand: number;
  total_slack_memory_demand: number;
  pods_count: number;
  elastic_pods_count: number;
}

/**
 * Action execution summary
 */
export interface ActionExecutionSummary {
  action_id: string;
  action_type: WorkloadActionType;
  status: WorkloadActionStatus;
  start_time?: string;
  end_time?: string;
  duration_ms?: number;
  success: boolean;
  error_message?: string;
  affected_resources: string[];
}

// ===================
// Workload Timing Types
// ===================

/**
 * Workload timing scheduler enum (from OpenAPI spec)
 */
export enum WorkloadTimingSchedulerEnum {
  DEFAULT_SCHEDULER = 'default-scheduler',
  RESOURCE_MANAGEMENT_SERVICE = 'resource-management-service',
}

/**
 * Workload timing create request (from OpenAPI spec)
 */
export interface WorkloadTimingCreate {
  id: string; // UUID format
  pod_name: string;
  namespace: string;
  node_name: string;
  scheduler_type: WorkloadTimingSchedulerEnum;
  pod_uid: string;
  created_timestamp?: string | null; // ISO 8601 datetime
  scheduled_timestamp?: string | null; // ISO 8601 datetime
  ready_timestamp?: string | null; // ISO 8601 datetime
  deleted_timestamp?: string | null; // ISO 8601 datetime
  phase?: string | null;
  reason?: string | null;
  is_completed?: boolean | null; // default: false
  recorded_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload timing schema/response (from OpenAPI spec)
 */
export interface WorkloadTimingSchema {
  id: string; // UUID format
  pod_name: string;
  namespace: string;
  node_name?: string | null;
  scheduler_type?: WorkloadTimingSchedulerEnum | null;
  pod_uid?: string | null;
  created_timestamp?: string | null; // ISO 8601 datetime
  scheduled_timestamp?: string | null; // ISO 8601 datetime
  ready_timestamp?: string | null; // ISO 8601 datetime
  deleted_timestamp?: string | null; // ISO 8601 datetime
  creation_to_scheduled_ms?: number | null;
  scheduled_to_ready_ms?: number | null;
  creation_to_ready_ms?: number | null;
  total_lifecycle_ms?: number | null;
  phase?: string | null;
  reason?: string | null;
  is_completed?: boolean | null; // default: false
  recorded_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload timing update request (from OpenAPI spec)
 */
export interface WorkloadTimingUpdate {
  created_timestamp?: string | null; // ISO 8601 datetime
  scheduled_timestamp?: string | null; // ISO 8601 datetime
  ready_timestamp?: string | null; // ISO 8601 datetime
  deleted_timestamp?: string | null; // ISO 8601 datetime
  phase?: string | null;
  reason?: string | null;
  is_completed?: boolean | null; // default: false
  recorded_at?: string | null; // ISO 8601 datetime
}

/**
 * Workload timing query parameters (from OpenAPI spec)
 */
export interface WorkloadTimingQueryParams {
  pod_name?: string | null;
  namespace?: string | null;
  skip?: number; // default: 0
  limit?: number; // default: 100
  [key: string]: unknown;
}

// ===================
// Workload Decision Action Flow Types
// ===================

/**
 * Workload decision action flow item (from OpenAPI spec)
 */
export interface WorkloadDecisionActionFlowItem {
  decision_id: string; // UUID format
  action_id: string; // UUID format
  action_type: WorkloadActionType;
  is_elastic?: boolean | null;
  queue_name?: string | null;
  demand_cpu?: number | null;
  demand_memory?: number | null;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  created_pod_name?: string | null;
  created_pod_namespace?: string | null;
  created_node_name?: string | null;
  deleted_pod_name?: string | null;
  deleted_pod_namespace?: string | null;
  deleted_node_name?: string | null;
  bound_pod_name?: string | null;
  bound_pod_namespace?: string | null;
  bound_node_name?: string | null;
  decision_pod_name?: string | null;
  decision_namespace?: string | null;
  decision_node_name?: string | null;
  decision_status?: WorkloadDecisionStatus | null;
  action_status?: WorkloadActionStatus | null;
  decision_start_time?: string | null; // ISO 8601 datetime
  decision_end_time?: string | null; // ISO 8601 datetime
  action_start_time?: string | null; // ISO 8601 datetime
  action_end_time?: string | null; // ISO 8601 datetime
  decision_duration?: string | null; // duration format
  action_duration?: string | null; // duration format
  total_duration?: string | null; // duration format
  decision_created_at?: string | null; // ISO 8601 datetime
  decision_deleted_at?: string | null; // ISO 8601 datetime
  action_created_at?: string | null; // ISO 8601 datetime
  action_updated_at?: string | null; // ISO 8601 datetime
  decision_pod_parent_id?: string | null; // UUID format
  decision_pod_parent_name?: string | null;
  decision_pod_parent_kind?: string | null;
  action_pod_parent_name?: string | null;
  action_pod_parent_type?: string | null;
  action_pod_parent_uid?: string | null; // UUID format
  action_reason?: string | null;
}

/**
 * Workload decision action flow query parameters (from OpenAPI spec)
 */
export interface WorkloadDecisionActionFlowQueryParams {
  skip?: number; // default: 0
  limit?: number; // default: 100
  decision_id?: string | null; // UUID format
  action_id?: string | null; // UUID format
  pod_name?: string | null;
  namespace?: string | null;
  node_name?: string | null;
  action_type?: WorkloadActionType | null;
  [key: string]: unknown;
}

// ===================
// Type Guards
// ===================

export const isWorkloadActionType = (
  value: string
): value is WorkloadActionType => {
  return Object.values(WorkloadActionType).includes(
    value as WorkloadActionType
  );
};

export const isWorkloadActionStatus = (
  value: string
): value is WorkloadActionStatus => {
  return Object.values(WorkloadActionStatus).includes(
    value as WorkloadActionStatus
  );
};

export const isPodParentType = (value: string): value is PodParentType => {
  return Object.values(PodParentType).includes(value as PodParentType);
};

// ===================
// Utility Functions
// ===================

export const getActionTypeDisplayName = (
  actionType: WorkloadActionType
): string => {
  const displayNames: Record<WorkloadActionType, string> = {
    [WorkloadActionType.BIND]: 'Bind Pod',
    [WorkloadActionType.CREATE]: 'Create Pod',
    [WorkloadActionType.DELETE]: 'Delete Pod',
    [WorkloadActionType.MOVE]: 'Move Pod',
    [WorkloadActionType.SWAP_X]: 'Swap_X Pod',
    [WorkloadActionType.SWAP_Y]: 'Swap_Y Pod',
  };
  return displayNames[actionType] || actionType;
};

export const getActionStatusDisplayName = (
  status: WorkloadActionStatus
): string => {
  const displayNames: Record<WorkloadActionStatus, string> = {
    [WorkloadActionStatus.PENDING]: 'Pending',
    [WorkloadActionStatus.SUCCEEDED]: 'Succeeded',
    [WorkloadActionStatus.FAILED]: 'Failed',
  };
  return displayNames[status] || status;
};

export const getPodParentTypeDisplayName = (
  parentType: PodParentType
): string => {
  const displayNames: Record<PodParentType, string> = {
    [PodParentType.DEPLOYMENT]: 'Deployment',
    [PodParentType.STATEFULSET]: 'StatefulSet',
    [PodParentType.REPLICASET]: 'ReplicaSet',
    [PodParentType.JOB]: 'Job',
    [PodParentType.DAEMONSET]: 'DaemonSet',
    [PodParentType.CRONJOB]: 'CronJob',
  };
  return displayNames[parentType] || parentType;
};

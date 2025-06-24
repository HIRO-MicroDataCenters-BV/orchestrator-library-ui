// Base response models
export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Alert models
export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface AlertCreateRequest {
  alert_type: AlertType;
  alert_description: string;
  pod_id?: string;
  node_id?: string;
}

export interface AlertResponse {
  id: number;
  alert_type: AlertType;
  alert_description: string;
  pod_id?: string;
  node_id?: string;
  created_at: string;
}

// Workload Request Decision models
export interface WorkloadRequestDecisionCreate {
  pod_id: string;
  pod_name: string;
  namespace: string;
  node_id: string;
  is_elastic: boolean;
  queue_name: string;
  demand_cpu: number;
  demand_memory: number;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  is_decision_status: boolean;
  pod_parent_id: string;
  pod_parent_kind: string;
}

export interface WorkloadRequestDecisionUpdate {
  pod_name?: string | null;
  namespace?: string | null;
  node_id?: string | null;
  is_elastic?: boolean | null;
  queue_name?: string | null;
  demand_cpu?: number | null;
  demand_memory?: number | null;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  is_decision_status?: boolean | null;
  pod_parent_id?: string | null;
  pod_parent_kind?: string | null;
}

export interface WorkloadRequestDecisionSchema {
  id: string;
  pod_id: string;
  pod_name: string;
  namespace: string;
  node_id: string;
  is_elastic: boolean;
  queue_name: string;
  demand_cpu: number;
  demand_memory: number;
  demand_slack_cpu?: number | null;
  demand_slack_memory?: number | null;
  is_decision_status: boolean;
  pod_parent_id: string;
  pod_parent_kind: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Keep old interfaces for backward compatibility
export type PodRequestDecisionCreate = WorkloadRequestDecisionCreate;
export type PodRequestDecisionUpdate = WorkloadRequestDecisionUpdate;
export type PodRequestDecisionSchema = WorkloadRequestDecisionSchema;

// Tuning Parameter models
export interface TuningParameterCreate {
  output_1: number;
  output_2: number;
  output_3: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface TuningParameterResponse {
  output_1: number;
  output_2: number;
  output_3: number;
  alpha: number;
  beta: number;
  gamma: number;
  id: number;
  created_at: string;
}

// Kubernetes models (based on API endpoints)
export interface K8sPodResponse {
  // This would need to be defined based on actual API response
  [key: string]: any;
}

export interface K8sNodeResponse {
  // This would need to be defined based on actual API response
  [key: string]: any;
}

export interface K8sClusterInfoResponse {
  // This would need to be defined based on actual API response
  [key: string]: any;
}

export interface K8sTokenResponse {
  // This would need to be defined based on actual API response
  token: string;
}

// Workload Action models
export enum WorkloadActionType {
  CREATE = 'create',
  DELETE = 'delete',
  SCALE = 'scale',
  MIGRATE = 'migrate',
  UPDATE = 'update',
}

export enum WorkloadActionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PodParentType {
  DEPLOYMENT = 'Deployment',
  STATEFULSET = 'StatefulSet',
  DAEMONSET = 'DaemonSet',
  JOB = 'Job',
  CRONJOB = 'CronJob',
  REPLICASET = 'ReplicaSet',
}

export interface WorkloadActionCreate {
  action_type: WorkloadActionType;
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
  created_at?: string;
  updated_at?: string | null;
}

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
  updated_at?: string | null;
}

export interface WorkloadAction {
  id: string;
  action_type: WorkloadActionType;
  action_status: WorkloadActionStatus | null;
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
  created_at: string;
  updated_at?: string | null;
}

// API Request/Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Query parameters for pagination
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// Date range parameters
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

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

// Pod Request Decision models
export interface PodRequestDecisionCreate {
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

export interface PodRequestDecisionUpdate {
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

export interface PodRequestDecisionSchema {
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

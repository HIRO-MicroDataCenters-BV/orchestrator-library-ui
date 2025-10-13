/**
 * API-specific Types and Interfaces
 * Contains types for all API endpoints and responses
 */

// ===================
// Kubernetes Types
// ===================

/**
 * Resource usage
 */
export interface ResourceUsage {
  cpu: number;
  memory: number;
  storage?: number;
}

// ===================
// Cluster Info Types
// ===================

/**
 * Cluster information
 */
export interface ClusterInfo {
  name: string;
  version: string;
  status: string;
  node_count: number;
  pod_count: number;
  namespace_count: number;
  created_at?: string;
  api_server_url?: string;
  cluster_cidr?: string;
  service_cidr?: string;
  dns_service_ip?: string;
}

/**
 * Cluster metrics
 */
export interface ClusterMetrics {
  total_nodes: number;
  ready_nodes: number;
  total_pods: number;
  running_pods: number;
  cpu_usage_percentage: number;
  memory_usage_percentage: number;
  storage_usage_percentage?: number;
}

// ===================
// Authentication Types
// ===================

/**
 * Kubernetes token request
 */
export interface K8sTokenRequest {
  namespace?: string;
  service_account?: string;
  duration?: number;
}

// ===================
// Tuning Parameters Types
// ===================

/**
 * Tuning parameter (from OpenAPI spec)
 */
export interface TuningParameter {
  id: number;
  output_1: number;
  output_2: number;
  output_3: number;
  alpha: number;
  beta: number;
  gamma: number;
  created_at: string; // ISO 8601 datetime
}

/**
 * Tuning parameter creation request (from OpenAPI spec)
 */
export interface TuningParameterCreate {
  output_1: number;
  output_2: number;
  output_3: number;
  alpha: number;
  beta: number;
  gamma: number;
}

/**
 * Tuning parameter update request
 */
export interface TuningParameterUpdate {
  output_1?: number;
  output_2?: number;
  output_3?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
}

/**
 * Tuning parameter query parameters (from OpenAPI spec)
 */
export interface TuningParameterQueryParams {
  skip?: number;
  limit?: number;
  start_date?: string; // ISO 8601 datetime
  end_date?: string; // ISO 8601 datetime
  [key: string]: unknown;
}

// ===================
// Generic Query Parameters
// ===================

/**
 * Cluster info query parameters (from OpenAPI spec)
 */
export interface ClusterInfoQueryParams {
  advanced?: boolean; // default: false
  [key: string]: unknown;
}

// ===================
// Kubernetes Pod Types
// ===================

/**
 * Kubernetes pod query parameters (from OpenAPI spec)
 */
export interface PodQueryParams {
  namespace?: string;
  name?: string;
  pod_id?: string; // UUID format
  status?: string;
  [key: string]: unknown;
}

/**
 * Kubernetes user pod query parameters (from OpenAPI spec)
 */
export interface UserPodQueryParams {
  namespace?: string;
  name?: string;
  pod_id?: string; // UUID format
  status?: string;
  [key: string]: unknown;
}

/**
 * Pod parent query parameters (from OpenAPI spec)
 */
export interface PodParentQueryParams {
  namespace: string;
  name?: string;
  pod_id?: string; // UUID format
  [key: string]: unknown;
}

/**
 * Delete pod parameters (from OpenAPI spec)
 */
export interface DeletePodParams {
  pod_id: string; // UUID format
  [key: string]: unknown;
}

// ===================
// Kubernetes Node Types
// ===================

/**
 * Kubernetes node query parameters (from OpenAPI spec)
 */
export interface NodeQueryParams {
  name?: string;
  node_id?: string; // UUID format
  status?: string;
  [key: string]: unknown;
}

// ===================
// Kubernetes Token Types
// ===================

/**
 * Kubernetes token query parameters (from OpenAPI spec)
 */
export interface TokenQueryParams {
  namespace?: string; // default: 'hiros'
  service_account_name?: string; // default: 'readonly-user'
  [key: string]: unknown;
}

// ===================
// Response Types
// ===================

/**
 * Tuning parameter list response
 */
export interface TuningParameterListResponse {
  items: TuningParameter[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Tuning parameter response (single item) - alias for compatibility
 */
export type TuningParameterResponse = TuningParameter;

// ===================
// HTTP Request Options
// ===================

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

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
 * Tuning parameter
 */
export interface TuningParameter {
  id: string;
  name: string;
  value: string | number | boolean;
  type: TuningParameterType;
  description?: string;
  category?: string;
  namespace?: string;
  created_at: string;
  updated_at?: string;
  validation_rules?: TuningParameterValidation;
}

/**
 * Tuning parameter creation request
 */
export interface TuningParameterCreate {
  name: string;
  value: string | number | boolean;
  type: TuningParameterType;
  description?: string;
  category?: string;
  namespace?: string;
  validation_rules?: TuningParameterValidation;
}

/**
 * Tuning parameter update request
 */
export interface TuningParameterUpdate {
  value?: string | number | boolean;
  description?: string;
  category?: string;
  validation_rules?: TuningParameterValidation;
}

/**
 * Tuning parameter type
 */
export enum TuningParameterType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

/**
 * Tuning parameter validation rules
 */
export interface TuningParameterValidation {
  min_value?: number;
  max_value?: number;
  allowed_values?: (string | number | boolean)[];
  pattern?: string;
  required?: boolean;
}

/**
 * Tuning parameter query parameters
 */
export interface TuningParameterQueryParams {
  category?: string;
  namespace?: string;
  type?: TuningParameterType;
  name?: string;
  skip?: number;
  limit?: number;
}

// ===================
// Generic Query Parameters
// ===================



/**
 * Cluster info query parameters
 */
export interface ClusterInfoQueryParams {
  include_metrics?: boolean;
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

// ===================
// Utility Functions
// ===================

/**
 * Get tuning parameter type display name
 */
export function getTuningParameterTypeDisplayName(type: TuningParameterType): string {
  const displayNames: Record<TuningParameterType, string> = {
    [TuningParameterType.STRING]: 'String',
    [TuningParameterType.INTEGER]: 'Integer',
    [TuningParameterType.FLOAT]: 'Float',
    [TuningParameterType.BOOLEAN]: 'Boolean',
    [TuningParameterType.JSON]: 'JSON',
  };
  return displayNames[type] || type;
}

/**
 * Check if value is a valid tuning parameter type
 */
export function isTuningParameterType(value: string): value is TuningParameterType {
  return Object.values(TuningParameterType).includes(value as TuningParameterType);
}

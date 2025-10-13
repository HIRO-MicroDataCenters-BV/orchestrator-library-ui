/**
 * Alert Types and Enums
 * Contains all alert-related types, enums, and interfaces
 */

import { BaseEntity, PaginatedResponse, FilterParams } from './common.types';

// ===================
// Alert Types and Enums
// ===================

/**
 * Alert types enum (from OpenAPI spec)
 */
export enum AlertType {
  ABNORMAL = 'Abnormal',
  NETWORK_ATTACK = 'Network-Attack',
  OTHER = 'Other',
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

/**
 * Alert status enum
 */
export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
  ACKNOWLEDGED = 'acknowledged',
}

/**
 * Alert source types
 */
export enum AlertSource {
  PROMETHEUS = 'prometheus',
  KUBERNETES = 'kubernetes',
  SYSTEM = 'system',
  APPLICATION = 'application',
  CUSTOM = 'custom',
}

// ===================
// Alert Interfaces
// ===================

/**
 * Alert create request (from OpenAPI spec)
 */
export interface AlertCreate {
  alert_type: AlertType;
  alert_model: string; // maxLength: 1000, minLength: 1
  alert_description: string; // maxLength: 1000, minLength: 1
  pod_id?: string | null; // UUID format
  node_id?: string | null; // UUID format
  source_ip?: string | null;
  destination_ip?: string | null;
  source_port?: number | null; // 1-65535
  destination_port?: number | null; // 1-65535
  protocol?: string | null; // maxLength: 10, minLength: 1
}

/**
 * Alert response/schema (from OpenAPI spec)
 */
export interface Alert {
  id: number;
  alert_type: AlertType;
  alert_model: string;
  alert_description: string;
  pod_id: string | null; // UUID format
  node_id: string | null; // UUID format
  source_ip?: string | null;
  source_port?: number | null; // 1-65535
  destination_ip?: string | null;
  destination_port?: number | null; // 1-65535
  protocol?: string | null; // maxLength: 10, minLength: 1
  created_at: string; // ISO 8601 datetime
}

/**
 * Alert update request
 */
export interface AlertUpdate {
  alert_type?: AlertType | null;
  alert_severity?: AlertSeverity | null;
  alert_description?: string | null;
  alert_status?: AlertStatus | null;
  alert_source?: AlertSource | null;
  pod_id?: string | null;
  pod_name?: string | null;
  node_id?: string | null;
  node_name?: string | null;
  namespace?: string | null;
  cluster_name?: string | null;
  resource_type?: string | null;
  resource_name?: string | null;
  threshold_value?: number | null;
  current_value?: number | null;
  alert_labels?: Record<string, string> | null;
  alert_annotations?: Record<string, string> | null;
  external_id?: string | null;
  alert_url?: string | null;
  resolved_at?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  resolution_notes?: string | null;
}

/**
 * Alert query parameters
 */
export interface AlertQueryParams extends FilterParams {
  skip?: number;
  limit?: number;
  alert_type?: AlertType;
  alert_severity?: AlertSeverity;
  alert_status?: AlertStatus;
  alert_source?: AlertSource;
  pod_name?: string;
  node_name?: string;
  namespace?: string;
  cluster_name?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Alert list response
 */
export interface AlertListResponse extends PaginatedResponse<Alert> {
  alerts: Alert[];
}

// ===================
// Alert Actions
// ===================

/**
 * Alert action types
 */
export enum AlertActionType {
  ACKNOWLEDGE = 'acknowledge',
  RESOLVE = 'resolve',
  SUPPRESS = 'suppress',
  ESCALATE = 'escalate',
  ASSIGN = 'assign',
  ADD_NOTE = 'add_note',
}

/**
 * Alert action request
 */
export interface AlertActionRequest {
  action_type: AlertActionType;
  performed_by: string;
  notes?: string | null;
  assigned_to?: string | null;
  escalation_level?: number | null;
  suppress_duration?: number | null; // minutes
}

/**
 * Alert action response
 */
export interface AlertActionResponse {
  success: boolean;
  message: string;
  alert_id: string;
  action_type: AlertActionType;
  performed_at: string;
  performed_by: string;
}

// ===================
// Alert Statistics and Analytics
// ===================

/**
 * Alert statistics
 */
export interface AlertStatistics {
  total_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  suppressed_alerts: number;
  alerts_by_type: Record<AlertType, number>;
  alerts_by_severity: Record<AlertSeverity, number>;
  alerts_by_source: Record<AlertSource, number>;
  alerts_by_namespace: Record<string, number>;
  alerts_by_node: Record<string, number>;
  recent_alerts: Alert[];
  avg_resolution_time: number; // in minutes
  escalated_alerts: number;
}

/**
 * Alert trend data
 */
export interface AlertTrendData {
  date: string;
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  resolved_alerts: number;
}

/**
 * Alert summary
 */
export interface AlertSummary {
  alert_counts_by_severity: Record<AlertSeverity, number>;
  alert_counts_by_status: Record<AlertStatus, number>;
  top_alert_types: Array<{
    type: AlertType;
    count: number;
    percentage: number;
  }>;
  most_affected_namespaces: Array<{
    namespace: string;
    count: number;
  }>;
  most_affected_nodes: Array<{
    node: string;
    count: number;
  }>;
}

// ===================
// Alert Rules and Conditions
// ===================

/**
 * Alert rule condition
 */
export interface AlertRuleCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration: string; // e.g., '5m', '1h'
}

/**
 * Alert rule
 */
export interface AlertRule extends BaseEntity {
  name: string;
  description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  conditions: AlertRuleCondition[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  enabled: boolean;
  namespace?: string | null;
  cluster_name?: string | null;
}

// ===================
// Type Guards
// ===================

export const isAlertType = (value: string): value is AlertType => {
  return Object.values(AlertType).includes(value as AlertType);
};

export const isAlertSeverity = (value: string): value is AlertSeverity => {
  return Object.values(AlertSeverity).includes(value as AlertSeverity);
};

export const isAlertStatus = (value: string): value is AlertStatus => {
  return Object.values(AlertStatus).includes(value as AlertStatus);
};

export const isAlertSource = (value: string): value is AlertSource => {
  return Object.values(AlertSource).includes(value as AlertSource);
};

// ===================
// Utility Functions
// ===================

export const getAlertTypeDisplayName = (alertType: AlertType): string => {
  const displayNames: Record<AlertType, string> = {
    [AlertType.ABNORMAL]: 'Abnormal',
    [AlertType.NETWORK_ATTACK]: 'Network Attack',
    [AlertType.OTHER]: 'Other',
  };
  return displayNames[alertType] || alertType;
};

export const getAlertSeverityDisplayName = (
  severity: AlertSeverity
): string => {
  const displayNames: Record<AlertSeverity, string> = {
    [AlertSeverity.CRITICAL]: 'Critical',
    [AlertSeverity.HIGH]: 'High',
    [AlertSeverity.MEDIUM]: 'Medium',
    [AlertSeverity.LOW]: 'Low',
    [AlertSeverity.INFO]: 'Info',
  };
  return displayNames[severity] || severity;
};

export const getAlertStatusDisplayName = (status: AlertStatus): string => {
  const displayNames: Record<AlertStatus, string> = {
    [AlertStatus.ACTIVE]: 'Active',
    [AlertStatus.RESOLVED]: 'Resolved',
    [AlertStatus.SUPPRESSED]: 'Suppressed',
    [AlertStatus.ACKNOWLEDGED]: 'Acknowledged',
  };
  return displayNames[status] || status;
};

export const getAlertSourceDisplayName = (source: AlertSource): string => {
  const displayNames: Record<AlertSource, string> = {
    [AlertSource.PROMETHEUS]: 'Prometheus',
    [AlertSource.KUBERNETES]: 'Kubernetes',
    [AlertSource.SYSTEM]: 'System',
    [AlertSource.APPLICATION]: 'Application',
    [AlertSource.CUSTOM]: 'Custom',
  };
  return displayNames[source] || source;
};

export const getAlertSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    [AlertSeverity.CRITICAL]: '#dc2626', // red-600
    [AlertSeverity.HIGH]: '#ea580c', // orange-600
    [AlertSeverity.MEDIUM]: '#ca8a04', // yellow-600
    [AlertSeverity.LOW]: '#16a34a', // green-600
    [AlertSeverity.INFO]: '#2563eb', // blue-600
  };
  return colors[severity] || '#6b7280'; // gray-500
};

export const getAlertStatusColor = (status: AlertStatus): string => {
  const colors: Record<AlertStatus, string> = {
    [AlertStatus.ACTIVE]: '#dc2626', // red-600
    [AlertStatus.RESOLVED]: '#16a34a', // green-600
    [AlertStatus.SUPPRESSED]: '#6b7280', // gray-500
    [AlertStatus.ACKNOWLEDGED]: '#2563eb', // blue-600
  };
  return colors[status] || '#6b7280'; // gray-500
};

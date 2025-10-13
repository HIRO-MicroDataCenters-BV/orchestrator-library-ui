/**
 * Workload Request Decision API models
 * Based on OpenAPI schema from /workload_request_decision/ endpoints
 * Updated to use shared types from common types
 */

// Import shared types instead of local BaseEntity
import {
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
  WorkloadRequestDecisionQueryParams,
  WorkloadRequestDecisionListResponse,
  WorkloadRequestDecisionStatistics,
  WorkloadDecisionStatus,
  ResourceDemandSummary,
  WorkloadActionType,
  PodParentType,
} from '../types';

// Re-export all types for backward compatibility

export { WorkloadDecisionStatus };

export type {
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
  WorkloadRequestDecisionQueryParams,
  WorkloadRequestDecisionListResponse,
  WorkloadRequestDecisionStatistics,
  ResourceDemandSummary,
};

// Additional utility functions specific to this model
export const createWorkloadRequestDecisionFromResponse = (
  data: Record<string, unknown>
): WorkloadRequestDecisionSchema => {
  return {
    id: data['id'] as string,
    pod_id: data['pod_id'] as string,
    pod_name: data['pod_name'] as string,
    namespace: data['namespace'] as string,
    node_id: data['node_id'] as string,
    node_name: data['node_name'] as string,
    is_elastic: (data['is_elastic'] as boolean) || null,
    queue_name: (data['queue_name'] as string) || null,
    demand_cpu: (data['demand_cpu'] as number) || null,
    demand_memory: (data['demand_memory'] as number) || null,
    demand_slack_cpu: (data['demand_slack_cpu'] as number) || null,
    demand_slack_memory: (data['demand_slack_memory'] as number) || null,
    action_type: data['action_type'] as WorkloadActionType,
    decision_status: data['decision_status'] as WorkloadDecisionStatus,
    pod_parent_id: data['pod_parent_id'] as string,
    pod_parent_name: data['pod_parent_name'] as string,
    pod_parent_kind: data['pod_parent_kind'] as PodParentType,
    decision_start_time: (data['decision_start_time'] as string) || null,
    decision_end_time: (data['decision_end_time'] as string) || null,
    created_at: (data['created_at'] as string) || null,
    deleted_at: (data['deleted_at'] as string) || null,
  };
};

export const validateWorkloadRequestDecisionCreate = (
  data: WorkloadRequestDecisionCreate
): string[] => {
  const errors: string[] = [];

  if (!data.pod_id) {
    errors.push('Pod ID is required');
  }

  if (!data.pod_name) {
    errors.push('Pod name is required');
  }

  if (!data.namespace) {
    errors.push('Namespace is required');
  }

  if (!data.node_id) {
    errors.push('Node ID is required');
  }

  if (!data.node_name) {
    errors.push('Node name is required');
  }

  if (!data.action_type) {
    errors.push('Action type is required');
  }

  if (!data.decision_status) {
    errors.push('Decision status is required');
  }

  if (
    data.demand_cpu !== undefined &&
    data.demand_cpu !== null &&
    data.demand_cpu < 0
  ) {
    errors.push('CPU demand must be non-negative');
  }

  if (
    data.demand_memory !== undefined &&
    data.demand_memory !== null &&
    data.demand_memory < 0
  ) {
    errors.push('Memory demand must be non-negative');
  }

  if (!data.pod_parent_id) {
    errors.push('Pod parent ID is required');
  }

  if (!data.pod_parent_name) {
    errors.push('Pod parent name is required');
  }

  if (!data.pod_parent_kind) {
    errors.push('Pod parent kind is required');
  }

  return errors;
};

export const calculateResourceDemandSummary = (
  decisions: WorkloadRequestDecisionSchema[]
): ResourceDemandSummary => {
  const summary: ResourceDemandSummary = {
    total_cpu_demand: 0,
    total_memory_demand: 0,
    total_slack_cpu_demand: 0,
    total_slack_memory_demand: 0,
    pods_count: decisions.length,
    elastic_pods_count: 0,
  };

  decisions.forEach((decision) => {
    summary.total_cpu_demand += decision.demand_cpu || 0;
    summary.total_memory_demand += decision.demand_memory || 0;
    summary.total_slack_cpu_demand += decision.demand_slack_cpu || 0;
    summary.total_slack_memory_demand += decision.demand_slack_memory || 0;

    if (decision.is_elastic) {
      summary.elastic_pods_count++;
    }
  });

  return summary;
};

export const getWorkloadRequestDecisionDescription = (
  decision: WorkloadRequestDecisionSchema
): string => {
  const elasticText = decision.is_elastic ? 'Elastic' : 'Non-elastic';
  const statusText = decision.decision_status.toString().toUpperCase();

  return `${elasticText} pod ${decision.pod_name} in ${decision.namespace} - ${statusText}`;
};

export const formatResourceDemand = (
  cpu: number,
  memory: number,
  unit: 'short' | 'long' = 'short'
): string => {
  const cpuText = unit === 'short' ? `${cpu}m` : `${cpu} millicores`;
  const memoryMB = Math.round(memory / (1024 * 1024));
  const memoryText = unit === 'short' ? `${memoryMB}Mi` : `${memoryMB} MiB`;

  return `CPU: ${cpuText}, Memory: ${memoryText}`;
};

export const groupDecisionsByNamespace = (
  decisions: WorkloadRequestDecisionSchema[]
): Record<string, WorkloadRequestDecisionSchema[]> => {
  return decisions.reduce((groups, decision) => {
    const namespace = decision.namespace;
    if (!groups[namespace]) {
      groups[namespace] = [];
    }
    groups[namespace].push(decision);
    return groups;
  }, {} as Record<string, WorkloadRequestDecisionSchema[]>);
};

export const groupDecisionsByQueue = (
  decisions: WorkloadRequestDecisionSchema[]
): Record<string, WorkloadRequestDecisionSchema[]> => {
  return decisions.reduce((groups, decision) => {
    const queue = decision.queue_name || 'unknown';
    if (!groups[queue]) {
      groups[queue] = [];
    }
    groups[queue].push(decision);
    return groups;
  }, {} as Record<string, WorkloadRequestDecisionSchema[]>);
};

export const filterElasticDecisions = (
  decisions: WorkloadRequestDecisionSchema[]
): WorkloadRequestDecisionSchema[] => {
  return decisions.filter((decision) => decision.is_elastic);
};

export const filterNonElasticDecisions = (
  decisions: WorkloadRequestDecisionSchema[]
): WorkloadRequestDecisionSchema[] => {
  return decisions.filter((decision) => !decision.is_elastic);
};

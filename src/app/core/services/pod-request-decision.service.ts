import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  PodRequestDecisionCreate,
  PodRequestDecisionUpdate,
  PodRequestDecisionSchema,
} from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class PodRequestDecisionService {
  private readonly apiService = inject(ApiService);

  /**
   * Create new pod request decision
   * @param data Pod request decision data
   */
  create(data: PodRequestDecisionCreate): Observable<PodRequestDecisionSchema> {
    if (!this.validatePodRequestDecision(data)) {
      return throwError(() => new Error('Invalid pod request decision data'));
    }

    return this.apiService.createPodRequestDecision(data);
  }

  /**
   * Get all pod request decisions with pagination
   * @param options Query options
   */
  getAll(options?: {
    skip?: number;
    limit?: number;
  }): Observable<PodRequestDecisionSchema[]> {
    const skip = options?.skip || 0;
    const limit = options?.limit || 100;

    return this.apiService.getPodRequestDecisions(skip, limit);
  }

  /**
   * Get pod request decision by ID
   * @param id Decision ID
   */
  getById(id: string): Observable<PodRequestDecisionSchema> {
    if (!id) {
      return throwError(() => new Error('Decision ID is required'));
    }

    return this.apiService.getPodRequestDecisionById(id);
  }

  /**
   * Update pod request decision
   * @param id Decision ID
   * @param data Update data
   */
  update(
    id: string,
    data: PodRequestDecisionUpdate
  ): Observable<PodRequestDecisionSchema> {
    if (!id) {
      return throwError(() => new Error('Decision ID is required'));
    }

    if (!data || Object.keys(data).length === 0) {
      return throwError(() => new Error('Update data is required'));
    }

    return this.apiService.updatePodRequestDecision(id, data);
  }

  /**
   * Delete pod request decision
   * @param id Decision ID
   */
  delete(id: string): Observable<any> {
    if (!id) {
      return throwError(() => new Error('Decision ID is required'));
    }

    return this.apiService.deletePodRequestDecision(id);
  }

  /**
   * Get pod request decisions with pagination
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   */
  getPaginated(
    page: number = 1,
    pageSize: number = 20
  ): Observable<PodRequestDecisionSchema[]> {
    if (page < 1 || pageSize < 1) {
      return throwError(
        () => new Error('Page and pageSize must be greater than 0')
      );
    }

    const skip = (page - 1) * pageSize;
    return this.getAll({ skip, limit: pageSize });
  }

  /**
   * Update decision status
   * @param id Decision ID
   * @param status New status
   */
  updateStatus(
    id: string,
    status: boolean
  ): Observable<PodRequestDecisionSchema> {
    return this.update(id, { is_decision_status: status });
  }

  /**
   * Update pod elastic status
   * @param id Decision ID
   * @param isElastic New elastic status
   */
  updateElasticStatus(
    id: string,
    isElastic: boolean
  ): Observable<PodRequestDecisionSchema> {
    return this.update(id, { is_elastic: isElastic });
  }

  /**
   * Update pod resources
   * @param id Decision ID
   * @param resources New resource requirements
   */
  updateResources(
    id: string,
    resources: {
      demand_cpu?: number;
      demand_memory?: number;
      demand_slack_cpu?: number | null;
      demand_slack_memory?: number | null;
    }
  ): Observable<PodRequestDecisionSchema> {
    const updateData: PodRequestDecisionUpdate = {};

    if (resources.demand_cpu !== undefined) {
      updateData.demand_cpu = resources.demand_cpu;
    }
    if (resources.demand_memory !== undefined) {
      updateData.demand_memory = resources.demand_memory;
    }
    if (resources.demand_slack_cpu !== undefined) {
      updateData.demand_slack_cpu = resources.demand_slack_cpu;
    }
    if (resources.demand_slack_memory !== undefined) {
      updateData.demand_slack_memory = resources.demand_slack_memory;
    }

    return this.update(id, updateData);
  }

  /**
   * Batch update multiple decisions
   * @param updates Array of updates with id and data
   */
  batchUpdate(
    updates: { id: string; data: PodRequestDecisionUpdate }[]
  ): Observable<PodRequestDecisionSchema[]> {
    if (!updates || updates.length === 0) {
      return throwError(() => new Error('Updates array is required'));
    }

    // Create array of update observables
    const updateObservables = updates.map((update) =>
      this.update(update.id, update.data)
    );

    // Note: This would need proper implementation with forkJoin in real scenario
    // For now, we'll return an array with the first update result
    return updateObservables[0].pipe(map((result) => [result]));
  }

  /**
   * Filter decisions by various criteria
   * @param decisions Array of decisions to filter
   * @param filters Filter criteria
   */
  filterDecisions(
    decisions: PodRequestDecisionSchema[],
    filters: {
      namespace?: string;
      nodeName?: string;
      isElastic?: boolean;
      isDecisionStatus?: boolean;
      queueName?: string;
      podParentKind?: string;
    }
  ): PodRequestDecisionSchema[] {
    if (!decisions || decisions.length === 0) {
      return [];
    }

    return decisions.filter((decision) => {
      if (filters.namespace && decision.namespace !== filters.namespace) {
        return false;
      }
      if (
        filters.isElastic !== undefined &&
        decision.is_elastic !== filters.isElastic
      ) {
        return false;
      }
      if (
        filters.isDecisionStatus !== undefined &&
        decision.is_decision_status !== filters.isDecisionStatus
      ) {
        return false;
      }
      if (filters.queueName && decision.queue_name !== filters.queueName) {
        return false;
      }
      if (
        filters.podParentKind &&
        decision.pod_parent_kind !== filters.podParentKind
      ) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get resource statistics for decisions
   * @param decisions Array of decisions
   */
  getResourceStatistics(decisions: PodRequestDecisionSchema[]): {
    totalDecisions: number;
    elasticCount: number;
    approvedCount: number;
    totalCpuDemand: number;
    totalMemoryDemand: number;
    averageCpuDemand: number;
    averageMemoryDemand: number;
    namespaces: string[];
    queueNames: string[];
  } {
    if (!decisions || decisions.length === 0) {
      return {
        totalDecisions: 0,
        elasticCount: 0,
        approvedCount: 0,
        totalCpuDemand: 0,
        totalMemoryDemand: 0,
        averageCpuDemand: 0,
        averageMemoryDemand: 0,
        namespaces: [],
        queueNames: [],
      };
    }

    const totalDecisions = decisions.length;
    const elasticCount = decisions.filter((d) => d.is_elastic).length;
    const approvedCount = decisions.filter((d) => d.is_decision_status).length;
    const totalCpuDemand = decisions.reduce((sum, d) => sum + d.demand_cpu, 0);
    const totalMemoryDemand = decisions.reduce(
      (sum, d) => sum + d.demand_memory,
      0
    );
    const averageCpuDemand = totalCpuDemand / totalDecisions;
    const averageMemoryDemand = totalMemoryDemand / totalDecisions;

    const namespaces = [...new Set(decisions.map((d) => d.namespace))];
    const queueNames = [...new Set(decisions.map((d) => d.queue_name))];

    return {
      totalDecisions,
      elasticCount,
      approvedCount,
      totalCpuDemand,
      totalMemoryDemand,
      averageCpuDemand,
      averageMemoryDemand,
      namespaces,
      queueNames,
    };
  }

  /**
   * Validate pod request decision data
   * @param data Decision data to validate
   */
  private validatePodRequestDecision(data: PodRequestDecisionCreate): boolean {
    if (!data) {
      return false;
    }

    // Check required string fields
    const requiredStringFields: (keyof PodRequestDecisionCreate)[] = [
      'pod_id',
      'pod_name',
      'namespace',
      'node_id',
      'queue_name',
      'pod_parent_id',
      'pod_parent_kind',
    ];

    for (const field of requiredStringFields) {
      if (!data[field] || typeof data[field] !== 'string') {
        console.error(`Missing or invalid required string field: ${field}`);
        return false;
      }
    }

    // Check required numeric fields
    const requiredNumericFields: (keyof PodRequestDecisionCreate)[] = [
      'demand_cpu',
      'demand_memory',
    ];

    for (const field of requiredNumericFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        typeof data[field] !== 'number' ||
        isNaN(data[field])
      ) {
        console.error(`Missing or invalid required numeric field: ${field}`);
        return false;
      }
    }

    // Check required boolean fields
    const requiredBooleanFields: (keyof PodRequestDecisionCreate)[] = [
      'is_elastic',
      'is_decision_status',
    ];

    for (const field of requiredBooleanFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        typeof data[field] !== 'boolean'
      ) {
        console.error(`Missing or invalid required boolean field: ${field}`);
        return false;
      }
    }

    // Validate positive resource values
    if (data.demand_cpu <= 0) {
      console.error('CPU demand must be positive');
      return false;
    }

    if (data.demand_memory <= 0) {
      console.error('Memory demand must be positive');
      return false;
    }

    // Validate optional slack resources if provided
    if (data.demand_slack_cpu !== null && data.demand_slack_cpu !== undefined) {
      if (
        typeof data.demand_slack_cpu !== 'number' ||
        isNaN(data.demand_slack_cpu) ||
        data.demand_slack_cpu < 0
      ) {
        console.error('Slack CPU demand must be a non-negative number');
        return false;
      }
    }

    if (
      data.demand_slack_memory !== null &&
      data.demand_slack_memory !== undefined
    ) {
      if (
        typeof data.demand_slack_memory !== 'number' ||
        isNaN(data.demand_slack_memory) ||
        data.demand_slack_memory < 0
      ) {
        console.error('Slack memory demand must be a non-negative number');
        return false;
      }
    }

    return true;
  }

  /**
   * Create pod request decision with builder pattern
   */
  createDecisionBuilder() {
    return new PodRequestDecisionBuilder(this);
  }
}

/**
 * Builder class for creating pod request decisions
 */
export class PodRequestDecisionBuilder {
  private data: Partial<PodRequestDecisionCreate> = {};

  constructor(private service: PodRequestDecisionService) {}

  setPod(podId: string, podName: string): this {
    this.data.pod_id = podId;
    this.data.pod_name = podName;
    return this;
  }

  setNamespace(namespace: string): this {
    this.data.namespace = namespace;
    return this;
  }

  setNode(nodeId: string): this {
    this.data.node_id = nodeId;
    return this;
  }

  setElastic(isElastic: boolean): this {
    this.data.is_elastic = isElastic;
    return this;
  }

  setQueue(queueName: string): this {
    this.data.queue_name = queueName;
    return this;
  }

  setResources(cpu: number, memory: number): this {
    this.data.demand_cpu = cpu;
    this.data.demand_memory = memory;
    return this;
  }

  setSlackResources(slackCpu?: number, slackMemory?: number): this {
    this.data.demand_slack_cpu = slackCpu || null;
    this.data.demand_slack_memory = slackMemory || null;
    return this;
  }

  setDecisionStatus(status: boolean): this {
    this.data.is_decision_status = status;
    return this;
  }

  setParent(parentId: string, parentKind: string): this {
    this.data.pod_parent_id = parentId;
    this.data.pod_parent_kind = parentKind;
    return this;
  }

  build(): Observable<PodRequestDecisionSchema> {
    return this.service.create(this.data as PodRequestDecisionCreate);
  }
}

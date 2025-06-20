import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AlertCreateRequest, AlertResponse, AlertType } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private readonly apiService = inject(ApiService);

  /**
   * Create new alert
   * @param data Alert data
   */
  create(data: AlertCreateRequest): Observable<AlertResponse> {
    if (!this.validateAlert(data)) {
      return throwError(() => new Error('Invalid alert data'));
    }

    return this.apiService.createAlert(data);
  }

  /**
   * Get all alerts with pagination
   * @param options Query options
   */
  getAll(options?: {
    skip?: number;
    limit?: number;
  }): Observable<AlertResponse[]> {
    const skip = options?.skip || 0;
    const limit = options?.limit || 100;

    return this.apiService.getAlerts(skip, limit);
  }

  /**
   * Get alerts with pagination
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   */
  getPaginated(page: number = 1, pageSize: number = 20): Observable<AlertResponse[]> {
    if (page < 1 || pageSize < 1) {
      return throwError(() => new Error('Page and pageSize must be greater than 0'));
    }

    const skip = (page - 1) * pageSize;
    return this.getAll({ skip, limit: pageSize });
  }

  /**
   * Create error alert
   * @param description Alert description
   * @param podId Optional pod ID
   * @param nodeId Optional node ID
   */
  createError(description: string, podId?: string, nodeId?: string): Observable<AlertResponse> {
    return this.create({
      alert_type: AlertType.ERROR,
      alert_description: description,
      pod_id: podId,
      node_id: nodeId
    });
  }

  /**
   * Create warning alert
   * @param description Alert description
   * @param podId Optional pod ID
   * @param nodeId Optional node ID
   */
  createWarning(description: string, podId?: string, nodeId?: string): Observable<AlertResponse> {
    return this.create({
      alert_type: AlertType.WARNING,
      alert_description: description,
      pod_id: podId,
      node_id: nodeId
    });
  }

  /**
   * Create info alert
   * @param description Alert description
   * @param podId Optional pod ID
   * @param nodeId Optional node ID
   */
  createInfo(description: string, podId?: string, nodeId?: string): Observable<AlertResponse> {
    return this.create({
      alert_type: AlertType.INFO,
      alert_description: description,
      pod_id: podId,
      node_id: nodeId
    });
  }

  /**
   * Create pod-related alert
   * @param type Alert type
   * @param description Alert description
   * @param podId Pod ID
   */
  createPodAlert(type: AlertType, description: string, podId: string): Observable<AlertResponse> {
    return this.create({
      alert_type: type,
      alert_description: description,
      pod_id: podId
    });
  }

  /**
   * Create node-related alert
   * @param type Alert type
   * @param description Alert description
   * @param nodeId Node ID
   */
  createNodeAlert(type: AlertType, description: string, nodeId: string): Observable<AlertResponse> {
    return this.create({
      alert_type: type,
      alert_description: description,
      node_id: nodeId
    });
  }

  /**
   * Filter alerts by type
   * @param alerts Array of alerts to filter
   * @param type Alert type to filter by
   */
  filterByType(alerts: AlertResponse[], type: AlertType): AlertResponse[] {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    return alerts.filter(alert => alert.alert_type === type);
  }

  /**
   * Filter alerts by pod ID
   * @param alerts Array of alerts to filter
   * @param podId Pod ID to filter by
   */
  filterByPodId(alerts: AlertResponse[], podId: string): AlertResponse[] {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    return alerts.filter(alert => alert.pod_id === podId);
  }

  /**
   * Filter alerts by node ID
   * @param alerts Array of alerts to filter
   * @param nodeId Node ID to filter by
   */
  filterByNodeId(alerts: AlertResponse[], nodeId: string): AlertResponse[] {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    return alerts.filter(alert => alert.node_id === nodeId);
  }

  /**
   * Filter alerts by date range
   * @param alerts Array of alerts to filter
   * @param startDate Start date
   * @param endDate End date
   */
  filterByDateRange(alerts: AlertResponse[], startDate: Date, endDate: Date): AlertResponse[] {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    return alerts.filter(alert => {
      const alertDate = new Date(alert.created_at);
      return alertDate >= startDate && alertDate <= endDate;
    });
  }

  /**
   * Get alert statistics
   * @param alerts Array of alerts
   */
  getStatistics(alerts: AlertResponse[]): {
    total: number;
    byType: {
      error: number;
      warning: number;
      info: number;
    };
    withPodId: number;
    withNodeId: number;
    latest: AlertResponse | null;
    oldest: AlertResponse | null;
  } {
    if (!alerts || alerts.length === 0) {
      return {
        total: 0,
        byType: { error: 0, warning: 0, info: 0 },
        withPodId: 0,
        withNodeId: 0,
        latest: null,
        oldest: null
      };
    }

    const total = alerts.length;

    const byType = {
      error: alerts.filter(a => a.alert_type === AlertType.ERROR).length,
      warning: alerts.filter(a => a.alert_type === AlertType.WARNING).length,
      info: alerts.filter(a => a.alert_type === AlertType.INFO).length
    };

    const withPodId = alerts.filter(a => a.pod_id).length;
    const withNodeId = alerts.filter(a => a.node_id).length;

    // Sort by created_at to find latest and oldest
    const sortedAlerts = [...alerts].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const latest = sortedAlerts[0] || null;
    const oldest = sortedAlerts[sortedAlerts.length - 1] || null;

    return {
      total,
      byType,
      withPodId,
      withNodeId,
      latest,
      oldest
    };
  }

  /**
   * Group alerts by type
   * @param alerts Array of alerts
   */
  groupByType(alerts: AlertResponse[]): {
    [key in AlertType]: AlertResponse[];
  } {
    if (!alerts || alerts.length === 0) {
      return {
        [AlertType.ERROR]: [],
        [AlertType.WARNING]: [],
        [AlertType.INFO]: []
      };
    }

    return alerts.reduce((groups, alert) => {
      if (!groups[alert.alert_type]) {
        groups[alert.alert_type] = [];
      }
      groups[alert.alert_type].push(alert);
      return groups;
    }, {} as { [key in AlertType]: AlertResponse[] });
  }

  /**
   * Get recent alerts (last N hours)
   * @param alerts Array of alerts
   * @param hours Number of hours to look back
   */
  getRecentAlerts(alerts: AlertResponse[], hours: number = 24): AlertResponse[] {
    if (!alerts || alerts.length === 0 || hours <= 0) {
      return [];
    }

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return alerts.filter(alert => {
      const alertDate = new Date(alert.created_at);
      return alertDate >= cutoffTime;
    });
  }

  /**
   * Validate alert data
   * @param data Alert data to validate
   */
  private validateAlert(data: AlertCreateRequest): boolean {
    if (!data) {
      console.error('Alert data is required');
      return false;
    }

    // Check required alert_type
    if (!data.alert_type || !Object.values(AlertType).includes(data.alert_type)) {
      console.error('Valid alert_type is required');
      return false;
    }

    // Check required alert_description
    if (!data.alert_description || typeof data.alert_description !== 'string') {
      console.error('Alert description is required and must be a string');
      return false;
    }

    // Check description length constraints (based on OpenAPI: minLength: 1, maxLength: not specified but reasonable)
    if (data.alert_description.trim().length === 0) {
      console.error('Alert description cannot be empty');
      return false;
    }

    if (data.alert_description.length > 1000) { // Reasonable max length
      console.error('Alert description is too long (max 1000 characters)');
      return false;
    }

    // Validate optional pod_id if provided
    if (data.pod_id !== undefined && data.pod_id !== null) {
      if (typeof data.pod_id !== 'string' || data.pod_id.trim().length === 0) {
        console.error('Pod ID must be a non-empty string if provided');
        return false;
      }
    }

    // Validate optional node_id if provided
    if (data.node_id !== undefined && data.node_id !== null) {
      if (typeof data.node_id !== 'string' || data.node_id.trim().length === 0) {
        console.error('Node ID must be a non-empty string if provided');
        return false;
      }
    }

    return true;
  }

  /**
   * Create alert builder for complex alert creation
   */
  createAlertBuilder(): AlertBuilder {
    return new AlertBuilder(this);
  }
}

/**
 * Builder class for creating alerts
 */
export class AlertBuilder {
  private data: Partial<AlertCreateRequest> = {};

  constructor(private service: AlertsService) {}

  setType(type: AlertType): this {
    this.data.alert_type = type;
    return this;
  }

  setDescription(description: string): this {
    this.data.alert_description = description;
    return this;
  }

  setPodId(podId: string): this {
    this.data.pod_id = podId;
    return this;
  }

  setNodeId(nodeId: string): this {
    this.data.node_id = nodeId;
    return this;
  }

  forError(): this {
    return this.setType(AlertType.ERROR);
  }

  forWarning(): this {
    return this.setType(AlertType.WARNING);
  }

  forInfo(): this {
    return this.setType(AlertType.INFO);
  }

  build(): Observable<AlertResponse> {
    return this.service.create(this.data as AlertCreateRequest);
  }
}

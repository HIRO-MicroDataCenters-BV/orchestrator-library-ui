import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import actionsData from './data/actions.json';
import alertsData from './data/alerts.json';
import requestDecisionsData from './data/request-decisions.json';

@Injectable({
  providedIn: 'root'
})
export class EmdcMockService {

  getWorkloadActions(): Observable<unknown[]> {
    const processedActions = actionsData.map((action: any) => ({
      ...action,
      id_uid: action.id,
      duration: this.calculateDuration(action.action_start_time, action.action_end_time)
    }));

    return of(processedActions).pipe(delay(300));
  }

  getActionById(id: string): Observable<unknown | null> {
    const action = actionsData.find((a: any) => a.id === id);
    const processedAction = action ? {
      ...action,
      id_uid: action.id,
      duration: this.calculateDuration(action.action_start_time, action.action_end_time)
    } : null;

    return of(processedAction).pipe(delay(200));
  }

  getAlerts(): Observable<unknown[]> {
    return of(alertsData).pipe(delay(300));
  }

  getAlertById(id: string): Observable<unknown | null> {
    const alert = alertsData.find((a: any) => a.id === id);
    return of(alert || null).pipe(delay(200));
  }

  getRequestDecisions(): Observable<unknown[]> {
    const processedDecisions = requestDecisionsData.map((decision: any) => ({
      ...decision,
      id_uid: decision.id,
      cpu_memory: `${decision.demand_cpu}m / ${decision.demand_memory}Mi`
    }));

    return of(processedDecisions).pipe(delay(300));
  }

  getRequestDecisionById(id: string): Observable<unknown | null> {
    const decision = requestDecisionsData.find((d: any) => d.id === id);
    const processedDecision = decision ? {
      ...decision,
      id_uid: decision.id,
      cpu_memory: `${decision.demand_cpu}m / ${decision.demand_memory}Mi`
    } : null;

    return of(processedDecision).pipe(delay(200));
  }

  getClusters(): Observable<unknown[]> {
    // Mock cluster data since clusters.json doesn't exist
    const mockClusters = [
      { id: '1', name: 'cluster-1', status: 'healthy' },
      { id: '2', name: 'cluster-2', status: 'warning' }
    ];
    return of(mockClusters).pipe(delay(300));
  }

  getClusterById(id: string): Observable<unknown | null> {
    const mockClusters = [
      { id: '1', name: 'cluster-1', status: 'healthy' },
      { id: '2', name: 'cluster-2', status: 'warning' }
    ];
    const cluster = mockClusters.find(c => c.id === id);
    return of(cluster || null).pipe(delay(200));
  }

  getActionsByStatus(status: string): Observable<unknown[]> {
    const filtered = actionsData
      .filter((action: any) => action.action_status === status)
      .map((action: any) => ({
        ...action,
        id_uid: action.id,
        duration: this.calculateDuration(action.action_start_time, action.action_end_time)
      }));

    return of(filtered).pipe(delay(300));
  }

  getAlertsByType(type: string): Observable<unknown[]> {
    const filtered = alertsData.filter((alert: any) => alert.alert_type === type);
    return of(filtered).pipe(delay(300));
  }

  getClustersByStatus(status: string): Observable<unknown[]> {
    const mockClusters = [
      { id: '1', name: 'cluster-1', status: 'healthy' },
      { id: '2', name: 'cluster-2', status: 'warning' }
    ];
    const filtered = mockClusters.filter(cluster => cluster.status === status);
    return of(filtered).pipe(delay(300));
  }

  private calculateDuration(startTime: string, endTime: string | null): string {
    if (!endTime) {
      return 'In progress';
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

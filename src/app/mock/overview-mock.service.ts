import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import overviewData from './data/overview-metrics.json';

@Injectable({
  providedIn: 'root'
})
export class OverviewMockService {

  getClusterInfo(): Observable<unknown> {
    return of(overviewData.cluster_info).pipe(delay(300));
  }

  getAlerts(params?: { limit?: number }): Observable<unknown[]> {
    const alerts = overviewData.recent_alerts;
    const limit = params?.limit || alerts.length;
    return of(alerts.slice(0, limit)).pipe(delay(300));
  }

  getWorkloadDecisions(params?: { limit?: number }): Observable<unknown[]> {
    const decisions = overviewData.recent_workload_decisions;
    const limit = params?.limit || decisions.length;
    return of(decisions.slice(0, limit)).pipe(delay(300));
  }

  getWorkloadActions(params?: { limit?: number }): Observable<unknown[]> {
    const models = overviewData.recent_served_models;
    const limit = params?.limit || models.length;
    return of(models.slice(0, limit)).pipe(delay(300));
  }

  getOverviewStats(): Observable<{
    totalNodes: number;
    readyNodes: number;
    totalPods: number;
    runningPods: number;
    cpuUsage: number;
    memoryUsage: number;
    activeAlerts: number;
    pendingDecisions: number;
  }> {
    const stats = {
      totalNodes: overviewData.cluster_info.nodes.total,
      readyNodes: overviewData.cluster_info.nodes.ready,
      totalPods: overviewData.cluster_info.pods.total,
      runningPods: overviewData.cluster_info.pods.running,
      cpuUsage: overviewData.cluster_info.cpu.usage_percent,
      memoryUsage: overviewData.cluster_info.memory.usage_percent,
      activeAlerts: overviewData.recent_alerts.filter(a => a.status === 'active').length,
      pendingDecisions: overviewData.recent_workload_decisions.filter(d => d.decision_status === 'pending').length
    };

    return of(stats).pipe(delay(200));
  }

  getClusterHealth(): Observable<{
    overall: string;
    components: { name: string; status: string; }[];
  }> {
    const health = {
      overall: 'healthy',
      components: [
        { name: 'API Server', status: 'healthy' },
        { name: 'Controller Manager', status: 'healthy' },
        { name: 'Scheduler', status: 'healthy' },
        { name: 'etcd', status: 'healthy' },
        { name: 'kubelet', status: 'warning' }
      ]
    };

    return of(health).pipe(delay(250));
  }
}

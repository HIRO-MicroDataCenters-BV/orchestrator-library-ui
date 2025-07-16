import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideServer, lucideLayers } from '@ng-icons/lucide';
import { DashboardCardModel } from '../../shared/models/dashboard-card.model';
import { AppTableComponent } from '../app-table/app-table.component';
import { AppSpeedometerComponent } from '../app-speedometer/app-speedometer.component';
import { Observable, Subscription } from 'rxjs';
import {
  K8sClusterInfoResponse,
  K8sNode,
  K8sPod,
} from '../../shared/models/kubernetes.model';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import {
  LoadingOverlayComponent,
  ErrorOverlayComponent,
} from '../../shared/components';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AppTableComponent,
    AppSpeedometerComponent,
    TranslocoModule,
    NgIcon,
    LoadingOverlayComponent,
    ErrorOverlayComponent,
  ],
  providers: [provideIcons({ lucideServer, lucideLayers })],
  templateUrl: './app-dashboard-card.component.html',
  styleUrls: ['./app-dashboard-card.component.scss'],
})
export class AppDashboardCardComponent implements OnInit, OnDestroy {
  @Input() data!: DashboardCardModel;

  private subscription = new Subscription();
  clusterInfo: K8sClusterInfoResponse | null = null;
  nodes: K8sNode[] = [];
  pods: K8sPod[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCardData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCardData(): void {
    if (!this.data.dataSource) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    if (this.data.type === 'metrics' && this.data.key === 'cluster') {
      this.loadClusterMetrics();
    } else if (this.data.type === 'table') {
      this.loadTableData();
    }
  }

  private loadClusterMetrics(): void {
    this.subscription.add(
      (this.data.dataSource as Observable<K8sClusterInfoResponse>).subscribe({
        next: (clusterInfo) => {
          console.log('Dashboard metrics loaded:', clusterInfo);
          this.clusterInfo = clusterInfo;
          this.nodes = Array.isArray(clusterInfo.nodes)
            ? clusterInfo.nodes
            : [];
          this.pods = Array.isArray(clusterInfo.pods) ? clusterInfo.pods : [];
          this.isLoading = false;
          this.hasError = false;

          console.log('Parsed data:', {
            nodes: this.nodes.length,
            pods: this.pods.length,
            cpuUtilization: clusterInfo.cluster_cpu_utilization,
            memoryUtilization: clusterInfo.cluster_memory_utilization,
          });
        },
        error: (error) => {
          this.clusterInfo = null;
          this.nodes = [];
          this.pods = [];
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'error.failed_to_load';
          console.error('Dashboard metrics error:', error);
        },
      })
    );
  }

  private loadTableData(): void {
    this.subscription.add(
      (this.data.dataSource as Observable<unknown[]>).subscribe({
        next: (data) => {
          console.log(
            `Dashboard table data loaded for ${this.data.key}:`,
            data
          );
          this.isLoading = false;
          this.hasError = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'error.failed_to_load';
          console.error(`Dashboard table error for ${this.data.key}:`, error);
        },
      })
    );
  }

  getSpeedometerConfig(type: 'cpu' | 'memory') {
    const configs = {
      cpu: {
        value: this.getMetricValue('cpu'),
        lowThreshold: 30,
        highThreshold: 60,
      },
      memory: {
        value: this.getMetricValue('memory'),
        lowThreshold: 40,
        highThreshold: 70,
      },
    };

    return {
      ...configs[type],
      min: 0,
      max: 100,
      unit: '%',
      size: 140,
      showLabels: false,
      animate: true,
    };
  }

  getCpuSpeedometerConfig() {
    return this.getSpeedometerConfig('cpu');
  }

  getMemorySpeedometerConfig() {
    return this.getSpeedometerConfig('memory');
  }

  getNodesReady(): number {
    return this.nodes.filter((node) => node.status === 'Ready').length;
  }

  getTotalNodes(): number {
    return this.nodes.length;
  }

  getPodsRunning(): number {
    return this.pods.filter((pod) => pod.phase === 'Running').length;
  }

  getTotalPods(): number {
    return this.pods.length;
  }

  getPodsFailed(): number {
    return this.pods.filter(
      (pod) =>
        pod.phase === 'Failed' ||
        pod.phase === 'Pending' ||
        pod.phase === 'Unknown'
    ).length;
  }

  areNodesHealthy(): boolean {
    const ready = this.getNodesReady();
    const total = this.getTotalNodes();
    return ready === total && total > 0;
  }

  arePodsHealthy(): boolean {
    const failed = this.getPodsFailed();
    const total = this.getTotalPods();
    const running = this.getPodsRunning();

    if (total === 0) {
      return false;
    }

    if (failed > 0) {
      return false;
    }

    const healthyRatio = running / total;
    return healthyRatio >= 0.8;
  }

  getMetricValue(type: 'cpu' | 'memory'): number {
    if (!this.clusterInfo || this.isLoading || this.hasError) {
      console.log('No cluster info available for metric:', type);
      return 0;
    }

    const value =
      type === 'cpu'
        ? this.clusterInfo.cluster_cpu_utilization || 0
        : this.clusterInfo.cluster_memory_utilization || 0;

    const rounded = Math.round(value);
    console.log(`${type} utilization:`, value, '-> rounded:', rounded);

    return rounded;
  }

  getCpuUsage(): number {
    return this.getMetricValue('cpu');
  }

  getMemoryUsage(): number {
    return this.getMetricValue('memory');
  }

  getTableColumns(): string[] {
    return ['dashboard_status', 'dashboard_info', 'dashboard_date'];
  }

  getTableActions(): string[] {
    return [];
  }

  getTableTabs(): string[] {
    return [];
  }

  getTablePageSize(): number {
    // Return larger page size for dashboard cards to show all available data
    return 50;
  }

  getDataSource(): Observable<unknown[]> | null {
    return this.data.dataSource as Observable<unknown[]> | null;
  }

  isMetricsLoading(): boolean {
    return this.isLoading;
  }

  hasMetricsError(): boolean {
    return this.hasError;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  retryLoad(): void {
    this.loadCardData();
  }
}

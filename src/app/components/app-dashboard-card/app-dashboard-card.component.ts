import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideServer, lucideLayers } from '@ng-icons/lucide';
import { DashboardCardModel } from '../../shared/models/dashboard-card.model';
import { AppTableComponent } from '../app-table/app-table.component';
import { AppSpeedometerComponent } from '../app-speedometer/app-speedometer.component';
import { Observable, Subscription, forkJoin } from 'rxjs';
import {
  K8sClusterInfoResponse,
  K8sNodeResponse,
  K8sPodResponse,
  K8sNode,
  K8sPod,
} from '../../shared/models/kubernetes.model';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';

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
  ],
  providers: [provideIcons({ lucideServer, lucideLayers })],
  templateUrl: './app-dashboard-card.component.html',
  styleUrls: ['./app-dashboard-card.component.scss'],
})
export class AppDashboardCardComponent implements OnInit, OnDestroy {
  @Input() data!: DashboardCardModel;

  private subscription = new Subscription();
  clusterInfo: any = null;
  nodes: K8sNode[] = [];
  pods: K8sPod[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.data.type === 'metrics' && this.data.key === 'cluster') {
      this.loadClusterMetrics();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadClusterMetrics(): void {
    this.subscription.add(
      forkJoin({
        clusterInfo: this.apiService.getClusterInfo({ advanced: true }),
        nodes: this.apiService.listNodes(),
        pods: this.apiService.listPods(),
      }).subscribe({
        next: ({ clusterInfo, nodes, pods }) => {
          this.clusterInfo = clusterInfo;
          this.nodes = Array.isArray(nodes) ? nodes : nodes.nodes || [];
          this.pods = Array.isArray(pods) ? pods : pods.pods || [];
        },
        error: () => {
          this.clusterInfo = null;
          this.nodes = [];
          this.pods = [];
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
    if (this.nodes.length > 0) {
      return this.nodes.filter((node) => node.status === 'Ready').length;
    }
    return (
      this.clusterInfo?.nodes?.filter((node: any) => node.status === 'Ready')
        .length || 0
    );
  }

  getTotalNodes(): number {
    if (this.nodes.length > 0) {
      return this.nodes.length;
    }
    return this.clusterInfo?.nodes?.length || 0;
  }

  getPodsRunning(): number {
    if (this.pods.length > 0) {
      return this.pods.filter((pod) => pod.status === 'Running').length;
    }
    return (
      this.clusterInfo?.pods?.filter((pod: any) => pod.phase === 'Running')
        .length || 0
    );
  }

  getTotalPods(): number {
    if (this.pods.length > 0) {
      return this.pods.length;
    }
    return this.clusterInfo?.pods?.length || 0;
  }

  getPodsFailed(): number {
    if (this.pods.length > 0) {
      return this.pods.filter(
        (pod) =>
          pod.status === 'Failed' ||
          pod.status === 'Error' ||
          pod.status === 'CrashLoopBackOff' ||
          pod.status === 'Pending' ||
          pod.status === 'Unknown' ||
          pod.status === 'Terminating'
      ).length;
    }
    const clusterPods = this.clusterInfo?.pods || [];
    return clusterPods.filter(
      (pod: any) =>
        pod.phase === 'Failed' ||
        pod.phase === 'Error' ||
        pod.phase === 'CrashLoopBackOff' ||
        pod.phase === 'Pending' ||
        pod.phase === 'Unknown' ||
        pod.phase === 'Terminating'
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
    if (!this.clusterInfo) {
      return 0;
    }

    if (type === 'cpu') {
      return Math.round(this.clusterInfo.cluster_cpu_utilization || 0);
    } else {
      return Math.round(this.clusterInfo.cluster_memory_utilization || 0);
    }
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

  getDataSource(): Observable<unknown[]> | null {
    return this.data.dataSource as Observable<unknown[]> | null;
  }
}

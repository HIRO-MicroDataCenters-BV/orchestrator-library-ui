import { Component, OnInit } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { Observable } from 'rxjs';
import clustersData from '../../../mock/data/clusters.json';

@Component({
  selector: 'app-clusters',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule],
  templateUrl: './clusters.component.html',
})
export class ClustersComponent implements OnInit {
  clusters = [];
  columns = [
    'cluster_name',
    'status',
    'workloads',
    'nodes',
    'cpu_usage',
    'memory_usage',
  ];
  actions = [
    'view_details',
    'view_logs',
    'scale_cluster',
    'add_nodes',
    'cordon_cluster',
    'drain_cluster',
    'delete_cluster',
  ];

  dataSource: Observable<unknown[]> | null = null;
  staticData: unknown[] | null = null;
  useMockData = false;

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService
  ) {
    this.staticData = clustersData;
    this.dataSource = this.useMockData
      ? this.mockService.getClusters()
      : null;
  }

  ngOnInit(): void {
  }
}

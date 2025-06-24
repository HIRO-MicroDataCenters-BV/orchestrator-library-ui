import { Component, OnInit } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { O } from 'node_modules/@angular/cdk/overlay-module.d-CVO-IcaN';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-request-decisions',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule],
  templateUrl: './request_decisions.component.html',
})
export class RequestDecisionsComponent {
  clusters = [];
  columns = [
    'request_id',
    'pod_name',
    'namespace',
    'queue_name',
    'demand_cpu',
    'demand_memory',
    'pod_parent_kind',
    'node_id',
    'decision_status',
    'created_at',
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

  tabs = ['all', 'successful', 'pending', 'failed'];

  dataSource: Observable<unknown[]> | null = null;

  constructor(apiService: ApiService) {
    console.log(
      'apiService.getPodRequestDecisionsapiService.getPodRequestDecisions',
      apiService.getPodRequestDecisions
    );
    this.dataSource = apiService.getPodRequestDecisions();
    console.log('data', this.dataSource);
  }
}

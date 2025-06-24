import { Component, OnInit } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { O } from 'node_modules/@angular/cdk/overlay-module.d-CVO-IcaN';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule],
  templateUrl: './actions.component.html',
})
export class ActionsComponent {
  clusters = [];
  columns = [
    'action_type',
    'action_status',
    'bound_pod_name',
    'pod_parent_name',
    'action_reason',
    'action_start_time',
    'action_end_time',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<unknown[]> | null = null;

  constructor(apiService: ApiService) {
    this.dataSource = apiService.getWorkloadActions();
  }
}

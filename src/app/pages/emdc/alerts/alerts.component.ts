import { Component } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  clusters = [];
  columns = [
    'alert_type',
    'alert_description',
    'pod_id',
    'node_id',
    'created_at',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<unknown[]> | null = null;

  constructor(apiService: ApiService) {
    this.dataSource = apiService.getAlerts();
  }
}

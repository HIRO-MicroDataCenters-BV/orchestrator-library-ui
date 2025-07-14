import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardCardModel } from '../../shared/models/dashboard-card.model';
import { TranslocoService } from '@jsverse/transloco';

// App components
import { ApiService } from '../../core/services/api.service';
import { AppDashboardCardComponent } from '../../components/app-dashboard-card/app-dashboard-card.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslocoModule, AppDashboardCardComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  cards: DashboardCardModel[] = [];

  constructor(
    private apiService: ApiService,
    private translocoService: TranslocoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('OverviewComponent initialized');
    this.cards = [
      {
        key: 'cluster',
        title: this.translocoService.translate('card.cluster'),
        type: 'metrics',
        dataSource: this.apiService.getClusterInfo(),
        actions: [
          {
            label: this.translocoService.translate('action.healthy'),
            link: '/healthy',
          },
          {
            label: this.translocoService.translate('action.view_details'),
            link: '/cluster',
          },
        ],
      },
      {
        key: 'recent_alerts',
        title: this.translocoService.translate('card.recent_alerts'),
        type: 'table',
        dataSource: this.apiService.getAlerts({ limit: 5 }),
        actions: [
          {
            label: this.translocoService.translate('action.view_all'),
            link: '/alerts',
          },
        ],
      },
      {
        key: 'recent_workload_request_decisions',
        title: this.translocoService.translate(
          'card.recent_workload_request_decisions'
        ),
        type: 'table',
        dataSource: this.apiService.getWorkloadDecisions({ limit: 5 }),
        actions: [
          {
            label: this.translocoService.translate('action.view_all'),
            link: '/workload',
          },
        ],
      },
      {
        key: 'recent_served_models',
        title: this.translocoService.translate('card.recent_served_models'),
        type: 'table',
        dataSource: this.apiService.getWorkloadActions(),
        actions: [
          {
            label: this.translocoService.translate('action.view_all'),
            link: '/served-models',
          },
        ],
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

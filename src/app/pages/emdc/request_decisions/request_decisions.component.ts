import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import {
  RouterOutlet,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';

import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';

@Component({
  selector: 'app-request-decisions',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule, RouterOutlet, NgIf],
  templateUrl: './request_decisions.component.html',
})
export class RequestDecisionsComponent implements OnInit, OnDestroy {
  showParentContent = true;
  private routerSubscription: Subscription | null = null;
  clusters = [];
  columns = [
    'request_id',
    'pod_name',
    //'namespace',
    //'queue_name',
    //'demand_cpu',
    //'demand_memory',
    // 'node_id',
    'node_name',
    'pod_parent_kind',
    'decision_status',
    'namespace',
    'created_at',
  ];
  actions = [];

  tabs = ['all', 'successful', 'pending', 'failed'];

  dataSource: Observable<unknown[]> | null = null;

  constructor(
    apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.dataSource = apiService.getWorkloadDecisions();
  }
  ngOnInit(): void {
    this.checkCurrentRoute();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkCurrentRoute();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  checkCurrentRoute() {
    this.showParentContent = !this.activatedRoute.firstChild;
  }
}

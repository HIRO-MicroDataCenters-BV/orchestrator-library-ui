import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { Observable, Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule, NgIf, RouterOutlet],
  templateUrl: './actions.component.html',
})
export class ActionsComponent implements OnInit, OnDestroy {
  showParentContent = true;
  private routerSubscription: Subscription | null = null;
  clusters = [];
  columns = [
    'action_type',
    'action_status',
    //'bound_pod_name',
    //'pod_parent_name',
    //'action_reason',
    'action_start_time',
    'action_end_time',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<unknown[]> | null = null;

  constructor(
    apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.dataSource = apiService.getWorkloadActions();
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

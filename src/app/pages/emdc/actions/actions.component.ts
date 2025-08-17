import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { Observable, Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
} from '@angular/router';
import actionsData from '../../../mock/data/actions.json';

// Define interfaces for type safety
interface Condition {
  prop: string;
  if: 'eq' | 'neq';
  value: string;
}

interface StructItem {
  icon: string;
  prop: string;
  condition?: Condition;
}

interface Struct {
  title: string | null;
  items: StructItem[];
}

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
    'id_uid',
    'action_status',
    'action_type',
    'bound_pod_name',
    'pod_parent_name',
    'action_reason',
    'duration',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<unknown[]> | null = null;
  staticData: unknown[] | null = null;
  useMockData = false;

  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.staticData = actionsData;
    this.dataSource = this.useMockData
      ? this.mockService.getWorkloadActions()
      : this.apiService.getWorkloadActions() as Observable<unknown[]>;
  }
  ngOnInit(): void {
    this.checkCurrentRoute();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkCurrentRoute();
      });

    this.detailsStruct = [
      {
        title: 'action_details',
        items: [
          {
            icon: 'circle_dot',
            prop: 'action_type',
          },
          {
            icon: 'circle_check',
            prop: 'action_status',
          },
          {
            icon: 'calendar_clock',
            prop: 'created_at',
          },
          {
            icon: 'calendar_clock',
            prop: 'updated_at',
          },
          {
            icon: 'timer',
            prop: 'duration',
          },
        ],
      },
      {
        title: null,
        items: [
          {
            icon: 'package',
            prop: 'bound_pod_name',
          },
          {
            icon: 'layers',
            prop: 'pod_parent_name',
          },
          {
            icon: 'text',
            prop: 'action_reason',
          },
        ],
      },
    ];
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  checkCurrentRoute() {
    this.showParentContent = !this.activatedRoute.firstChild;
  }
}

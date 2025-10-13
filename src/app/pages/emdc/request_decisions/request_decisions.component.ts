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
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { WorkloadDecisionActionFlowItem } from '../../../shared/types';

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
    'decision_id',
    'action_id',
    'action_type',
    'decision_pod_name',
    'decision_namespace',
    'decision_node_name',
    'decision_status',
    'action_status',
    'total_duration',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<WorkloadDecisionActionFlowItem[]> | null = null;
  useMockData = false;

  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.dataSource = this.useMockData
      ? (this.mockService.getRequestDecisions() as Observable<
          WorkloadDecisionActionFlowItem[]
        >)
      : this.apiService.getWorkloadDecisionActionFlow();
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
        title: 'decision_details',
        items: [
          {
            icon: 'time',
            prop: 'decision_status',
          },
          {
            icon: 'calendar',
            prop: 'date',
          },
          {
            icon: 'time',
            prop: 'time',
          },
        ],
      },
      {
        title: null,
        items: [
          {
            icon: 'text',
            prop: 'pod_name',
          },
          {
            icon: 'text',
            prop: 'pod_id',
          },
          {
            icon: 'text',
            prop: 'namespace',
          },
          {
            icon: 'list_tree',
            prop: 'queue_name',
          },
          {
            icon: 'layers',
            prop: 'pod_parent_name',
          },
          {
            icon: 'hard_drive',
            prop: 'node_name',
          },
          {
            icon: 'cpu',
            prop: 'cpu',
          },
          {
            icon: 'memory_stick',
            prop: 'memory',
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

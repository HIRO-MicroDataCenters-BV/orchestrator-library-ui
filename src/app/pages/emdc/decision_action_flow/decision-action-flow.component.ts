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
  selector: 'app-decision-action-flow',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule, RouterOutlet, NgIf],
  templateUrl: './decision-action-flow.component.html',
})
export class DecisionActionFlowComponent implements OnInit, OnDestroy {
  showParentContent = true;
  private routerSubscription: Subscription | null = null;

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
    'decision_created_at',
  ];

  actions: string[] = [];
  tabs: string[] = [];

  dataSource: Observable<WorkloadDecisionActionFlowItem[]> | null = null;

  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Fetch data from workload_decision_action_flow endpoint without parameters
    this.dataSource = this.apiService.getWorkloadDecisionActionFlow();
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
            icon: 'fingerprint',
            prop: 'decision_id',
          },
          {
            icon: 'time',
            prop: 'decision_status',
          },
          {
            icon: 'calendar',
            prop: 'decision_created_at',
          },
          {
            icon: 'calendar_clock',
            prop: 'decision_start_time',
          },
          {
            icon: 'calendar_clock',
            prop: 'decision_end_time',
          },
          {
            icon: 'timer',
            prop: 'decision_duration',
          },
        ],
      },
      {
        title: 'action_details',
        items: [
          {
            icon: 'fingerprint',
            prop: 'action_id',
          },
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
            prop: 'action_start_time',
          },
          {
            icon: 'calendar_clock',
            prop: 'action_end_time',
          },
          {
            icon: 'timer',
            prop: 'action_duration',
          },
          {
            icon: 'text',
            prop: 'action_reason',
          },
        ],
      },
      {
        title: 'workload_info',
        items: [
          {
            icon: 'package',
            prop: 'decision_pod_name',
          },
          {
            icon: 'text',
            prop: 'decision_namespace',
          },
          {
            icon: 'hard_drive',
            prop: 'decision_node_name',
          },
          {
            icon: 'layers',
            prop: 'decision_pod_parent_name',
          },
          {
            icon: 'tag',
            prop: 'decision_pod_parent_kind',
          },
          {
            icon: 'list_tree',
            prop: 'queue_name',
          },
          {
            icon: 'toggle_right',
            prop: 'is_elastic',
          },
        ],
      },
      {
        title: 'resource_demands',
        items: [
          {
            icon: 'cpu',
            prop: 'demand_cpu',
          },
          {
            icon: 'memory_stick',
            prop: 'demand_memory',
          },
          {
            icon: 'cpu',
            prop: 'demand_slack_cpu',
          },
          {
            icon: 'memory_stick',
            prop: 'demand_slack_memory',
          },
        ],
      },
      {
        title: 'action_targets',
        items: [
          {
            icon: 'package',
            prop: 'bound_pod_name',
          },
          {
            icon: 'text',
            prop: 'bound_pod_namespace',
          },
          {
            icon: 'hard_drive',
            prop: 'bound_node_name',
          },
          {
            icon: 'package_plus',
            prop: 'created_pod_name',
          },
          {
            icon: 'text',
            prop: 'created_pod_namespace',
          },
          {
            icon: 'hard_drive',
            prop: 'created_node_name',
          },
          {
            icon: 'package_minus',
            prop: 'deleted_pod_name',
          },
          {
            icon: 'text',
            prop: 'deleted_pod_namespace',
          },
          {
            icon: 'hard_drive',
            prop: 'deleted_node_name',
          },
        ],
      },
      {
        title: 'timing_summary',
        items: [
          {
            icon: 'timer',
            prop: 'total_duration',
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

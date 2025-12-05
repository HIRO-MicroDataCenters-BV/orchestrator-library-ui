import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { filter, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import {
  RouterOutlet,
  Router,
  ActivatedRoute,
  NavigationEnd,
  Params,
} from '@angular/router';

import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { WorkloadRequestDecisionSchema } from '../../../shared/types';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants/app.constants';

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
    'id',
    'decision_status',
    'pod_name',
    'pod_id',
    'namespace',
    'queue_name',
    'pod_parent_name',
    'node_name',
    'duration_request_decision',
    'created_at',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<WorkloadRequestDecisionSchema[]> | null = null;
  totalElements = 0;
  useMockData = false;

  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Fetch workload decisions with server-side pagination and search
    const fetchDecisions = (
      queryParams: Params
    ): Observable<WorkloadRequestDecisionSchema[]> => {
      const params: Record<string, unknown> = {
        skip: parseInt(queryParams['skip'] || '0', 10),
        limit: Math.max(
          1,
          parseInt(queryParams['limit'] || DEFAULT_PAGE_SIZE.toString(), 10)
        ), // Ensure limit is at least 1
      };

      // If search query is provided, use server-side search
      if (queryParams['search'] && queryParams['search'].trim()) {
        params['search'] = queryParams['search'].trim();
      }

      return this.useMockData
        ? (this.mockService.getWorkloadDecisions() as Observable<
            WorkloadRequestDecisionSchema[]
          >)
        : this.apiService.getWorkloadDecisions(params);
    };

    // Create reactive data source that refetches when query params change
    this.dataSource = this.activatedRoute.queryParams.pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev['skip'] === curr['skip'] &&
          prev['limit'] === curr['limit'] &&
          prev['search'] === curr['search']
      ),
      switchMap((queryParams) => {
        return fetchDecisions(queryParams);
      }),
      map((decisions) => {
        // Update total elements (in real API this would come from response headers or body)
        this.totalElements = decisions.length;
        return decisions;
      })
    );
  }
  ngOnInit(): void {
    this.checkCurrentRoute();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkCurrentRoute();
      });

    // Initialize query params if not present
    this.activatedRoute.queryParams.subscribe((params) => {
      if (!params['skip'] && !params['limit']) {
        this.updateQueryParams(
          { skip: 0, limit: DEFAULT_PAGE_SIZE, search: params['search'] || '' },
          false
        );
      }
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

  // Method to update search - updates URL query params
  updateSearch(searchQuery: string): void {
    const currentParams = this.activatedRoute.snapshot.queryParams;
    this.updateQueryParams({
      skip: 0, // Reset to first page when search changes
      limit: Math.max(
        1,
        parseInt(currentParams['limit'] || DEFAULT_PAGE_SIZE.toString(), 10)
      ),
      search: searchQuery || '',
    });
  }

  // Method to handle pagination changes - updates URL query params
  onPaginationChange(pagination: { skip: number; limit: number }): void {
    const currentParams = this.activatedRoute.snapshot.queryParams;
    this.updateQueryParams({
      skip: pagination.skip,
      limit: Math.max(1, pagination.limit), // Ensure limit is at least 1
      search: currentParams['search'] || '',
    });
  }

  // Helper method to update query params
  private updateQueryParams(
    params: { skip: number; limit: number; search?: string },
    replaceUrl: boolean = true
  ): void {
    const queryParams: Params = {
      skip: params.skip.toString(),
      limit: params.limit.toString(),
    };

    if (params.search) {
      queryParams['search'] = params.search;
    } else {
      // Remove search param if empty
      queryParams['search'] = null;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      replaceUrl,
      queryParamsHandling: 'merge',
    });
  }
}

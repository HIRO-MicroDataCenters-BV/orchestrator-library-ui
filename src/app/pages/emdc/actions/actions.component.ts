import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { Observable, Subscription } from 'rxjs';
import { WorkloadAction } from '../../../shared/types';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants/app.constants';
import { NgIf } from '@angular/common';
import { filter, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
  Params,
} from '@angular/router';

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
    'id',
    'action_status',
    'action_type',
    'duration',
    'bound_pod_name',
    'pod_parent_name',
    'created_at',
  ];
  actions: string[] = [];
  //['view_details', 'restart', 'cancel', 'retry', 'delete'];

  tabs = [];

  dataSource: Observable<WorkloadAction[]> | null = null;
  totalElements = 0;
  useMockData = false;
  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Fetch workload actions with server-side pagination and search
    const fetchActions = (
      queryParams: Params
    ): Observable<WorkloadAction[]> => {
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
        ? (this.mockService.getWorkloadActions() as Observable<
            WorkloadAction[]
          >)
        : this.apiService.getWorkloadActions(params);
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
        return fetchActions(queryParams);
      }),
      map((actions) => {
        // Update total elements (in real API this would come from response headers or body)
        this.totalElements = actions.length;
        return actions;
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

    // Initialize data source
    this.loadActions();
  }

  private loadActions(): void {
    // actions are already defined as table row actions
    // this method can be used for additional data loading if needed
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

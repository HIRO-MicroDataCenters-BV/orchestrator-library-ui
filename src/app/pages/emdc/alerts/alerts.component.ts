import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { Alert, AlertQueryParams } from '../../../shared/types';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants/app.constants';
import { NgIf } from '@angular/common';
import {
  filter,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  tap,
} from 'rxjs/operators';
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
  selector: 'app-alerts',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule, NgIf, RouterOutlet],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit, OnDestroy {
  showParentContent = true;
  private routerSubscription: Subscription | null = null;
  private queryParamsSubscription: Subscription | null = null;
  clusters = [];
  columns = [
    'id',
    'alert_description',
    'alert_type',
    'alert_model',
    'pod_name',
    'destination_ip',
    'source_ip',
    'time',
  ];
  actions = [];

  tabs = [];

  dataSource: Observable<Alert[]> | null = null;
  totalElements = 0;
  useMockData = false;

  detailsStruct: Struct[] = [];

  constructor(
    private apiService: ApiService,
    private mockService: EmdcMockService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Fetch alerts with server-side pagination and search
    const fetchAlerts = (queryParams: Params): Observable<Alert[]> => {
      const params: AlertQueryParams = {
        skip: parseInt(queryParams['skip'] || '0', 10),
        limit: Math.max(
          1,
          parseInt(queryParams['limit'] || DEFAULT_PAGE_SIZE.toString(), 10)
        ), // Ensure limit is at least 1
      };

      // If search query is provided, use server-side search
      if (queryParams['search'] && queryParams['search'].trim()) {
        params.search = queryParams['search'].trim();
      }

      return this.useMockData
        ? (this.mockService.getAlerts() as Observable<Alert[]>)
        : this.apiService.getAlerts(params);
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
        return fetchAlerts(queryParams);
      }),
      map((alerts) => {
        // Update total elements (in real API this would come from response headers or body)
        // For now, we'll use the length of the returned array
        // If API returns paginated response with total, this should be updated
        // Note: This is a temporary solution - ideally API should return total count
        this.totalElements = alerts.length;
        return alerts;
      })
    );
    this.detailsStruct = [
      {
        title: 'alert_details',
        items: [
          {
            icon: 'circle_dot',
            prop: 'alert_type',
          },
          {
            icon: 'calendar',
            prop: 'date',
          },
          {
            icon: 'time',
            prop: 'time',
          },
          {
            icon: 'hard_drive',
            prop: 'node_id',
            condition: {
              prop: 'alert_type',
              if: 'neq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'package',
            prop: 'pod_id',
            condition: {
              prop: 'alert_type',
              if: 'neq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'text',
            prop: 'source_ip',
            condition: {
              prop: 'alert_type',
              if: 'eq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'text',
            prop: 'source_port',
            condition: {
              prop: 'alert_type',
              if: 'eq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'text',
            prop: 'destination_ip',
            condition: {
              prop: 'alert_type',
              if: 'eq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'text',
            prop: 'destination_port',
            condition: {
              prop: 'alert_type',
              if: 'eq',
              value: 'Network-Attack',
            },
          },
          {
            icon: 'text',
            prop: 'protocol',
            condition: {
              prop: 'alert_type',
              if: 'eq',
              value: 'Network-Attack',
            },
          },
        ],
      },
      {
        title: 'ai_summary',
        items: [
          {
            icon: 'bot',
            prop: 'alert_model',
          },
          {
            icon: 'text',
            prop: 'alert_description',
          },
        ],
      },
    ];
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
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  checkCurrentRoute() {
    this.showParentContent = !this.activatedRoute.firstChild;
  }

  // Method to update search - updates URL query params
  updateSearch(searchQuery: string): void {
    console.log('🔍 updateSearch called with:', searchQuery);
    const currentParams = this.activatedRoute.snapshot.queryParams;
    this.updateQueryParams({
      skip: 0, // Reset to first page when search changes
      limit: Math.max(
        1,
        parseInt(currentParams['limit'] || DEFAULT_PAGE_SIZE.toString(), 10)
      ),
      search: searchQuery,
      search_col: currentParams['search_col'], // Preserve search_col
    });
  }

  // Method to update search column - updates URL query params
  updateSearchColumn(searchColumn: string): void {
    console.log('🎯 updateSearchColumn called with:', searchColumn);
    const currentParams = this.activatedRoute.snapshot.queryParams;
    this.updateQueryParams({
      skip: 0, // Reset to first page when column changes
      limit: Math.max(
        1,
        parseInt(currentParams['limit'] || DEFAULT_PAGE_SIZE.toString(), 10)
      ),
      search: currentParams['search'], // Preserve search
      search_col: searchColumn !== 'all' ? searchColumn : undefined,
    });
  }

  // Method to handle pagination changes - updates URL query params
  onPaginationChange(pagination: { skip: number; limit: number }): void {
    const currentParams = this.activatedRoute.snapshot.queryParams;
    this.updateQueryParams({
      skip: pagination.skip,
      limit: Math.max(1, pagination.limit), // Ensure limit is at least 1
      search: currentParams['search'] || '',
      search_col: currentParams['search_col'], // Preserve search_col
    });
  }

  // Helper method to update query params
  private updateQueryParams(
    params: { skip: number; limit: number; search?: string; search_col?: string },
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

    if (params.search_col) {
      queryParams['search_col'] = params.search_col;
    } else {
      // Remove search_col param if empty
      queryParams['search_col'] = null;
    }

    console.log('🔄 updateQueryParams - navigating with:', queryParams);

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      replaceUrl,
      queryParamsHandling: 'merge',
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services';
import { EmdcMockService } from '../../../mock/emdc-mock.service';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { Alert, AlertQueryParams } from '../../../shared/types';
import { NgIf } from '@angular/common';
import { filter, switchMap, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
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
  private searchSubject = new BehaviorSubject<string>('');
  private paginationSubject = new BehaviorSubject<{ skip: number; limit: number }>({ skip: 0, limit: 50 });
  clusters = [];
  columns = ['id', 'alert_description', 'alert_type', 'alert_model', 'time'];
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
    const fetchAlerts = (searchQuery: string, pagination: { skip: number; limit: number }): Observable<Alert[]> => {
      const params: AlertQueryParams = {
        skip: pagination.skip,
        limit: pagination.limit,
      };
      
      // If search query is provided, use server-side search
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      return this.useMockData
        ? (this.mockService.getAlerts() as Observable<Alert[]>)
        : this.apiService.getAlerts(params);
    };

    // Create reactive data source that refetches when search or pagination changes
    this.dataSource = combineLatest([
      this.searchSubject.pipe(
        debounceTime(300), // Debounce search input
        distinctUntilChanged(), // Only fetch if search actually changed
        startWith('')
      ),
      this.paginationSubject.pipe(
        distinctUntilChanged((prev, curr) => 
          prev.skip === curr.skip && prev.limit === curr.limit
        )
      )
    ]).pipe(
      switchMap(([searchQuery, pagination]) => {
        return fetchAlerts(searchQuery, pagination);
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
    
    // Trigger initial data load
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.searchSubject.complete();
    this.paginationSubject.complete();
  }

  checkCurrentRoute() {
    this.showParentContent = !this.activatedRoute.firstChild;
  }

  // Method to update search (can be called from template if needed)
  updateSearch(searchQuery: string): void {
    // Reset pagination to first page when search changes
    this.paginationSubject.next({ skip: 0, limit: this.paginationSubject.value.limit });
    this.searchSubject.next(searchQuery);
  }

  // Method to handle pagination changes
  onPaginationChange(pagination: { skip: number; limit: number }): void {
    this.paginationSubject.next(pagination);
  }
}

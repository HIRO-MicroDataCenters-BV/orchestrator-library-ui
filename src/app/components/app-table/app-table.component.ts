import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';

import { TranslocoModule } from '@jsverse/transloco';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges,
  TrackByFunction,
  untracked,
} from '@angular/core';

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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  lucideArrowUpDown,
  lucideChevronDown,
  lucideCog,
  lucideDownload,
  lucideEllipsisVertical,
  lucideInfo,
  lucidePause,
  lucidePlus,
  lucideTerminal,
  lucideTrash2,
  lucideCircleCheck,
  lucideTriangleAlert,
  lucideCircleX,
  lucideCircle,
  lucideCalendarClock,
  lucideTimer,
  lucidePackage,
  lucideText,
  lucideLayers,
} from '@ng-icons/lucide';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { getDuration, parseDuration } from '../../shared';
import {
  HlmMenuItemCheckboxDirective,
  HlmMenuItemCheckComponent,
  HlmMenuModule,
} from '@spartan-ng/ui-menu-helm';
import { BrnTableModule, PaginatorState } from '@spartan-ng/brain/table';
import {
  HlmTabsComponent,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/helm/tabs';
import { HlmTableModule } from '@spartan-ng/ui-table-helm';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { debounceTime, Observable, startWith } from 'rxjs';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';

import { AppCircleProgressComponent } from '../app-circle-progress/app-circle-progress.component';
import { AppDetailsComponent } from '../app-details/app-details.component';
import {
  BrnSheetTriggerDirective,
  BrnSheetContentDirective,
} from '@spartan-ng/brain/sheet';
import {
  HlmSheetComponent,
  HlmSheetContentComponent,
  HlmSheetDescriptionDirective,
  HlmSheetHeaderComponent,
  HlmSheetTitleDirective,
} from '@spartan-ng/helm/sheet';

// Import centralized types and utilities
import {
  BaseTableData,
  ColumnVisibility,
  getStatusColor,
  getStatusIcon,
  getProgressColor,
  getMainText,
  getSubText,
  getStatusValue,
  getStatusTextColor,
} from '../../shared/models';

/**
 * App Table Component
 *
 * A reusable table component with filtering, pagination, and conditional header display.
 *
 * @param showHeader - Controls visibility of both search panel and table headers
 *                    When false, hides the entire header row including th elements
 * @param showFooter - Controls visibility of pagination footer
 * @param hasRowAction - Enables row click navigation
 * @param columns - Array of column names to display
 * @param actions - Array of action names for row menus
 * @param tabs - Array of tab names for filtering
 * @param dataSource - Observable data source for table content
 * @param staticData - Static JSON data source for table content (takes priority over dataSource)
 *
 * @example
 * // Table with headers visible
 * <app-table [columns]="['name', 'status']" [showHeader]="true"></app-table>
 *
 * @example
 * // Clean table for dashboard embedding (no headers/footer)
 * <app-table [columns]="['name', 'status']" [showHeader]="false" [showFooter]="false"></app-table>
 *
 * @example
 * // Table with static data
 * <app-table [columns]="['name', 'status']" [staticData]="myJsonData"></app-table>
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    FormsModule,
    NgIcon,
    BrnMenuTriggerDirective,
    HlmMenuModule,
    BrnTableModule,
    HlmTableModule,
    HlmButtonModule,
    DatePipe,
    HlmIconDirective,
    HlmInputDirective,
    HlmTabsComponent,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmMenuItemCheckComponent,
    HlmMenuItemCheckboxDirective,
    HlmBadgeDirective,
    BrnSelectModule,
    HlmSelectModule,
    TranslocoModule,
    AppCircleProgressComponent,
    NgClass,
    NgFor,
    NgIf,
    RouterLink,
    BrnSheetTriggerDirective,
    HlmSheetComponent,
    HlmSheetContentComponent,
    HlmSheetDescriptionDirective,
    HlmSheetHeaderComponent,
    HlmSheetTitleDirective,
    BrnSheetContentDirective,
    AppDetailsComponent,
  ],
  providers: [
    provideIcons({
      lucideChevronDown,
      lucideEllipsisVertical,
      lucideArrowUpDown,
      lucideInfo,
      lucideDownload,
      lucideTerminal,
      lucidePlus,
      lucideCog,
      lucidePause,
      lucideTrash2,
      lucideCircleCheck,
      lucideTriangleAlert,
      lucideCircleX,
      lucideCircle,
      lucideCalendarClock,
      lucideTimer,
      lucidePackage,
      lucideText,
      lucideLayers,
    }),
  ],
  host: {
    class: 'w-full',
  },
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.css'],
})
export class AppTableComponent implements OnChanges, OnInit, OnDestroy {
  @Input('columns') columns: string[] = [];
  @Input('actions') actions: string[] = [];
  @Input('tabs') tabs: string[] = [];
  @Input('dataSource') dataSource: Observable<unknown[]> | null = null;
  @Input('staticData') staticData: unknown[] | null = null;
  @Input('hasRowAction') hasRowAction = true;
  @Input('showHeader') showHeader = true;
  @Input('showFooter') showFooter = true;
  @Input('pageSize') pageSize?: number;
  @Input('detailsStruct') detailsStruct: Struct[] = [];
  @Input('enableServerSearch') enableServerSearch = false;
  @Input('enableServerPagination') enableServerPagination = false;
  @Input('totalElements') totalElementsInput?: number;
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchColumnChange = new EventEmitter<string>();
  @Output() paginationChange = new EventEmitter<{
    skip: number;
    limit: number;
  }>();

  details: Record<string, unknown> = {};
  detailsTitle = '';

  ACTION_ICONS: Record<string, string> = {
    view_details: lucideInfo,
    view_logs: lucideTerminal,
    scale_cluster: lucideCog,
    add_nodes: lucidePlus,
    cordon_cluster: lucidePause,
    drain_cluster: lucideDownload,
    delete_cluster: lucideTrash2,
  };

  protected readonly _rawFilterInput = signal('');
  protected readonly _colFilter = signal('');
  protected _searchColumn = signal<string>('all');
  private readonly _debouncedFilter = toSignal(
    toObservable(this._rawFilterInput).pipe(debounceTime(300), startWith(''))
  );

  private readonly _displayedIndices = signal({ start: 0, end: 0 });
  protected readonly _availablePageSizes = [25, 50, 100, 10000];
  protected readonly _pageSize = signal(this._availablePageSizes[0]);

  protected readonly _columns = computed(() => [...this.columns]);

  protected readonly _actions = computed(() => [...this.actions]);

  protected readonly _columnOptions = signal<ColumnVisibility[]>(
    this.columns.map((col) => ({ name: col, selected: true }))
  );

  protected readonly _selectedColumns = computed(() =>
    this._columnOptions()
      .filter((col) => col.selected)
      .map((col) => col.name)
  );

  protected readonly _allDisplayedColumns = computed(() => {
    const items = this._selectedColumns();
    if (this.actions.length > 0) {
      items.push('actions');
    }
    return items;
  });

  private _items = signal<BaseTableData[]>([]);
  protected readonly _highlightedRowId = signal<string | number | null>(null);

  private readonly _filteredItems = computed(() => {
    const colFilter = this._colFilter()?.trim()?.toLowerCase();
    const searchColumn = this._searchColumn();

    // Always perform client-side filtering if there's a search query
    // This works for both server and client search modes

    if (colFilter && colFilter.length > 0) {
      console.log('🔎 Filtering with:', { colFilter, searchColumn, itemsCount: this._items().length });

      return this._items().filter((item) => {
        // If a specific column is selected, only search in that column
        if (searchColumn && searchColumn !== 'all') {
          const value = (item as Record<string, unknown>)[searchColumn];
          if (value === null || value === undefined) {
            return false;
          }
          if (typeof value === 'string') {
            return value.toLowerCase().includes(colFilter);
          }
          if (typeof value === 'number') {
            return value.toString().includes(colFilter);
          }
          if (typeof value === 'object') {
            return JSON.stringify(value).toLowerCase().includes(colFilter);
          }
          return false;
        }

        // Search through all string properties of the item (when 'all' is selected or null)
        const matches = Object.values(item as Record<string, unknown>).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(colFilter);
          }
          if (typeof value === 'number') {
            return value.toString().includes(colFilter);
          }
          if (value === null || value === undefined) {
            return false;
          }
          // Handle nested objects and arrays
          if (typeof value === 'object') {
            return JSON.stringify(value).toLowerCase().includes(colFilter);
          }
          return false;
        });

        if (matches) {
          console.log('✅ Match found in item:', item);
        }

        return matches;
      });
    }
    return this._items();
  });

  getDuration(start: string, end: string) {
    return getDuration(start, end);
  }

  parseDuration(duration: string | null | undefined): number {
    return parseDuration(duration);
  }
  // Column sorting implementation
  private readonly _colSort = signal<'ASC' | 'DESC' | null>(null);
  private readonly _sortColumn = signal<string | null>(null);
  private readonly _searchFilter = signal<string>('');
  protected readonly _filteredSortedPaginatedItems = computed(() => {
    const items = this._filteredItems();

    // If server-side pagination is enabled, return items as-is (no client-side pagination)
    if (this.enableServerPagination) {
      const sort = this._colSort();
      if (!sort) {
        return items;
      }
      // Apply sorting only
      return [...items].sort((p1, p2) => {
        const p1Str = JSON.stringify(p1).toLowerCase();
        const p2Str = JSON.stringify(p2).toLowerCase();
        return (sort === 'ASC' ? 1 : -1) * p1Str.localeCompare(p2Str);
      });
    }

    // Client-side pagination (original behavior)
    const sort = this._colSort();
    const start = this._displayedIndices().start;
    const end = this._displayedIndices().end + 1;

    if (!sort) {
      const result = items.slice(start, end);
      return result;
    }

    // Generic sorting for any object with string properties
    const sortedItems = [...items].sort((p1, p2) => {
      const p1Str = JSON.stringify(p1).toLowerCase();
      const p2Str = JSON.stringify(p2).toLowerCase();
      return (sort === 'ASC' ? 1 : -1) * p1Str.localeCompare(p2Str);
    });

    const result = sortedItems.slice(start, end);
    return result;
  });

  protected readonly _trackBy: TrackByFunction<BaseTableData> = (
    _: number,
    p: BaseTableData
  ) => p.id;

  // Use server-provided total if available, otherwise use client-side count
  protected _totalElements = computed(() => {
    if (this.enableServerPagination && this.totalElementsInput !== undefined) {
      return this.totalElementsInput;
    }
    return this._filteredItems().length;
  });

  protected readonly _onStateChange = ({
    startIndex,
    endIndex,
  }: PaginatorState) => {
    this._displayedIndices.set({ start: startIndex, end: endIndex });

    // Emit pagination change event for server-side pagination
    // Only emit if value actually changed to prevent duplicate requests
    if (this.enableServerPagination && this._isInitialized) {
      const skip = startIndex;
      // Use the selected page size from dropdown, not calculated from indices
      const limit = Math.max(1, this._pageSize()); // Ensure limit is at least 1
      const pagination = { skip, limit };

      if (
        !this._lastEmittedPagination ||
        this._lastEmittedPagination.skip !== skip ||
        this._lastEmittedPagination.limit !== limit
      ) {
        this._lastEmittedPagination = pagination;
        this.paginationChange.emit(pagination);
      }
    }
  };

  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });
  private _isInitialized = false;
  private _lastEmittedSearch: string | null = null;
  private _lastEmittedPagination: { skip: number; limit: number } | null = null;
  private _firstSearchEffectRun = true;
  private _firstPaginationEffectRun = true;
  private _queryParamsSubscription: Subscription | null = null;

  constructor() {
    effect(() => {
      const debouncedFilter = this._debouncedFilter();
      untracked(() => {
        this._colFilter.set(debouncedFilter ?? '');
        // Emit search change event for server-side search support
        // Skip first run to avoid initial emission - parent will initialize URL params
        if (this._firstSearchEffectRun) {
          this._firstSearchEffectRun = false;
          this._lastEmittedSearch = debouncedFilter ?? '';
          return;
        }
        // Only emit after initialization and if value actually changed
        if (
          this.enableServerSearch &&
          this._isInitialized &&
          this._lastEmittedSearch !== debouncedFilter
        ) {
          this._lastEmittedSearch = debouncedFilter ?? '';
          this.searchChange.emit(debouncedFilter ?? '');
        }
      });
    });

    // Emit pagination change when page size changes (for server-side pagination)
    effect(() => {
      const pageSize = this._pageSize();
      if (this.enableServerPagination) {
        untracked(() => {
          // Skip first run to avoid initial emission - parent will initialize URL params
          if (this._firstPaginationEffectRun) {
            this._firstPaginationEffectRun = false;
            const skip = 0;
            const limit = Math.max(1, pageSize);
            this._lastEmittedPagination = { skip, limit };
            this._displayedIndices.set({ start: 0, end: limit - 1 });
            return;
          }

          // Only emit if initialized and page size actually changed
          if (this._isInitialized) {
            const skip = 0;
            const limit = Math.max(1, pageSize); // Ensure limit is at least 1
            const pagination = { skip, limit };

            if (
              !this._lastEmittedPagination ||
              this._lastEmittedPagination.limit !== limit
            ) {
              this._lastEmittedPagination = pagination;
              this._displayedIndices.set({ start: 0, end: limit - 1 });
              this.paginationChange.emit(pagination);
            }
          }
        });
      }
    });

    // Emit searchColumn change when column selection changes (for server-side search)
    effect(() => {
      const searchColumn = this._searchColumn();
      if (this.enableServerSearch) {
        untracked(() => {
          // Skip first run
          if (!this._isInitialized) {
            return;
          }
          console.log('📤 Emitting searchColumnChange:', searchColumn);
          this.searchColumnChange.emit(searchColumn);
        });
      }
    });
  }
  ngOnInit(): void {
    // Set page size based on input or mode
    if (this.pageSize !== undefined) {
      this._pageSize.set(this.pageSize);
    } else if (!this.showHeader && !this.showFooter) {
      // Dashboard mode - show more items
      this._pageSize.set(10);
    } else if (this.enableServerPagination && this.route) {
      // Sync page size with URL query params if server-side pagination is enabled
      this._queryParamsSubscription = this.route.queryParams.subscribe(
        (params) => {
          if (params['limit']) {
            const limitFromUrl = parseInt(params['limit'], 10);
            // Only update if the limit from URL is in available page sizes
            if (this._availablePageSizes.includes(limitFromUrl)) {
              this._pageSize.set(limitFromUrl);
            }
          }

          // Sync search from URL
          if (params['search'] !== undefined) {
            const searchFromUrl = params['search'] || '';
            if (this._colFilter() !== searchFromUrl) {
              this._colFilter.set(searchFromUrl);
              this._rawFilterInput.set(searchFromUrl);
            }
          }

          // Sync search_col from URL
          if (params['search_col'] !== undefined) {
            const searchColFromUrl = params['search_col'] || 'all';
            if (this._searchColumn() !== searchColFromUrl) {
              this._searchColumn.set(searchColFromUrl);
            }
          }
        }
      );
    }

    // Initialize pagination for dashboard mode (no footer)
    if (!this.showFooter) {
      this.initializeDashboardPagination();
    }

    // Load data - prioritize staticData over dataSource
    if (this.staticData && this.staticData.length > 0) {
      this.loadStaticData();
    } else if (this.dataSource) {
      this.fetchData();
    }

    // Mark as initialized after setup
    this._isInitialized = true;
  }

  private initializeDashboardPagination(): void {
    const currentPageSize = this._pageSize();
    const totalItems = this._totalElements();
    const endIndex = Math.min(currentPageSize - 1, Math.max(0, totalItems - 1));
    this._displayedIndices.set({ start: 0, end: endIndex });
  }

  fetchData(): void {
    if (this.dataSource) {
      this.dataSource.subscribe((res: unknown[]) => {
        this._items.set(res as BaseTableData[]);
        if (!this.showFooter) {
          this.initializeDashboardPagination();
        }

        // Check for id in queryParams and highlight the row
        if (this.route) {
          this.route.queryParams.subscribe((params) => {
            const id = params['id'];
            if (id) {
              // Find the item with this id
              const foundItem = (res as BaseTableData[]).find(
                (item) => String(item.id) === String(id)
              );
              if (foundItem) {
                this._highlightedRowId.set(foundItem.id);
              }
            }
          });
        }
      });
    }
  }

  loadStaticData(): void {
    if (this.staticData) {
      this._items.set(this.staticData as BaseTableData[]);
      if (!this.showFooter) {
        this.initializeDashboardPagination();
      }

      // Check for id in queryParams and highlight the row
      if (this.route) {
        this.route.queryParams.subscribe((params) => {
          const id = params['id'];
          if (id) {
            // Find the item with this id
            const foundItem = (this.staticData as BaseTableData[]).find(
              (item) => String(item.id) === String(id)
            );
            if (foundItem) {
              this._highlightedRowId.set(foundItem.id);
            }
          }
        });
      }
    }
  }

  toggleColumnVisibility(columnName: string): void {
    const columnOptions = [...this._columnOptions()];
    const columnIndex = columnOptions.findIndex(
      (col) => col.name === columnName
    );

    if (columnIndex >= 0) {
      // Don't allow deselecting all columns - at least one must remain selected
      const selectedCount = columnOptions.filter((col) => col.selected).length;
      if (selectedCount > 1 || !columnOptions[columnIndex].selected) {
        columnOptions[columnIndex] = {
          ...columnOptions[columnIndex],
          selected: !columnOptions[columnIndex].selected,
        };
        this._columnOptions.set(columnOptions);
      }
    }
  }

  public onColumnChange(column: string) {
    console.log('🔽 Column changed to:', column);
    this._searchColumn.set(column);
    // Clear search when column changes
    this._rawFilterInput.set('');
    this._colFilter.set('');
  }

  isColumnSelected(columnName: string): boolean {
    const column = this._columnOptions().find((col) => col.name === columnName);
    return column ? column.selected : false;
  }

  public onRowClick(element: BaseTableData) {
    this.detailsTitle = element.id;
    this.details = element;
    /*
    if (!this.router || !this.route) {
      return;
    }
    this.router.navigate([`./${element.id}`], {
      relativeTo: this.route,
      state: element as Record<string, unknown>,
    });
    */
  }

  public onRowClickRedirect(id: number | string, route: string) {
    if (!this.router || !this.route) {
      return;
    }
    console.log(id);
    this.router.navigate([route], {
      relativeTo: this.route,
      queryParams: {
        id,
      },
    });
  }

  public setFilter(filterValue?: string) {
    if (filterValue) {
      this._searchFilter.set(filterValue);
    }
  }

  public sortByColumn(column: string) {
    const currentSort = this._colSort();
    const currentColumn = this._sortColumn();

    if (currentColumn === column) {
      // Toggle sort direction for same column
      if (currentSort === 'ASC') {
        this._colSort.set('DESC');
      } else if (currentSort === 'DESC') {
        this._colSort.set(null);
        this._sortColumn.set(null);
      } else {
        this._colSort.set('ASC');
      }
    } else {
      // New column, start with ASC
      this._sortColumn.set(column);
      this._colSort.set('ASC');
    }
  }

  public getSortDirection(column: string): 'ASC' | 'DESC' | null {
    return this._sortColumn() === column ? this._colSort() : null;
  }

  getStatusColor(status: string | number | boolean): string {
    return getStatusColor(status);
  }

  getProgressColor(percent: number): string {
    return getProgressColor(percent);
  }

  protected handleColSortChange(): void {
    const sort = this._colSort();
    if (sort === 'ASC') {
      this._colSort.set('DESC');
    } else if (sort === 'DESC') {
      this._colSort.set(null);
    } else {
      this._colSort.set('ASC');
    }
  }

  getDashboardStatusIcon(element: unknown): string {
    const statusValue = getStatusValue(element as BaseTableData);
    return getStatusIcon(statusValue);
  }

  getDashboardStatusColor(element: unknown): string {
    const statusValue = getStatusValue(element as BaseTableData);
    return getStatusTextColor(statusValue);
  }

  getDashboardMainText(element: unknown): string {
    return getMainText(element as BaseTableData);
  }

  getDashboardSubText(element: unknown): string {
    return getSubText(element as BaseTableData);
  }

  isRowHighlighted(element: BaseTableData): boolean {
    const highlightedId = this._highlightedRowId();
    return (
      highlightedId !== null && String(element.id) === String(highlightedId)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this._columnOptions.set(
        this.columns.map((col) => {
          const existing = this._columnOptions().find((c) => c.name === col);
          return {
            name: col,
            selected: existing ? existing.selected : true,
          };
        })
      );
    }

    // Handle data source changes - staticData has priority
    if (changes['staticData'] || changes['dataSource']) {
      if (this.staticData && this.staticData.length > 0) {
        this.loadStaticData();
      } else if (this.dataSource) {
        this.fetchData();
      } else {
        this._items.set([]);
      }
    }
  }

  ngOnDestroy(): void {
    this._queryParamsSubscription?.unsubscribe();
  }
}

import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
} from '@ng-icons/lucide';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
  HlmMenuItemCheckboxDirective,
  HlmMenuItemCheckComponent,
  HlmMenuModule,
} from '@spartan-ng/ui-menu-helm';
import {
  HlmTabsComponent,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/helm/tabs';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { debounceTime, Observable } from 'rxjs';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmTableImports } from '@spartan-ng/ui-table-helm';

// TanStack Table imports
import {
  ColumnDef,
  createAngularTable,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/angular-table';

// Import centralized types and utilities
import {
  BaseTableData,
  getStatusColor,
  getStatusIcon,
  getProgressColor,
  getMainText,
  getSubText,
  getStatusValue,
  getStatusTextColor,
} from '../../shared/models';

/**
 * App Table Component - TanStack + Spartan Edition
 *
 * A reusable table component built with TanStack Table and Spartan UI helm components.
 *
 * @param showHeader - Controls visibility of both search panel and table headers
 * @param showFooter - Controls visibility of pagination footer
 * @param hasRowAction - Enables row click navigation
 * @param columns - Array of column names to display
 * @param actions - Array of action names for row menus
 * @param tabs - Array of tab names for filtering
 * @param dataSource - Observable data source for table content
 * @param staticData - Static JSON data source for table content (takes priority over dataSource)
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    FormsModule,
    NgIcon,
    BrnMenuTriggerDirective,
    HlmMenuModule,
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
    NgClass,
    NgFor,
    NgIf,
    FlexRenderDirective,
    ...HlmTableImports,
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
    }),
  ],
  host: {
    class: 'w-full',
  },
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.css'],
})
export class AppTableComponent implements OnChanges, OnInit {
  @Input('columns') columns: string[] = [];
  @Input('actions') actions: string[] = [];
  @Input('tabs') tabs: string[] = [];
  @Input('dataSource') dataSource: Observable<unknown[]> | null = null;
  @Input('staticData') staticData: unknown[] | null = null;
  @Input('hasRowAction') hasRowAction = true;
  @Input('showHeader') showHeader = true;
  @Input('showFooter') showFooter = true;
  @Input('pageSize') pageSize?: number;

  ACTION_ICONS: Record<string, string> = {
    view_details: lucideInfo,
    view_logs: lucideTerminal,
    scale_cluster: lucideCog,
    add_nodes: lucidePlus,
    cordon_cluster: lucidePause,
    drain_cluster: lucideDownload,
    delete_cluster: lucideTrash2,
  };

  // TanStack Table state
  protected readonly _data = signal<BaseTableData[]>([]);
  protected readonly _globalFilter = signal('');
  protected readonly _sorting = signal<SortingState>([]);
  protected readonly _columnFilters = signal<ColumnFiltersState>([]);
  protected readonly _columnVisibility = signal<VisibilityState>({});
  protected readonly _pagination = signal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Column definitions
  protected readonly _columnDefs = computed(() => this.createColumnDefs());

  // TanStack Table instance
  protected readonly _table = createAngularTable(() => ({
    data: this._data(),
    columns: this._columnDefs(),
    state: {
      sorting: this._sorting(),
      columnFilters: this._columnFilters(),
      columnVisibility: this._columnVisibility(),
      globalFilter: this._globalFilter(),
      pagination: this._pagination(),
    },
    onSortingChange: (updater) => {
      this._sorting.update((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    onColumnFiltersChange: (updater) => {
      this._columnFilters.update((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    onColumnVisibilityChange: (updater) => {
      this._columnVisibility.update((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    onGlobalFilterChange: (updater) => {
      this._globalFilter.update((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    onPaginationChange: (updater) => {
      this._pagination.update((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  }));

  // Debounced filter input
  protected readonly _rawFilterInput = signal('');
  private readonly _debouncedFilter = toSignal(
    toObservable(this._rawFilterInput).pipe(debounceTime(300))
  );

  // Column options for visibility toggle
  protected readonly _columnOptions = computed(() =>
    this.columns.map((col) => ({
      name: col,
      selected: !this._columnVisibility()[col],
    }))
  );

  protected readonly _availablePageSizes = [5, 10, 20, 10000];

  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });

  constructor() {
    // Sync debounced filter with global filter
    effect(() => {
      const debouncedFilter = this._debouncedFilter();
      untracked(() => this._globalFilter.set(debouncedFilter ?? ''));
    });
  }

  ngOnInit(): void {
    // Set initial page size
    if (this.pageSize !== undefined) {
      this._pagination.update((prev) => ({
        ...prev,
        pageSize: this.pageSize || 10,
      }));
    } else if (!this.showHeader && !this.showFooter) {
      // Dashboard mode - show more items
      this._pagination.update((prev) => ({ ...prev, pageSize: 10 }));
    }

    // Load initial data
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      // Reset column visibility when columns change
      const visibility: VisibilityState = {};
      this.columns.forEach((col) => {
        visibility[col] = true;
      });
      this._columnVisibility.set(visibility);
    }

    if (changes['staticData'] || changes['dataSource']) {
      this.loadData();
    }
  }

  private loadData(): void {
    if (this.staticData && this.staticData.length > 0) {
      this._data.set(this.staticData as BaseTableData[]);
    } else if (this.dataSource) {
      this.dataSource.subscribe((res: unknown[]) => {
        this._data.set(res as BaseTableData[]);
      });
    } else {
      this._data.set([]);
    }
  }

  private createColumnDefs(): ColumnDef<BaseTableData>[] {
    const columnDefs: ColumnDef<BaseTableData>[] = [];

    // Dashboard columns for compact view
    if (!this.showHeader) {
      columnDefs.push(
        {
          id: 'dashboard_status',
          header: '',
          cell: (info) => '⚡',
          size: 64,
          enableSorting: false,
          enableHiding: false,
        },
        {
          id: 'dashboard_info',
          header: '',
          cell: (info) => getMainText(info.row.original),
          enableSorting: false,
          enableHiding: false,
        },
        {
          id: 'dashboard_date',
          header: '',
          cell: (info) => {
            const element = info.row.original as any;
            return element?.created_at
              ? new Date(element.created_at).toLocaleDateString()
              : '';
          },
          size: 128,
          enableSorting: false,
          enableHiding: false,
        }
      );
    } else {
      // Regular columns
      this.columns.forEach((columnName) => {
        columnDefs.push({
          accessorKey: columnName,
          id: columnName,
          header: columnName.replace('_', ' '),
          cell: (info) => info.getValue(),
          enableSorting: true,
          enableHiding: true,
        });
      });
    }

    // Actions column
    if (this.actions.length > 0) {
      columnDefs.push({
        id: 'actions',
        header: '',
        cell: () => '•••',
        enableSorting: false,
        enableHiding: false,
        size: 64,
      });
    }

    return columnDefs;
  }

  // Public methods for template
  public onRowClick(element: BaseTableData): void {
    if (!this.router || !this.route || !this.hasRowAction) {
      return;
    }
    this.router.navigate([`./${element.id}`], {
      relativeTo: this.route,
      state: element as Record<string, unknown>,
    });
  }

  public toggleColumnVisibility(columnName: string): void {
    this._columnVisibility.update((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  }

  public isColumnSelected(columnName: string): boolean {
    return !this._columnVisibility()[columnName];
  }

  public setFilter(): void {
    // TODO: Implement tab filtering
  }

  public setPageSize(size: number): void {
    this._pagination.update((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 0,
    }));
  }

  // Filter change handler
  protected _filterChanged(event: Event): void {
    this._globalFilter.set((event.target as HTMLInputElement).value);
  }

  // Method to get hidable columns
  protected _hidableColumns = computed(() =>
    this._table.getAllColumns().filter((column) => column.getCanHide())
  );

  // Utility methods for templates
  getStatusColor(status: string | number | boolean): string {
    return getStatusColor(status);
  }

  getProgressColor(percent: number): string {
    return getProgressColor(percent);
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

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'successful':
      case 'success':
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
      case 'error':
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
      case 'processing':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  // Helper methods for template
  public getCreatedAtDate(element: any): string {
    return element?.created_at
      ? new Date(element.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '';
  }

  public getCreatedAtTime(element: any): string {
    return element?.created_at
      ? new Date(element.created_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  // Helper method to get cell value as string
  public getCellValueAsString(value: unknown): string {
    return String(value || '').toLowerCase();
  }

  // Helper method to get cell value as number
  public getCellValueAsNumber(value: unknown): number {
    return Number(value) || 0;
  }

  // Helper method to format date
  public formatDateValue(value: unknown): string {
    try {
      return new Date(value as string | number).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(value || '');
    }
  }
}

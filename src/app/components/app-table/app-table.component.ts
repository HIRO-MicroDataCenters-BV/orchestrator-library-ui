import {
  DatePipe,
  DecimalPipe,
  NgFor,
  NgIf,
  TitleCasePipe,
} from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  Component,
  TrackByFunction,
  computed,
  effect,
  signal,
  untracked,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  lucideArrowUpDown,
  lucideChevronDown,
  lucideCog,
  lucideEllipsisVertical,
  lucideInfo,
  lucidePause,
  lucidePlus,
  lucideTerminal,
  lucideTrash2,
  lucideDownload,
} from '@ng-icons/lucide';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { HlmCheckboxComponent } from '@spartan-ng/ui-checkbox-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
  HlmMenuItemCheckboxDirective,
  HlmMenuItemCheckComponent,
  HlmMenuModule,
} from '@spartan-ng/ui-menu-helm';
import { BrnTableModule, PaginatorState } from '@spartan-ng/brain/table';
import {
  HlmTabsComponent,
  HlmTabsContentDirective,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/helm/tabs';
import { HlmTableModule } from '@spartan-ng/ui-table-helm';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { debounceTime } from 'rxjs';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { AppCircleProgressComponent } from '../app-circle-progress/app-circle-progress.component';
import { Observable } from 'rxjs';

export type TableData = {
  id: string;
  cluster_name: string;
  status: number; // 0-2: 0 - inactive, 1 - running, 2 - success, -1 - warning, -2 - failed
  workloads: number;
  nodes: number;
  cpu_usage: number; // percent
  memory_usage: number; // percent
};

export type TableAction = {
  id: string;
  label: string;
  icon: NgIcon;
};

export type TableActionGroup = {
  id: string;
  label?: string | null;
  actions: TableAction[];
};

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    FormsModule,
    NgIcon,
    BrnMenuTriggerDirective,
    HlmMenuModule,

    BrnTableModule,
    HlmTableModule,

    HlmButtonModule,

    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    HlmIconDirective,
    HlmInputDirective,

    HlmCheckboxComponent,
    HlmTabsComponent,
    HlmTabsContentDirective,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmMenuItemCheckComponent,
    HlmMenuItemCheckboxDirective,
    HlmBadgeDirective,
    BrnSelectModule,
    HlmSelectModule,
    TranslocoModule,
    AppCircleProgressComponent,
    NgFor,
    NgIf,
    RouterLink,
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
  @Input('hasRowAction') hasRowAction = true;

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
  private readonly _debouncedFilter = toSignal(
    toObservable(this._rawFilterInput).pipe(debounceTime(300))
  );

  private readonly _displayedIndices = signal({ start: 0, end: 0 });
  protected readonly _availablePageSizes = [5, 10, 20, 10000];
  protected readonly _pageSize = signal(this._availablePageSizes[0]);

  protected readonly _columns = computed(() => [...this.columns]);

  protected readonly _actions = computed(() => [...this.actions]);

  protected readonly _columnOptions = signal(
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

  private _items = signal<unknown[]>([]);
  private readonly _filteredItems = computed(() => {
    const colFilter = this._colFilter()?.trim()?.toLowerCase();
    if (colFilter && colFilter.length > 0) {
      console.log('Filtering with:', colFilter);
      const filtered = this._items().filter((item) => {
        // Search through all string properties of the item
        return Object.values(item as Record<string, any>).some((value) => {
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
      });
      console.log('Filtered results:', filtered.length, 'of', this._items().length);
      return filtered;
    }
    return this._items();
  });
  // TODO: Implement sorting logic for all columns
  private readonly _colSort = signal<'ASC' | 'DESC' | null>(null);
  protected readonly _filteredSortedPaginatedItems = computed(() => {
    const sort = this._colSort();
    const start = this._displayedIndices().start;
    const end = this._displayedIndices().end + 1;
    const items = this._filteredItems();
    
    if (!sort) {
      return items.slice(start, end);
    }
    
    // Generic sorting for any object with string properties
    const sortedItems = [...items].sort((p1, p2) => {
      const p1Str = JSON.stringify(p1).toLowerCase();
      const p2Str = JSON.stringify(p2).toLowerCase();
      return (sort === 'ASC' ? 1 : -1) * p1Str.localeCompare(p2Str);
    });
    
    return sortedItems.slice(start, end);
  });

  protected readonly _trackBy: TrackByFunction<unknown> = (
    _: number,
    p: unknown
  ) => (p as { id: string }).id;
  protected _totalElements = computed(() => this._filteredItems().length);

  protected readonly _onStateChange = ({
    startIndex,
    endIndex,
  }: PaginatorState) =>
    this._displayedIndices.set({ start: startIndex, end: endIndex });

  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });

  constructor() {
    effect(() => {
      const debouncedFilter = this._debouncedFilter();
      untracked(() => this._colFilter.set(debouncedFilter ?? ''));
    });
  }
  ngOnInit(): void {
    if (this.dataSource) {
      this.fetchData();
    }
  }

  fetchData(): void {
    if (this.dataSource) {
      this.dataSource.subscribe((res: unknown[]) => {
        this._items.set(res);
      });
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

  isColumnSelected(columnName: string): boolean {
    const column = this._columnOptions().find((col) => col.name === columnName);
    return column ? column.selected : false;
  }

  public onRowClick(element: unknown) {
    if (!this.router || !this.route) {
      return;
    }
    const elementWithId = element as { id: string };
    this.router.navigate([`./${elementWithId.id}`], {
      relativeTo: this.route,
      state: element as Record<string, unknown>,
    });
  }

  public setFilter(tab: string) {
    //this._colFilter.set(tab);
    console.log('tab', tab);
  }

  getStatusColor(status: string): string {
    const type = status && status.toLowerCase();
    switch (type) {
      case 'created':
      case 'running':
        return 'text-blue-700 bg-blue-100';
      case 'bound':
      case 'bind':
        return 'text-green-700 bg-green-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      case 'deleted':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  }

  getProgressColor(percent: number): string {
    if (percent >= 80) {
      return 'text-red-500';
    } else if (percent >= 60) {
      return 'text-yellow-700';
    } else {
      return 'text-green-700';
    }
  }

  getStatus(status: number): string {
    switch (status) {
      case -2:
        return 'failed';
      case 1:
        return 'running';
      case 2:
        return 'success';
      case -1:
        return 'warning';
      case 0:
        return 'inactive';
      default:
        return 'unknown';
    }
  }

  protected handleColSortChange() {
    const sort = this._colSort();
    if (sort === 'ASC') {
      this._colSort.set('DESC');
    } else if (sort === 'DESC') {
      this._colSort.set(null);
    } else {
      this._colSort.set('ASC');
    }
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
  }
}

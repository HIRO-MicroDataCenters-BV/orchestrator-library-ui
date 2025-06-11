import { NgFor } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import {
  Component,
  TrackByFunction,
  computed,
  effect,
  signal,
  untracked,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
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
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmMenuModule } from '@spartan-ng/ui-menu-helm';
import {
  BrnTableModule,
  PaginatorState,
} from '@spartan-ng/brain/table';
import { HlmTableModule } from '@spartan-ng/ui-table-helm';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { debounceTime } from 'rxjs';
import { AppCircleProgressComponent } from '../app-circle-progress/app-circle-progress.component';
import { TableData } from '../../shared/types/table.types';
import { TABLE_DATA, ACTION_ICONS as SHARED_ACTION_ICONS } from '../../shared/constants/table.constants';

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

    HlmIconDirective,
    HlmInputDirective,

    BrnSelectModule,
    HlmSelectModule,
    TranslocoModule,
    AppCircleProgressComponent,
    NgFor,
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
})
export class AppTableComponent implements OnChanges {
  @Input('columns') columns: string[] = [];
  @Input('actions') actions: string[] = [];

  @Input() filters: Array<{ key: keyof TableData, value: unknown, type?: string, compareFn?: (rowValue: unknown, filterValue: unknown) => boolean }> = [];
  @Input() sort: { key: keyof TableData, order: 'ASC' | 'DESC', compareFn?: (a: unknown, b: unknown) => number } = { key: '', order: 'ASC' } as any;
  @Input() serverSide = false;
  @Input() data: TableData[] = [];

  @Output() searchChange = new EventEmitter<any>();

  ACTION_ICONS = SHARED_ACTION_ICONS;

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

  protected readonly _allDisplayedColumns = computed(() => [
    ...this._columns(),
    'actions',
  ]);

  private readonly _items = computed(() => this.data && this.data.length ? this.data : TABLE_DATA);

  private filterRows(rows: TableData[]): TableData[] {
    if (!this.filters || !this.filters.length) return rows;
    return rows.filter(row =>
      this.filters.every(filter => {
        const key = filter.key;
        const rowValue = row[key];
        if (filter.compareFn) {
          return filter.compareFn(rowValue, filter.value);
        }
        if (filter.type === 'text') {
          return String(rowValue ?? '').toLowerCase().includes(String(filter.value ?? '').toLowerCase());
        }
        if (filter.type === 'number') {
          return rowValue === filter.value;
        }
        return true;
      })
    );
  }

  private sortRows(rows: TableData[]): TableData[] {
    if (!this.sort || !this.sort.key) return rows;
    const { key, order, compareFn } = this.sort;
    return [...rows].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (compareFn) return compareFn(aValue, bValue);
      if (aValue === bValue) return 0;
      if (order === 'ASC') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }

  private buildSearchQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (this.filters && this.filters.length) {
      this.filters.forEach(f => {
        if (f.value !== undefined && f.value !== null && f.value !== '') {
          query[String(f.key)] = f.value;
        }
      });
    }
    if (this.sort && this.sort['key']) {
      query['sort'] = String(this.sort['key']);
      query['order'] = this.sort['order'];
    }
    return query;
  }

  // Универсальный источник данных для таблицы
  protected readonly _filteredSortedPaginatedItems = computed(() => {
    if (this.serverSide) {
      return this._items();
    }
    let rows = this.filterRows(this._items());
    rows = this.sortRows(rows);
    const { start, end } = this._displayedIndices();
    return rows.slice(start, end + 1);
  });

  protected readonly _trackBy: TrackByFunction<TableData> = (
    _: number,
    p: TableData
  ) => p.id;
  protected readonly _totalElements = computed(() => {
    if (this.serverSide) {
      return this._items().length;
    }
    return this.filterRows(this._items()).length;
  });
  protected readonly _onStateChange = ({
    startIndex,
    endIndex,
  }: PaginatorState) =>
    this._displayedIndices.set({ start: startIndex, end: endIndex });

  constructor() {
    effect(() => {
      const debouncedFilter = this._debouncedFilter();
      untracked(() => this._colFilter.set(debouncedFilter ?? ''));
    });
  }

  // Реакция на изменение фильтров/сортировки/режима
  ngOnChanges(changes: SimpleChanges): void {
    if (this.serverSide && (changes['filters'] || changes['sort'])) {
      this.searchChange.emit(this.buildSearchQuery());
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case -2:
        return 'text-red-700';
      case 1:
        return 'text-green-700';
      case 2:
        return 'text-blue-700';
      case -1:
        return 'text-yellow-700';
      case 0:
        return 'text-gray-700';
      default:
        return 'text-gray-700';
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
    // Sorting logic should be handled via the sort input and parent component.
  }
}

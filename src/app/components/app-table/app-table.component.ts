import { DecimalPipe, NgFor, TitleCasePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import {
  Component,
  TrackByFunction,
  computed,
  effect,
  signal,
  untracked,
  Input,
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
import { HlmMenuModule } from '@spartan-ng/ui-menu-helm';
import {
  BrnTableModule,
  PaginatorState,
  useBrnColumnManager,
} from '@spartan-ng/brain/table';
import { HlmTableModule } from '@spartan-ng/ui-table-helm';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { debounceTime, map } from 'rxjs';
import { AppCircleProgressComponent } from '../app-circle-progress/app-circle-progress.component';

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

const TABLE_DATA: TableData[] = [
  {
    id: 'cls-001',
    cluster_name: 'Production-Main',
    status: 1,
    workloads: 24,
    nodes: 5,
    cpu_usage: 28,
    memory_usage: 15,
  },
  {
    id: 'cls-002',
    cluster_name: 'Development',
    status: -1,
    workloads: 12,
    nodes: 3,
    cpu_usage: 65,
    memory_usage: 38,
  },
  {
    id: 'cls-003',
    cluster_name: 'Testing',
    status: 0, // inactive
    workloads: 8,
    nodes: 2,
    cpu_usage: 20,
    memory_usage: 90,
  },
  {
    id: 'cls-004',
    cluster_name: 'Staging',
    status: -2,
    workloads: 18,
    nodes: 4,
    cpu_usage: 62,
    memory_usage: 55,
  },
  {
    id: 'cls-005',
    cluster_name: 'Analytics',
    status: 2, // error
    workloads: 6,
    nodes: 3,
    cpu_usage: 90,
    memory_usage: 95,
  },
  {
    id: 'cls-006',
    cluster_name: 'Data-Processing',
    status: 1,
    workloads: 32,
    nodes: 8,
    cpu_usage: 75,
    memory_usage: 80,
  },
  {
    id: 'cls-007',
    cluster_name: 'Backup',
    status: 0, // inactive
    workloads: 4,
    nodes: 2,
    cpu_usage: 10,
    memory_usage: 12,
  },
  {
    id: 'cls-008',
    cluster_name: 'ML-Training',
    status: 1,
    workloads: 16,
    nodes: 6,
    cpu_usage: 88,
    memory_usage: 92,
  },
  {
    id: 'cls-009',
    cluster_name: 'Web-Frontend',
    status: 1,
    workloads: 10,
    nodes: 3,
    cpu_usage: 55,
    memory_usage: 48,
  },
  {
    id: 'cls-010',
    cluster_name: 'API-Backend',
    status: 2, // error
    workloads: 14,
    nodes: 4,
    cpu_usage: 95,
    memory_usage: 85,
  },
  {
    id: 'cls-011',
    cluster_name: 'Database',
    status: 1,
    workloads: 8,
    nodes: 5,
    cpu_usage: 72,
    memory_usage: 68,
  },
  {
    id: 'cls-012',
    cluster_name: 'Monitoring',
    status: 1,
    workloads: 6,
    nodes: 2,
    cpu_usage: 40,
    memory_usage: 35,
  },
  {
    id: 'cls-013',
    cluster_name: 'Security',
    status: 0, // inactive
    workloads: 5,
    nodes: 2,
    cpu_usage: 15,
    memory_usage: 18,
  },
  {
    id: 'cls-014',
    cluster_name: 'Logging',
    status: 1,
    workloads: 7,
    nodes: 3,
    cpu_usage: 50,
    memory_usage: 45,
  },
  {
    id: 'cls-015',
    cluster_name: 'CI-CD',
    status: 1,
    workloads: 12,
    nodes: 4,
    cpu_usage: 65,
    memory_usage: 60,
  },
  {
    id: 'cls-016',
    cluster_name: 'Microservices',
    status: 2, // error
    workloads: 28,
    nodes: 7,
    cpu_usage: 92,
    memory_usage: 88,
  },
  {
    id: 'cls-017',
    cluster_name: 'Cache',
    status: 1,
    workloads: 4,
    nodes: 2,
    cpu_usage: 58,
    memory_usage: 52,
  },
  {
    id: 'cls-018',
    cluster_name: 'Message-Queue',
    status: 1,
    workloads: 9,
    nodes: 3,
    cpu_usage: 70,
    memory_usage: 65,
  },
  {
    id: 'cls-019',
    cluster_name: 'Storage',
    status: 0, // inactive
    workloads: 6,
    nodes: 4,
    cpu_usage: 25,
    memory_usage: 30,
  },
  {
    id: 'cls-020',
    cluster_name: 'Gateway',
    status: 1,
    workloads: 8,
    nodes: 3,
    cpu_usage: 60,
    memory_usage: 55,
  },
];

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

    DecimalPipe,
    TitleCasePipe,
    HlmIconDirective,
    HlmInputDirective,

    HlmCheckboxComponent,

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
export class AppTableComponent {
  @Input('columns') columns: string[] = [];
  @Input('actions') actions: string[] = [];

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

  protected readonly _allDisplayedColumns = computed(() => [
    ...this._columns(),
    'actions',
  ]);

  private readonly _items = signal(TABLE_DATA);
  private readonly _filteredItems = computed(() => {
    const colFilter = this._colFilter()?.trim()?.toLowerCase();
    if (colFilter && colFilter.length > 0) {
      // TODO: Implement filtering logic for all columns
      return this._items().filter((u) =>
        u.cluster_name.toLowerCase().includes(colFilter)
      );
    }
    return this._items();
  });
  // TODO: Implement sorting logic for all columns
  private readonly _colSort = signal<'ASC' | 'DESC' | null>(null);
  protected readonly _filteredSortedPaginatedItems = computed(() => {
    const sort = this._colSort();
    const start = this._displayedIndices().start;
    const end = this._displayedIndices().end + 1;
    const payments = this._filteredItems();
    if (!sort) {
      return payments.slice(start, end);
    }
    return [...payments]
      .sort(
        (p1, p2) =>
          (sort === 'ASC' ? 1 : -1) *
          p1.cluster_name.localeCompare(p2.cluster_name)
      )
      .slice(start, end);
  });

  protected readonly _trackBy: TrackByFunction<TableData> = (
    _: number,
    p: TableData
  ) => p.id;
  protected readonly _totalElements = computed(
    () => this._filteredItems().length
  );
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
    const sort = this._colSort();
    if (sort === 'ASC') {
      this._colSort.set('DESC');
    } else if (sort === 'DESC') {
      this._colSort.set(null);
    } else {
      this._colSort.set('ASC');
    }
  }
}

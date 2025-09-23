import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrnAlertDialogContentDirective } from '@spartan-ng/brain/alert-dialog';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmAlertDialogComponent, HlmAlertDialogImports } from '@spartan-ng/ui-alertdialog-helm';
import type { WorkloadItem } from './workload-deployment.component';
import { WorkloadService } from '../../../shared/services/workload.service';
import type { WorkloadDefinitionResponse } from '../../../shared/interfaces/workload.interface';

@Component({
  selector: 'app-add-workload-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmAlertDialogImports, BrnAlertDialogContentDirective, HlmBadgeDirective],
  template: `
    <hlm-alert-dialog #dialog="hlmAlertDialog">
      <hlm-alert-dialog-content *brnAlertDialogContent class="max-w-2xl w-full">
        <hlm-alert-dialog-header>
          <h3 hlmAlertDialogTitle>Schedule Workload</h3>
          <p hlmAlertDialogDescription class="mt-1 text-xs text-gray-600">Choose one: schedule an existing workload definition or create a new one.</p>
        </hlm-alert-dialog-header>

        <form (ngSubmit)="onSubmit()" class="space-y-3 mt-3">
          <!-- Section 1: Select existing workload to schedule -->
          <div class="border rounded p-3 bg-blue-50">
            <div class="flex items-center justify-between mb-1">
              <label class="text-sm font-semibold text-blue-900">1) Select existing workload</label>
              <button type="button" (click)="scheduleExisting()" [disabled]="!selectedDefinitionId || schedulingExisting" class="px-2 py-1 text-xs bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{{ schedulingExisting ? 'Scheduling...' : 'Schedule selected' }}</button>
            </div>
            <select 
              [(ngModel)]="selectedDefinitionId"
              name="definition"
              class="mt-2 w-full px-2 py-1 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option [ngValue]="''">-- None --</option>
              <option *ngFor="let d of workloadDefinitions" [ngValue]="d.id">
                {{ d.name }} ({{ d.namespace }}) — {{ d.workload_type }}
              </option>
            </select>
            <div *ngIf="!workloadDefinitions || workloadDefinitions.length === 0" class="mt-2 text-[11px] text-blue-800">
              No saved workloads found. Use section 2 below to create one.
            </div>
            <div *ngIf="selectedDefinitionId" class="mt-2 text-[11px] text-gray-600">
              <ng-container *ngIf="selectedDefinition as sel">
                <div>
                  Type:
                  <span hlmBadge [variant]="getBadgeVariant(sel.workload_type)" [class]="getBadgeClass(sel.workload_type)" size="default">
                    {{ sel.workload_type }}
                  </span>
                </div>
                <div>Estimated Energy: <span class="font-medium">{{ sel.estimated_energy_required || '-' }} W</span></div>
                <div>Description: <span class="font-medium">{{ sel.description || '-' }}</span></div>
              </ng-container>
            </div>
          </div>

          <!-- Divider -->
          <div class="flex items-center my-1">
            <div class="flex-1 h-px bg-gray-200"></div>
            <div class="px-2 text-[10px] uppercase tracking-wide text-gray-400">or</div>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <!-- Section 2: Create new workload to schedule -->
          <div class="border rounded p-3 bg-green-50">
            <div class="text-sm font-semibold text-green-900 mb-2">2) Create new workload</div>
            <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input 
              [(ngModel)]="newWorkload.name" 
              name="name"
              type="text" 
              required
              class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Workload name">
            </div>

            <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select 
              [(ngModel)]="newWorkload.type" 
              name="type"
              class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="Critical">🔥 Critical</option>
              <option value="Preferred">⭐ Preferred</option>
              <option value="Optional">💡 Optional</option>
            </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Energy (W)</label>
              <input 
                [(ngModel)]="newWorkload.energyRequirement" 
                name="energyRequirement"
                type="number" 
                min="100"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Duration (min)</label>
              <input 
                [(ngModel)]="newWorkload.estimatedDuration" 
                name="estimatedDuration"
                type="number" 
                min="1"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">CPU</label>
              <input 
                [(ngModel)]="newWorkload.cpuCores" 
                name="cpuCores"
                type="number" 
                min="1"
                max="16"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Memory (MB)</label>
              <input 
                [(ngModel)]="newWorkload.memoryMB" 
                name="memoryMB"
                type="number" 
                min="256"
                step="256"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              [(ngModel)]="newWorkload.description" 
              name="description"
              rows="2"
              class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description..."></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="onCancel()" class="px-2 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-2 py-1 text-xs bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">Schedule new</button>
            </div>
          </div>
        </form>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
})
export class AddWorkloadDialogComponent implements OnInit {
  @ViewChild('dialog', { read: HlmAlertDialogComponent }) dialog?: HlmAlertDialogComponent;

  @Output() submitted = new EventEmitter<Partial<WorkloadItem>>();

  newWorkload: Partial<WorkloadItem> = {
    name: '',
    type: 'Preferred',
    energyRequirement: 1000,
    estimatedDuration: 30,
    description: '',
    cpuCores: 1,
    memoryMB: 512
  };

  workloadDefinitions: WorkloadDefinitionResponse[] = [];
  selectedDefinitionId: string = '';
  schedulingExisting = false;
  get selectedDefinition(): WorkloadDefinitionResponse | undefined {
    return this.workloadDefinitions.find(d => String(d.id) === String(this.selectedDefinitionId));
  }

  constructor(private readonly workloadService: WorkloadService) {}

  ngOnInit(): void {
    this.workloadService.getWorkloadDefinitions(100, 0).subscribe({
      next: (items) => {
        this.workloadDefinitions = items || [];
      },
      error: () => {
        this.workloadDefinitions = [];
      }
    });
  }

  open(): void {
    this.dialog?.open();
  }

  close(): void {
    this.dialog?.close();
  }

  onSubmit(): void {
    if (this.newWorkload.name && this.newWorkload.type) {
      this.submitted.emit({ ...this.newWorkload });
      this.resetForm();
      this.close();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.close();
  }

  private resetForm(): void {
    this.newWorkload = {
      name: '',
      type: 'Preferred',
      energyRequirement: 1000,
      estimatedDuration: 30,
      description: '',
      cpuCores: 1,
      memoryMB: 512
    };
    this.selectedDefinitionId = '';
  }

  // Removed auto-populate to keep sections independent

  scheduleExisting(): void {
    const def = this.workloadDefinitions.find(d => String(d.id) === String(this.selectedDefinitionId));
    if (!def || this.schedulingExisting) return;
    this.schedulingExisting = true;
    const body = {
      name: def.name,
      namespace: def.namespace || 'default',
      estimated_energy_watts: Number(def.estimated_energy_required ?? 0),
      workload_type: def.workload_type,
      description: def.description || ''
    };
    this.workloadService.createScheduledDeployment(body).subscribe({
      next: (created) => {
        this.schedulingExisting = false;
        const mappedType = (created?.workload_type as 'Critical' | 'Preferred' | 'Optional') || 'Preferred';
        const payload: Partial<WorkloadItem> = {
          id: String(created?.id ?? 'w' + Date.now()),
          name: created?.name ?? def.name,
          type: mappedType,
          status: 'Scheduled',
          energyRequirement: Number(created?.estimated_energy_watts ?? def.estimated_energy_required ?? 0),
          estimatedDuration: 60,
          submittedAt: new Date(),
          description: created?.description ?? def.description ?? '',
          cpuCores: 1,
          memoryMB: 512
        };
        this.submitted.emit(payload);
        this.resetForm();
        this.close();
      },
      error: () => {
        this.schedulingExisting = false;
      }
    });
  }

  getBadgeVariant(type?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const t = (type || '').toLowerCase();
    if (t === 'critical') return 'destructive';
    if (t === 'preferred') return 'default';
    return 'outline';
  }

  getBadgeClass(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t === 'optional') {
      // make optional yellow outline style more visible
      return 'border-amber-300 text-amber-700';
    }
    return '';
  }
}



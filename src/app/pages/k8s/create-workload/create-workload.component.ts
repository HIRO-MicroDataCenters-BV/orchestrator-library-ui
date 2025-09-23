import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkloadService } from '../../../shared/services/workload.service';
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';

@Component({
  selector: 'app-create-workload',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmBadgeDirective],
  templateUrl: './create-workload.component.html',
  styleUrls: ['./create-workload.component.css'],
})
export class CreateWorkloadComponent implements OnInit {
  form: any = {
    name: '',
    workload_type: 'Preferred',
    estimated_energy_watts: 1000,
    namespace: 'default',
    description: '',
  };
  selectedFile: File | null = null;
  submitting = false;
  isDragOver = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  workloads: any[] = [];

  constructor(private readonly workloadService: WorkloadService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadWorkloadDefinitions();
  }

  private loadWorkloadDefinitions(): void {
    this.workloadService.getWorkloadDefinitions(100, 0).subscribe({
      next: (items) => {
        this.workloads = items || [];
      },
      error: () => {
        this.workloads = [];
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
      return 'border-amber-300 text-amber-700';
    }
    return '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const name = (file?.name || '').toLowerCase();
      if (name.endsWith('.yml') || name.endsWith('.yaml')) {
        this.selectedFile = file;
      }
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  isFormValid(): boolean {
    const nameValid = typeof this.form?.name === 'string' && this.form.name.trim().length > 0;
    const namespaceValid = typeof this.form?.namespace === 'string' && this.form.namespace.trim().length > 0;
    const typeValid = ['Critical', 'Preferred', 'Optional'].includes(this.form?.workload_type);
    const fileValid = !!this.selectedFile && /\.(ya?ml)$/i.test(this.selectedFile.name || '');
    const energy = this.form?.estimated_energy_watts;
    const energyValid = energy === undefined || energy === null || (typeof energy === 'number' && energy > 0);

    return nameValid && namespaceValid && typeValid && fileValid && energyValid;
  }

  onSubmit(): void {
    if (!this.form?.name || !this.selectedFile) return;
    this.submitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.workloadService
      .uploadWorkloadYaml({
        file: this.selectedFile,
        name: this.form.name,
        namespace: this.form.namespace,
        workload_type: this.form.workload_type,
        description: this.form.description,
        estimated_energy_required: this.form.estimated_energy_watts,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Workload created successfully.';
          this.form.name = '';
          this.form.description = '';
          this.selectedFile = null;
          this.loadWorkloadDefinitions();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.userMessage || 'Failed to create workload. Please try again.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/emdc/workloads/workload-deployment']);
  }
}



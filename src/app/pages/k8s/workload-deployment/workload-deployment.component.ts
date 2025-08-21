import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';
import { EnergyAvailabilityService } from '../../../shared/services/energy-availability.service';

export interface WorkloadItem {
  id: string;
  name: string;
  type: 'Critical' | 'Preferred' | 'Optional';
  status: 'Pending' | 'Scheduled' | 'Running' | 'Completed' | 'Failed';
  energyRequirement: number; // watts
  estimatedDuration: number; // minutes
  submittedAt: Date;
  scheduledAt?: Date;
  deadline?: Date;
  escalatedFrom?: 'Preferred' | 'Optional';
  description: string;
  cpuCores: number;
  memoryMB: number;
}

export interface EnergySchedulingRule {
  type: 'Critical' | 'Preferred' | 'Optional';
  scheduleImmediate: boolean;
  escalationTimeHours: number;
  escalatesTo?: 'Critical' | 'Preferred';
  color: string;
  bgColor: string;
  icon: string;
}

@Component({
  selector: 'app-workload-deployment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workload-deployment.component.html',
  styleUrls: ['./workload-deployment.component.css']
})
export class WorkloadDeploymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  workloads: WorkloadItem[] = [];
  availableEnergy = 0;
  totalEnergyDemand = 0;
  energyForecast: any[] = [];
  
  // Scheduling Rules
  schedulingRules: { [key: string]: EnergySchedulingRule } = {
    'Critical': {
      type: 'Critical',
      scheduleImmediate: true,
      escalationTimeHours: 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      icon: '🔥'
    },
    'Preferred': {
      type: 'Preferred',
      scheduleImmediate: false,
      escalationTimeHours: 6,
      escalatesTo: 'Critical',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      icon: '⭐'
    },
    'Optional': {
      type: 'Optional',
      scheduleImmediate: false,
      escalationTimeHours: 24,
      escalatesTo: 'Preferred',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: '💡'
    }
  };

  // New workload form
  newWorkload: Partial<WorkloadItem> = {
    name: '',
    type: 'Preferred',
    energyRequirement: 1000,
    estimatedDuration: 30,
    description: '',
    cpuCores: 1,
    memoryMB: 512
  };

  showAddWorkloadModal = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public sidebarService: HlmSidebarService,
    private energyService: EnergyAvailabilityService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadEnergyData();
      this.generateMockWorkloads();
      this.startEscalationCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEnergyData(): void {
    this.energyService.getEnergyAvailability(100, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.availability) {
            this.energyForecast = response.availability;
            // Calculate current available energy (simplified)
            this.availableEnergy = this.energyForecast
              .slice(0, 4) // Next 4 time slots
              .reduce((sum, slot) => sum + slot.available_watts, 0) / 4;
          }
          this.updateScheduling();
        },
        error: () => {
          // Fallback to mock data
          this.availableEnergy = 2500;
          this.updateScheduling();
        }
      });
  }

  private generateMockWorkloads(): void {
    const mockWorkloads: WorkloadItem[] = [
      {
        id: 'w1',
        name: 'Database Backup Job',
        type: 'Critical',
        status: 'Pending',
        energyRequirement: 800,
        estimatedDuration: 45,
        submittedAt: new Date(Date.now() - 10 * 60000),
        description: 'Daily database backup for production system',
        cpuCores: 2,
        memoryMB: 1024
      },
      {
        id: 'w2',
        name: 'ML Model Training',
        type: 'Preferred',
        status: 'Pending',
        energyRequirement: 1500,
        estimatedDuration: 120,
        submittedAt: new Date(Date.now() - 3 * 3600000),
        description: 'Training neural network model for image recognition',
        cpuCores: 4,
        memoryMB: 8192
      },
      {
        id: 'w3',
        name: 'Log Analysis',
        type: 'Optional',
        status: 'Pending',
        energyRequirement: 600,
        estimatedDuration: 60,
        submittedAt: new Date(Date.now() - 20 * 3600000),
        description: 'Analyze system logs for performance insights',
        cpuCores: 1,
        memoryMB: 2048
      },
      {
        id: 'w4',
        name: 'Security Scan',
        type: 'Critical',
        status: 'Running',
        energyRequirement: 1200,
        estimatedDuration: 90,
        submittedAt: new Date(Date.now() - 2 * 3600000),
        scheduledAt: new Date(Date.now() - 30 * 60000),
        description: 'Comprehensive security vulnerability scan',
        cpuCores: 3,
        memoryMB: 4096
      },
      {
        id: 'w5',
        name: 'Data Migration',
        type: 'Preferred',
        status: 'Scheduled',
        energyRequirement: 2000,
        estimatedDuration: 180,
        submittedAt: new Date(Date.now() - 1 * 3600000),
        scheduledAt: new Date(Date.now() + 2 * 3600000),
        description: 'Migrate legacy data to new system',
        cpuCores: 2,
        memoryMB: 6144
      }
    ];

    this.workloads = mockWorkloads;
    this.calculateTotalEnergyDemand();
  }

  private startEscalationCheck(): void {
    // Check for escalations every minute
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkForEscalations();
      });
  }

  private checkForEscalations(): void {
    const now = new Date();
    let hasChanges = false;

    this.workloads.forEach(workload => {
      if (workload.status === 'Pending') {
        const hoursWaiting = (now.getTime() - workload.submittedAt.getTime()) / (1000 * 60 * 60);
        const rule = this.schedulingRules[workload.type];

        if (rule.escalatesTo && hoursWaiting >= rule.escalationTimeHours) {
          workload.escalatedFrom = workload.type as 'Preferred' | 'Optional';
          workload.type = rule.escalatesTo as 'Critical' | 'Preferred' | 'Optional';
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      this.updateScheduling();
    }
  }

  private updateScheduling(): void {
    this.calculateTotalEnergyDemand();
    this.scheduleWorkloads();
  }

  private calculateTotalEnergyDemand(): void {
    this.totalEnergyDemand = this.workloads
      .filter(w => w.status === 'Pending' || w.status === 'Scheduled' || w.status === 'Running')
      .reduce((sum, w) => sum + w.energyRequirement, 0);
  }

  private scheduleWorkloads(): void {
    // Sort by priority: Critical > Preferred > Optional, then by submission time
    const pendingWorkloads = this.workloads
      .filter(w => w.status === 'Pending')
      .sort((a, b) => {
        const priorityOrder = { 'Critical': 3, 'Preferred': 2, 'Optional': 1 };
        if (priorityOrder[a.type] !== priorityOrder[b.type]) {
          return priorityOrder[b.type] - priorityOrder[a.type];
        }
        return a.submittedAt.getTime() - b.submittedAt.getTime();
      });

    let availableEnergyForScheduling = this.availableEnergy;

    pendingWorkloads.forEach(workload => {
      const rule = this.schedulingRules[workload.type];
      
      if (rule.scheduleImmediate || availableEnergyForScheduling >= workload.energyRequirement) {
        workload.status = 'Scheduled';
        workload.scheduledAt = new Date();
        
        if (workload.type === 'Critical') {
          // Critical workloads get scheduled immediately
          workload.scheduledAt = new Date();
        } else {
          // Schedule within appropriate timeframe
          const delayHours = workload.type === 'Preferred' ? 
            Math.random() * 6 : Math.random() * 24;
          workload.scheduledAt = new Date(Date.now() + delayHours * 3600000);
        }
        
        availableEnergyForScheduling -= workload.energyRequirement;
      }
    });
  }

  addWorkload(): void {
    if (this.newWorkload.name && this.newWorkload.type) {
      const workload: WorkloadItem = {
        id: 'w' + Date.now(),
        name: this.newWorkload.name,
        type: this.newWorkload.type as 'Critical' | 'Preferred' | 'Optional',
        status: 'Pending',
        energyRequirement: this.newWorkload.energyRequirement || 1000,
        estimatedDuration: this.newWorkload.estimatedDuration || 30,
        submittedAt: new Date(),
        description: this.newWorkload.description || '',
        cpuCores: this.newWorkload.cpuCores || 1,
        memoryMB: this.newWorkload.memoryMB || 512
      };

      this.workloads.push(workload);
      this.updateScheduling();
      this.resetForm();
      this.showAddWorkloadModal = false;
    }
  }

  deleteWorkload(workloadId: string): void {
    this.workloads = this.workloads.filter(w => w.id !== workloadId);
    this.updateScheduling();
  }

  getWorkloadsByStatus(status: string): WorkloadItem[] {
    return this.workloads.filter(w => w.status === status);
  }

  getEscalationBadge(workload: WorkloadItem): string {
    if (workload.escalatedFrom) {
      return `Escalated from ${workload.escalatedFrom}`;
    }
    return '';
  }

  getTimeUntilDeadline(workload: WorkloadItem): string {
    if (!workload.deadline) return '';
    
    const now = new Date();
    const diff = workload.deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Due soon';
    return `${hours}h remaining`;
  }

  resetForm(): void {
    this.newWorkload = {
      name: '',
      type: 'Preferred',
      energyRequirement: 1000,
      estimatedDuration: 30,
      description: '',
      cpuCores: 1,
      memoryMB: 512
    };
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Running': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEnergyUtilizationPercentage(): number {
    return this.availableEnergy > 0 ? (this.totalEnergyDemand / this.availableEnergy) * 100 : 0;
  }
}
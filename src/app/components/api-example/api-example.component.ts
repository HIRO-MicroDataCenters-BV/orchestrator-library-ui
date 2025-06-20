import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  KubernetesService,
  TuningParametersService,
  PodRequestDecisionService,
  AlertsService,
} from '../../core/services';
import {
  AlertType,
  TuningParameterResponse,
  PodRequestDecisionSchema,
  AlertResponse,
  K8sPodResponse,
  K8sNodeResponse,
} from '../../core/models';

@Component({
  selector: 'app-api-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-example-container">
      <h1>API Services Example</h1>

      <!-- Authentication Section -->
      <section class="auth-section">
        <h2>Authentication</h2>
        <div class="auth-form">
          <input
            [(ngModel)]="credentials.namespace"
            placeholder="namespace"
            class="form-input"
          />
          <input
            [(ngModel)]="credentials.service_account_name"
            type="text"
            placeholder="service_account_name"
            class="form-input"
          />
          <button
            (click)="authenticate()"
            [disabled]="loading.auth()"
            class="btn btn-primary"
          >
            {{ loading.auth() ? 'Authenticating...' : 'Login' }}
          </button>
          <div class="auth-status">
            Status:
            {{ isAuthenticated() ? 'Authenticated' : 'Not authenticated' }}
          </div>
        </div>
      </section>

      <!-- Kubernetes Section -->
      <section class="k8s-section">
        <h2>Kubernetes Operations</h2>
        <div class="operations">
          <button
            (click)="loadPods()"
            [disabled]="loading.pods()"
            class="btn btn-secondary"
          >
            {{ loading.pods() ? 'Loading...' : 'Load Pods' }}
          </button>
          <button
            (click)="loadNodes()"
            [disabled]="loading.nodes()"
            class="btn btn-secondary"
          >
            {{ loading.nodes() ? 'Loading...' : 'Load Nodes' }}
          </button>
          <button
            (click)="loadClusterInfo()"
            [disabled]="loading.cluster()"
            class="btn btn-secondary"
          >
            {{ loading.cluster() ? 'Loading...' : 'Load Cluster Info' }}
          </button>
        </div>

        <div class="results">
          <div *ngIf="pods().length > 0" class="result-section">
            <h3>Pods ({{ pods().length }})</h3>
            <pre>{{ pods() | json }}</pre>
          </div>
          <div *ngIf="nodes().length > 0" class="result-section">
            <h3>Nodes ({{ nodes().length }})</h3>
            <pre>{{ nodes() | json }}</pre>
          </div>
          <div *ngIf="clusterInfo()" class="result-section">
            <h3>Cluster Info</h3>
            <pre>{{ clusterInfo() | json }}</pre>
          </div>
        </div>
      </section>

      <!-- Tuning Parameters Section -->
      <section class="tuning-section">
        <h2>Tuning Parameters</h2>
        <div class="tuning-form">
          <h3>Create New Parameters</h3>
          <div class="form-row">
            <input
              [(ngModel)]="tuningForm.output_1"
              type="number"
              step="0.01"
              placeholder="Output 1"
              class="form-input"
            />
            <input
              [(ngModel)]="tuningForm.output_2"
              type="number"
              step="0.01"
              placeholder="Output 2"
              class="form-input"
            />
            <input
              [(ngModel)]="tuningForm.output_3"
              type="number"
              step="0.01"
              placeholder="Output 3"
              class="form-input"
            />
          </div>
          <div class="form-row">
            <input
              [(ngModel)]="tuningForm.alpha"
              type="number"
              step="0.01"
              placeholder="Alpha"
              class="form-input"
            />
            <input
              [(ngModel)]="tuningForm.beta"
              type="number"
              step="0.01"
              placeholder="Beta"
              class="form-input"
            />
            <input
              [(ngModel)]="tuningForm.gamma"
              type="number"
              step="0.01"
              placeholder="Gamma"
              class="form-input"
            />
          </div>
          <button
            (click)="createTuningParameters()"
            [disabled]="loading.tuning()"
            class="btn btn-primary"
          >
            {{ loading.tuning() ? 'Creating...' : 'Create Parameters' }}
          </button>
        </div>

        <div class="operations">
          <button
            (click)="loadLatestTuning()"
            [disabled]="loading.tuningList()"
            class="btn btn-secondary"
          >
            {{ loading.tuningList() ? 'Loading...' : 'Load Latest (10)' }}
          </button>
        </div>

        <div *ngIf="tuningParameters().length > 0" class="result-section">
          <h3>Latest Tuning Parameters</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Output 1</th>
                  <th>Output 2</th>
                  <th>Output 3</th>
                  <th>Alpha</th>
                  <th>Beta</th>
                  <th>Gamma</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let param of tuningParameters()">
                  <td>{{ param.id }}</td>
                  <td>{{ param.output_1 | number : '1.2-2' }}</td>
                  <td>{{ param.output_2 | number : '1.2-2' }}</td>
                  <td>{{ param.output_3 | number : '1.2-2' }}</td>
                  <td>{{ param.alpha | number : '1.2-2' }}</td>
                  <td>{{ param.beta | number : '1.2-2' }}</td>
                  <td>{{ param.gamma | number : '1.2-2' }}</td>
                  <td>{{ param.created_at | date : 'short' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Alerts Section -->
      <section class="alerts-section">
        <h2>Alerts Management</h2>
        <div class="alert-form">
          <h3>Create New Alert</h3>
          <select [(ngModel)]="alertForm.type" class="form-select">
            <option value="">Select Alert Type</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <textarea
            [(ngModel)]="alertForm.description"
            placeholder="Alert description"
            class="form-textarea"
          ></textarea>
          <input
            [(ngModel)]="alertForm.podId"
            placeholder="Pod ID (optional)"
            class="form-input"
          />
          <input
            [(ngModel)]="alertForm.nodeId"
            placeholder="Node ID (optional)"
            class="form-input"
          />
          <button
            (click)="createAlert()"
            [disabled]="loading.alert()"
            class="btn btn-primary"
          >
            {{ loading.alert() ? 'Creating...' : 'Create Alert' }}
          </button>
        </div>

        <div class="operations">
          <button
            (click)="loadAlerts()"
            [disabled]="loading.alertsList()"
            class="btn btn-secondary"
          >
            {{ loading.alertsList() ? 'Loading...' : 'Load Recent Alerts' }}
          </button>
        </div>

        <div *ngIf="alerts().length > 0" class="result-section">
          <h3>Recent Alerts</h3>
          <div class="alerts-list">
            <div
              *ngFor="let alert of alerts()"
              class="alert-item"
              [class]="'alert-' + alert.alert_type"
            >
              <div class="alert-header">
                <span class="alert-type">{{
                  alert.alert_type | uppercase
                }}</span>
                <span class="alert-date">{{
                  alert.created_at | date : 'short'
                }}</span>
              </div>
              <div class="alert-description">{{ alert.alert_description }}</div>
              <div class="alert-details" *ngIf="alert.pod_id || alert.node_id">
                <span *ngIf="alert.pod_id">Pod: {{ alert.pod_id }}</span>
                <span *ngIf="alert.node_id">Node: {{ alert.node_id }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Error Display -->
      <section *ngIf="error()" class="error-section">
        <h3>Last Error</h3>
        <div class="error-message">{{ error() }}</div>
      </section>
    </div>
  `,
  styles: [
    `
      .api-example-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      h1,
      h2,
      h3 {
        color: #333;
        margin-top: 0;
      }

      .auth-form,
      .tuning-form,
      .alert-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }

      .form-row {
        display: flex;
        gap: 10px;
      }

      .form-input,
      .form-select,
      .form-textarea {
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }

      .form-textarea {
        min-height: 80px;
        resize: vertical;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
        margin-right: 10px;
        margin-bottom: 10px;
      }

      .btn-secondary:hover:not(:disabled) {
        background-color: #545b62;
      }

      .auth-status {
        font-weight: bold;
        padding: 10px;
        border-radius: 4px;
        background: #e9ecef;
      }

      .operations {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }

      .result-section {
        margin-top: 20px;
        padding: 15px;
        background: white;
        border-radius: 4px;
        border: 1px solid #dee2e6;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
      }

      th {
        background-color: #f8f9fa;
        font-weight: bold;
      }

      pre {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
      }

      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .alert-item {
        padding: 15px;
        border-radius: 4px;
        border-left: 4px solid;
      }

      .alert-error {
        background: #f8d7da;
        border-left-color: #dc3545;
      }

      .alert-warning {
        background: #fff3cd;
        border-left-color: #ffc107;
      }

      .alert-info {
        background: #d1ecf1;
        border-left-color: #17a2b8;
      }

      .alert-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .alert-type {
        font-weight: bold;
        font-size: 12px;
      }

      .alert-date {
        font-size: 12px;
        color: #666;
      }

      .alert-description {
        margin-bottom: 8px;
      }

      .alert-details {
        font-size: 12px;
        color: #666;
      }

      .error-section {
        background: #f8d7da;
        border-color: #dc3545;
        color: #721c24;
      }

      .error-message {
        font-family: monospace;
        padding: 10px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 4px;
      }
    `,
  ],
})
export class ApiExampleComponent implements OnInit {
  private readonly kubernetesService = inject(KubernetesService);
  private readonly tuningService = inject(TuningParametersService);
  private readonly podDecisionService = inject(PodRequestDecisionService);
  private readonly alertsService = inject(AlertsService);

  // Reactive signals for state management
  pods = signal<any[]>([]);
  nodes = signal<any[]>([]);
  clusterInfo = signal<any>(null);
  tuningParameters = signal<TuningParameterResponse[]>([]);
  podDecisions = signal<PodRequestDecisionSchema[]>([]);
  alerts = signal<AlertResponse[]>([]);
  error = signal<string>('');

  // Loading states
  loading = {
    auth: signal(false),
    pods: signal(false),
    nodes: signal(false),
    cluster: signal(false),
    tuning: signal(false),
    tuningList: signal(false),
    alert: signal(false),
    alertsList: signal(false),
  };

  // Form data
  credentials = {
    namespace: '',
    service_account_name: '',
  };

  tuningForm = {
    output_1: 0.85,
    output_2: 0.92,
    output_3: 0.78,
    alpha: 0.1,
    beta: 0.2,
    gamma: 0.3,
  };

  alertForm = {
    type: '' as 'error' | 'warning' | 'info' | '',
    description: '',
    podId: '',
    nodeId: '',
  };

  ngOnInit() {
    this.checkAuthenticationStatus();
  }

  // Authentication methods
  checkAuthenticationStatus() {
    // Update the authentication status display
    console.log('Authentication status:', this.isAuthenticated());
  }

  isAuthenticated(): boolean {
    return this.kubernetesService.isAuthenticated();
  }

  authenticate() {
    if (!this.credentials.namespace || !this.credentials.service_account_name) {
      this.setError('credentials and service_account_name are required');
      return;
    }

    this.loading.auth.set(true);
    this.error.set('');

    this.kubernetesService
      .authenticate(
        this.credentials.namespace,
        this.credentials.service_account_name
      )
      .subscribe({
        next: (response) => {
          console.log('Authentication successful:', response);
          this.loading.auth.set(false);
          this.checkAuthenticationStatus();
        },
        error: (error) => {
          this.setError(`Authentication failed: ${error.message}`);
          this.loading.auth.set(false);
        },
      });
  }

  // Kubernetes methods
  loadPods() {
    this.loading.pods.set(true);
    this.error.set('');

    this.kubernetesService.getPods().subscribe({
      next: (response) => {
        this.pods.set(Array.isArray(response) ? response : [response]);
        this.loading.pods.set(false);
      },
      error: (error) => {
        this.setError(`Failed to load pods: ${error.message}`);
        this.loading.pods.set(false);
      },
    });
  }

  loadNodes() {
    this.loading.nodes.set(true);
    this.error.set('');

    this.kubernetesService.getNodes().subscribe({
      next: (response) => {
        this.nodes.set(Array.isArray(response) ? response : [response]);
        this.loading.nodes.set(false);
      },
      error: (error) => {
        this.setError(`Failed to load nodes: ${error.message}`);
        this.loading.nodes.set(false);
      },
    });
  }

  loadClusterInfo() {
    this.loading.cluster.set(true);
    this.error.set('');

    this.kubernetesService.getClusterInfo().subscribe({
      next: (response) => {
        this.clusterInfo.set(response);
        this.loading.cluster.set(false);
      },
      error: (error) => {
        this.setError(`Failed to load cluster info: ${error.message}`);
        this.loading.cluster.set(false);
      },
    });
  }

  // Tuning parameters methods
  createTuningParameters() {
    this.loading.tuning.set(true);
    this.error.set('');

    this.tuningService.create(this.tuningForm).subscribe({
      next: (response) => {
        console.log('Tuning parameters created:', response);
        this.loading.tuning.set(false);
        this.loadLatestTuning(); // Reload the list
      },
      error: (error) => {
        this.setError(`Failed to create tuning parameters: ${error.message}`);
        this.loading.tuning.set(false);
      },
    });
  }

  loadLatestTuning() {
    this.loading.tuningList.set(true);
    this.error.set('');

    this.tuningService.getLatest(10).subscribe({
      next: (response) => {
        this.tuningParameters.set(response);
        this.loading.tuningList.set(false);
      },
      error: (error) => {
        this.setError(`Failed to load tuning parameters: ${error.message}`);
        this.loading.tuningList.set(false);
      },
    });
  }

  // Alerts methods
  createAlert() {
    if (!this.alertForm.type || !this.alertForm.description) {
      this.setError('Alert type and description are required');
      return;
    }

    this.loading.alert.set(true);
    this.error.set('');

    const alertData = {
      alert_type: this.alertForm.type as AlertType,
      alert_description: this.alertForm.description,
      pod_id: this.alertForm.podId || undefined,
      node_id: this.alertForm.nodeId || undefined,
    };

    this.alertsService.create(alertData).subscribe({
      next: (response) => {
        console.log('Alert created:', response);
        this.loading.alert.set(false);
        this.resetAlertForm();
        this.loadAlerts(); // Reload the list
      },
      error: (error) => {
        this.setError(`Failed to create alert: ${error.message}`);
        this.loading.alert.set(false);
      },
    });
  }

  loadAlerts() {
    this.loading.alertsList.set(true);
    this.error.set('');

    this.alertsService.getPaginated(1, 20).subscribe({
      next: (response) => {
        this.alerts.set(response);
        this.loading.alertsList.set(false);
      },
      error: (error) => {
        this.setError(`Failed to load alerts: ${error.message}`);
        this.loading.alertsList.set(false);
      },
    });
  }

  // Helper methods
  private setError(message: string) {
    this.error.set(message);
    console.error(message);
  }

  private resetAlertForm() {
    this.alertForm = {
      type: '',
      description: '',
      podId: '',
      nodeId: '',
    };
  }
}

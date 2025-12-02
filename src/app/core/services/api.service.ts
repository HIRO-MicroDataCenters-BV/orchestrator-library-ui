import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  // Alert types
  Alert,
  AlertCreate,
  // Workload types
  WorkloadAction,
  WorkloadActionCreate,
  WorkloadActionUpdate,
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
  WorkloadTimingCreate,
  WorkloadTimingSchema,
  WorkloadTimingUpdate,
  WorkloadDecisionActionFlowItem,
  WorkloadDecisionActionFlowQueryParams,
  WorkloadTimingQueryParams,
  // API types
  TuningParameter,
  TuningParameterCreate,
  PodQueryParams,
  UserPodQueryParams,
  PodParentQueryParams,
  DeletePodParams,
  NodeQueryParams,
  ClusterInfoQueryParams,
  TokenQueryParams,
  TuningParameterQueryParams,
} from '../../shared/types';

/**
 * API Service
 * Provides methods for all API endpoints according to OpenAPI specification
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private token: string | null = null;

  // ===================
  // Kubernetes Pod Endpoints
  // ===================

  /**
   * List all pods in the specified namespace
   * GET /k8s_pod/
   * @param params Query parameters for filtering
   */
  listPods(params?: PodQueryParams): Observable<unknown> {
    return this.get<unknown>('/k8s_pod/', params as Record<string, unknown>);
  }

  /**
   * Delete a pod in the specified namespace
   * DELETE /k8s_pod/
   * @param params Delete pod parameters
   */
  deletePod(params: DeletePodParams): Observable<unknown> {
    return this.delete<unknown>('/k8s_pod/', params as Record<string, unknown>);
  }

  /**
   * Get the parent controller of a Kubernetes pod
   * GET /k8s_pod_parent/
   * @param params Pod parent query parameters
   */
  getPodParent(params: PodParentQueryParams): Observable<unknown> {
    return this.get<unknown>(
      '/k8s_pod_parent/',
      params as Record<string, unknown>
    );
  }

  /**
   * List all user pods excluding system pods
   * GET /k8s_user_pod/
   * @param params Query parameters for filtering
   */
  listUserPods(params?: UserPodQueryParams): Observable<unknown> {
    return this.get<unknown>(
      '/k8s_user_pod/',
      params as Record<string, unknown>
    );
  }

  // ===================
  // Kubernetes Node Endpoints
  // ===================

  /**
   * List all nodes in the cluster
   * GET /k8s_node/
   * @param params Query parameters for filtering
   */
  listNodes(params?: NodeQueryParams): Observable<unknown> {
    return this.get<unknown>('/k8s_node/', params as Record<string, unknown>);
  }

  // ===================
  // Kubernetes Cluster Endpoints
  // ===================

  /**
   * Get cluster information
   * GET /k8s_cluster_info/
   * @param params Query parameters
   */
  getClusterInfo(params?: ClusterInfoQueryParams): Observable<unknown> {
    return this.get<unknown>(
      '/k8s_cluster_info/',
      params as Record<string, unknown>
    );
  }

  /**
   * Get a read-only token for a specific service account
   * GET /k8s_get_token/
   * @param params Token request parameters
   */
  getK8sToken(params?: TokenQueryParams): Observable<unknown> {
    return this.get<unknown>(
      '/k8s_get_token/',
      params as Record<string, unknown>
    );
  }

  /**
   * Get Kubernetes Dashboard HTML page
   * GET /k8s-dashboard/
   */
  getK8sDashboard(): Observable<string> {
    return this.get<string>('/k8s-dashboard/');
  }

  // ===================
  // Tuning Parameters Endpoints
  // ===================

  /**
   * Create a new tuning parameter
   * POST /tuning_parameters/
   * @param data Tuning parameter data
   */
  createTuningParameter(
    data: TuningParameterCreate
  ): Observable<TuningParameter> {
    return this.post<TuningParameter>('/tuning_parameters/', data);
  }

  /**
   * Get list of tuning parameters with pagination and date filtering
   * GET /tuning_parameters/
   * @param params Query parameters for filtering
   */
  getTuningParameters(
    params?: TuningParameterQueryParams
  ): Observable<TuningParameter[]> {
    return this.get<TuningParameter[]>(
      '/tuning_parameters/',
      params as Record<string, unknown>
    );
  }

  /**
   * Get the latest N tuning parameters
   * GET /tuning_parameters/latest/{limit}
   * @param limit Number of latest parameters to return
   */
  getLatestTuningParameters(limit: number): Observable<TuningParameter[]> {
    return this.get<TuningParameter[]>(`/tuning_parameters/latest/${limit}`);
  }

  // ===================
  // Workload Request Decision Endpoints
  // ===================

  /**
   * Create a new workload request decision
   * POST /workload_request_decision/
   * @param data Decision data
   */
  createWorkloadDecision(
    data: WorkloadRequestDecisionCreate
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.post<WorkloadRequestDecisionSchema>(
      '/workload_request_decision/',
      data
    );
  }

  /**
   * Get all workload decisions with pagination
   * GET /workload_request_decision/
   * @param params Query parameters for filtering
   */
  getWorkloadDecisions(
    params?: Record<string, unknown>
  ): Observable<WorkloadRequestDecisionSchema[]> {
    return this.get<WorkloadRequestDecisionSchema[]>(
      '/workload_request_decision/',
      params
    );
  }

  /**
   * Get a single workload decision by ID
   * GET /workload_request_decision/{decision_id}
   * @param decisionId Decision ID
   */
  getWorkloadDecision(
    decisionId: string
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.get<WorkloadRequestDecisionSchema>(
      `/workload_request_decision/${decisionId}`
    );
  }

  /**
   * Update an existing workload decision
   * PUT /workload_request_decision/{decision_id}
   * @param decisionId Decision ID
   * @param data Updated decision data
   */
  updateWorkloadDecision(
    decisionId: string,
    data: WorkloadRequestDecisionUpdate
  ): Observable<WorkloadRequestDecisionUpdate> {
    return this.put<WorkloadRequestDecisionUpdate>(
      `/workload_request_decision/${decisionId}`,
      data
    );
  }

  /**
   * Delete a workload decision
   * DELETE /workload_request_decision/{decision_id}
   * @param decisionId Decision ID
   */
  deleteWorkloadDecision(decisionId: string): Observable<unknown> {
    return this.delete<unknown>(`/workload_request_decision/${decisionId}`);
  }

  // ===================
  // Workload Action Endpoints
  // ===================

  /**
   * Create a new workload action
   * POST /workload_action/
   * @param data Action data
   */
  createWorkloadAction(data: WorkloadActionCreate): Observable<WorkloadAction> {
    return this.post<WorkloadAction>('/workload_action/', data);
  }

  /**
   * Get all workload actions with optional filters
   * GET /workload_action/
   * @param params Query parameters for filtering
   */
  getWorkloadActions(
    params?: Record<string, unknown>
  ): Observable<WorkloadAction[]> {
    return this.get<WorkloadAction[]>('/workload_action/', params);
  }

  /**
   * Get a single workload action by ID
   * GET /workload_action/{action_id}
   * @param actionId Action ID
   */
  getWorkloadAction(actionId: string): Observable<WorkloadAction> {
    return this.get<WorkloadAction>(`/workload_action/${actionId}`);
  }

  /**
   * Update an existing workload action
   * PUT /workload_action/{action_id}
   * @param actionId Action ID
   * @param data Updated action data
   */
  updateWorkloadAction(
    actionId: string,
    data: WorkloadActionUpdate
  ): Observable<WorkloadAction> {
    return this.put<WorkloadAction>(`/workload_action/${actionId}`, data);
  }

  /**
   * Delete a workload action
   * DELETE /workload_action/{action_id}
   * @param actionId Action ID
   */
  deleteWorkloadAction(actionId: string): Observable<unknown> {
    return this.delete<unknown>(`/workload_action/${actionId}`);
  }

  // ===================
  // Alerts Endpoints
  // ===================

  /**
   * Create a new alert
   * POST /alerts/
   * @param data Alert data
   */
  createAlert(data: AlertCreate): Observable<Alert> {
    return this.post<Alert>('/alerts/', data);
  }

  /**
   * Get list of alerts with pagination
   * GET /alerts/
   * @param params Query parameters for filtering
   */
  getAlerts(params?: Record<string, unknown>): Observable<Alert[]> {
    // API returns Alert[] directly, not PaginatedResponse
    // The baseUrl is correctly set from environment.apiUrl
    return this.get<Alert[]>('/alerts/', params);
  }

  // ===================
  // Workload Decision Action Flow Endpoints
  // ===================

  /**
   * Get list of workload decision and action flows with pagination
   * GET /workload_decision_action_flow/
   * @param params Query parameters for filtering
   */
  getWorkloadDecisionActionFlow(
    params?: WorkloadDecisionActionFlowQueryParams
  ): Observable<WorkloadDecisionActionFlowItem[]> {
    return this.get<WorkloadDecisionActionFlowItem[]>(
      '/workload_decision_action_flow/',
      params as Record<string, unknown>
    );
  }

  // ===================
  // Workload Timing Endpoints
  // ===================

  /**
   * Create a new workload timing entry
   * POST /workload_timing/
   * @param data Workload timing data
   */
  createWorkloadTiming(
    data: WorkloadTimingCreate
  ): Observable<WorkloadTimingSchema> {
    return this.post<WorkloadTimingSchema>('/workload_timing/', data);
  }

  /**
   * List or filter workload timings
   * GET /workload_timing/
   * @param params Query parameters for filtering
   */
  getWorkloadTimings(
    params?: WorkloadTimingQueryParams
  ): Observable<WorkloadTimingSchema[]> {
    return this.get<WorkloadTimingSchema[]>(
      '/workload_timing/',
      params as Record<string, unknown>
    );
  }

  /**
   * Update an existing workload timing entry
   * PATCH /workload_timing/{workload_timing_id}
   * @param workloadTimingId Workload timing ID
   * @param data Updated timing data
   */
  updateWorkloadTiming(
    workloadTimingId: string,
    data: WorkloadTimingUpdate
  ): Observable<WorkloadTimingSchema> {
    return this.patch<WorkloadTimingSchema>(
      `/workload_timing/${workloadTimingId}`,
      data
    );
  }

  // ===================
  // Metrics Endpoints
  // ===================

  /**
   * Get Prometheus metrics
   * GET /metrics
   */
  getMetrics(): Observable<unknown> {
    return this.get<unknown>('/metrics');
  }

  // ===================
  // Authentication Methods
  // ===================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Logout user and clear token
   */
  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Set authentication token
   * @param token Authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // ===================
  // Private HTTP Methods
  // ===================

  private get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Observable<T> {
    return this.request<T>('GET', endpoint, null, params);
  }

  private post<T>(endpoint: string, data: unknown): Observable<T> {
    return this.request<T>('POST', endpoint, data);
  }

  private put<T>(endpoint: string, data: unknown): Observable<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  private patch<T>(endpoint: string, data: unknown): Observable<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  private delete<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Observable<T> {
    return this.request<T>('DELETE', endpoint, null, params);
  }

  private request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Observable<T> {
    this.loadingSubject.next(true);

    const url = `${this.baseUrl}${endpoint}`;
    const options: Record<string, unknown> = {
      headers: { 'Content-Type': 'application/json' },
    };

    if (this.token) {
      (options['headers'] as Record<string, string>)[
        'Authorization'
      ] = `Bearer ${this.token}`;
    }

    if (params) {
      options['params'] = this.buildParams(params);
    }

    let request$: Observable<T>;

    switch (method) {
      case 'GET':
        request$ = this.http.get<T>(url, options);
        break;
      case 'POST':
        request$ = this.http.post<T>(url, data, options);
        break;
      case 'PUT':
        request$ = this.http.put<T>(url, data, options);
        break;
      case 'PATCH':
        request$ = this.http.patch<T>(url, data, options);
        break;
      case 'DELETE':
        request$ = this.http.delete<T>(url, options);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return request$.pipe(
      catchError((error) => {
        throw error;
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  private buildParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}

import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  AlertCreateRequest,
  AlertResponse,
  PodRequestDecisionCreate,
  PodRequestDecisionUpdate,
  PodRequestDecisionSchema,
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionUpdate,
  WorkloadRequestDecisionSchema,
  WorkloadActionCreate,
  WorkloadActionUpdate,
  WorkloadAction,
  TuningParameterCreate,
  TuningParameterResponse,
  K8sPodResponse,
  K8sNodeResponse,
  K8sClusterInfoResponse,
  K8sTokenResponse,
  ApiResponse,
  ApiError,
  PaginationParams,
  DateRangeParams,
} from '../models/api.model';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = environment.tokenKey;

  /**
   * Generic request wrapper that handles common functionality
   * @param method HTTP method
   * @param url Endpoint URL (relative to API_URL)
   * @param data Request body data (for POST, PUT, PATCH)
   * @param params Query parameters
   * @returns Observable with API response
   */
  private request<T = unknown>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Observable<T> {
    const fullUrl = `${this.API_URL}${url}`;

    // Prepare headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Add authorization token if available
    const token = this.getAccessToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Prepare query parameters
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    // Make the request based on method
    let request$: Observable<any>;

    switch (method) {
      case 'GET':
        request$ = this.http.get(fullUrl, { headers, params: httpParams });
        break;
      case 'POST':
        request$ = this.http.post(fullUrl, data, {
          headers,
          params: httpParams,
        });
        break;
      case 'PUT':
        request$ = this.http.put(fullUrl, data, {
          headers,
          params: httpParams,
        });
        break;
      case 'DELETE':
        request$ = this.http.delete(fullUrl, { headers, params: httpParams });
        break;
      case 'PATCH':
        request$ = this.http.patch(fullUrl, data, {
          headers,
          params: httpParams,
        });
        break;
      default:
        return throwError(
          () => new Error(`Unsupported HTTP method: ${method}`)
        );
    }

    return request$.pipe(
      map((response: any) => response),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        status: 0,
        message: `Client Error: ${error.error.message}`,
        details: error.error,
      };
    } else {
      // Server-side error
      apiError = {
        status: error.status,
        message:
          error.error?.message || error.message || 'Unknown server error',
        details: error.error,
      };
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Save access token to localStorage
   */
  private saveAccessToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // ======================
  // Kubernetes API Methods
  // ======================

  /**
   * Get Kubernetes pods
   */
  getPods(
    namespace?: string,
    node_name?: string,
    pod_name?: string,
    pod_id?: string
  ): Observable<K8sPodResponse> {
    const params: Record<string, string> = {};
    if (namespace) params['namespace'] = namespace;
    if (node_name) params['node_name'] = node_name;
    if (pod_name) params['pod_name'] = pod_name;
    if (pod_id) params['pod_id'] = pod_id;

    return this.request<K8sPodResponse>('GET', '/k8s_pod/', undefined, params);
  }

  /**
   * Get Kubernetes pod parents
   */
  getPodParents(
    namespace?: string,
    parent_name?: string,
    parent_id?: string
  ): Observable<unknown> {
    const params: Record<string, string> = {};
    if (namespace) params['namespace'] = namespace;
    if (parent_name) params['parent_name'] = parent_name;
    if (parent_id) params['parent_id'] = parent_id;

    return this.request('GET', '/k8s_pod_parent/', undefined, params);
  }

  /**
   * Get Kubernetes user pods
   */
  getUserPods(
    namespace?: string,
    node_name?: string,
    pod_name?: string,
    pod_id?: string
  ): Observable<unknown> {
    const params: Record<string, string> = {};
    if (namespace) params['namespace'] = namespace;
    if (node_name) params['node_name'] = node_name;
    if (pod_name) params['pod_name'] = pod_name;
    if (pod_id) params['pod_id'] = pod_id;

    return this.request('GET', '/k8s_user_pod/', undefined, params);
  }

  /**
   * Get Kubernetes nodes
   */
  getNodes(
    node_name?: string,
    node_id?: string,
    namespace?: string
  ): Observable<K8sNodeResponse> {
    const params: Record<string, string> = {};
    if (node_name) params['node_name'] = node_name;
    if (node_id) params['node_id'] = node_id;
    if (namespace) params['namespace'] = namespace;

    return this.request<K8sNodeResponse>(
      'GET',
      '/k8s_node/',
      undefined,
      params
    );
  }

  /**
   * Get Kubernetes cluster info
   */
  getClusterInfo(): Observable<K8sClusterInfoResponse> {
    return this.request<K8sClusterInfoResponse>('GET', '/k8s_cluster_info/');
  }

  /**
   * Get dummy ACES UI
   */
  getDummyAcesUI(): Observable<string> {
    return this.request<string>('GET', '/dummy_aces_ui/');
  }

  /**
   * Get Kubernetes token and save to localStorage
   */
  getK8sToken(
    namespace: string,
    service_account_name: string
  ): Observable<K8sTokenResponse> {
    const params: Record<string, string> = {
      namespace,
      service_account_name,
    };

    return this.request<K8sTokenResponse>(
      'GET',
      '/k8s_get_token/',
      undefined,
      params
    ).pipe(
      map((response: K8sTokenResponse) => {
        // Save token to localStorage
        if (response.token) {
          this.saveAccessToken(response.token);
        }
        return response;
      })
    );
  }

  // ============================
  // Tuning Parameters API Methods
  // ============================

  /**
   * Create tuning parameters
   */
  createTuningParameters(
    data: TuningParameterCreate
  ): Observable<TuningParameterResponse> {
    return this.request<TuningParameterResponse>(
      'POST',
      '/tuning_parameters/',
      data
    );
  }

  /**
   * Get tuning parameters with pagination and date filtering
   */
  getTuningParameters(
    skip = 0,
    limit = 100,
    start_date?: string,
    end_date?: string
  ): Observable<TuningParameterResponse[]> {
    const params: Record<string, unknown> = { skip, limit };
    if (start_date) params['start_date'] = start_date;
    if (end_date) params['end_date'] = end_date;

    return this.request<TuningParameterResponse[]>(
      'GET',
      '/tuning_parameters/',
      undefined,
      params
    );
  }

  /**
   * Get latest tuning parameters
   */
  getLatestTuningParameters(
    limit: number
  ): Observable<TuningParameterResponse[]> {
    return this.request<TuningParameterResponse[]>(
      'GET',
      `/tuning_parameters/latest/${limit}`
    );
  }

  // ===============================
  // Workload Request Decision API Methods
  // ===============================

  /**
   * Create workload request decision
   */
  createWorkloadRequestDecision(
    data: WorkloadRequestDecisionCreate
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.request<WorkloadRequestDecisionSchema>(
      'POST',
      '/workload_request_decision/',
      data
    );
  }

  /**
   * Get workload request decisions with pagination
   */
  getWorkloadRequestDecisions(
    skip = 0,
    limit = 100
  ): Observable<WorkloadRequestDecisionSchema[]> {
    const params = { skip, limit };
    return this.request<WorkloadRequestDecisionSchema[]>(
      'GET',
      '/workload_request_decision/',
      undefined,
      params
    );
  }

  /**
   * Get workload request decision by ID
   */
  getWorkloadRequestDecisionById(
    decisionId: string
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.request<WorkloadRequestDecisionSchema>(
      'GET',
      `/workload_request_decision/${decisionId}`
    );
  }

  /**
   * Update workload request decision
   */
  updateWorkloadRequestDecision(
    decisionId: string,
    data: WorkloadRequestDecisionUpdate
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.request<WorkloadRequestDecisionSchema>(
      'PUT',
      `/workload_request_decision/${decisionId}`,
      data
    );
  }

  /**
   * Delete workload request decision
   */
  deleteWorkloadRequestDecision(decisionId: string): Observable<any> {
    return this.request('DELETE', `/workload_request_decision/${decisionId}`);
  }

  // For backward compatibility
  createPodRequestDecision(
    data: PodRequestDecisionCreate
  ): Observable<PodRequestDecisionSchema> {
    return this.createWorkloadRequestDecision(data);
  }

  getPodRequestDecisions(
    skip = 0,
    limit = 100
  ): Observable<PodRequestDecisionSchema[]> {
    return this.getWorkloadRequestDecisions(skip, limit);
  }

  getPodRequestDecisionById(
    podDecisionId: string
  ): Observable<PodRequestDecisionSchema> {
    return this.getWorkloadRequestDecisionById(podDecisionId);
  }

  updatePodRequestDecision(
    podDecisionId: string,
    data: PodRequestDecisionUpdate
  ): Observable<PodRequestDecisionSchema> {
    return this.updateWorkloadRequestDecision(podDecisionId, data);
  }

  deletePodRequestDecision(podDecisionId: string): Observable<unknown> {
    return this.deleteWorkloadRequestDecision(podDecisionId);
  }

  // ===================
  // Workload Action API Methods
  // ===================

  /**
   * Create workload action
   */
  createWorkloadAction(data: WorkloadActionCreate): Observable<WorkloadAction> {
    return this.request<WorkloadAction>('POST', '/workload_action/', data);
  }

  /**
   * Get workload actions with pagination
   */
  getWorkloadActions(
    action_type?: string,
    action_status?: string
  ): Observable<WorkloadAction[]> {
    const params: Record<string, string> = {};
    if (action_type) params['action_type'] = action_type;
    if (action_status) params['action_status'] = action_status;

    return this.request<WorkloadAction[]>(
      'GET',
      '/workload_action/',
      undefined,
      params
    );
  }

  /**
   * Get workload action by ID
   */
  getWorkloadActionById(actionId: string): Observable<WorkloadAction> {
    return this.request<WorkloadAction>('GET', `/workload_action/${actionId}`);
  }

  /**
   * Update workload action
   */
  updateWorkloadAction(
    actionId: string,
    data: WorkloadActionUpdate
  ): Observable<WorkloadAction> {
    return this.request<WorkloadAction>(
      'PUT',
      `/workload_action/${actionId}`,
      data
    );
  }

  /**
   * Delete workload action
   */
  deleteWorkloadAction(actionId: string): Observable<unknown> {
    return this.request('DELETE', `/workload_action/${actionId}`);
  }

  // ===================
  // Alerts API Methods
  // ===================

  /**
   * Create alert
   */
  createAlert(data: AlertCreateRequest): Observable<AlertResponse> {
    return this.request<AlertResponse>('POST', '/alerts/', data);
  }

  /**
   * Get alerts with pagination
   */
  getAlerts(skip = 0, limit = 100): Observable<AlertResponse[]> {
    const params = { skip, limit };
    return this.request<AlertResponse[]>('GET', '/alerts/', undefined, params);
  }

  // ===================
  // UI Methods
  // ===================

  /**
   * Get UI cluster info (legacy endpoint - may be deprecated)
   */
  getUIClusterInfo(): Observable<unknown> {
    return this.request('GET', '/ui_cluster_info/');
  }

  // ===================
  // Utility Methods
  // ===================

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear access token from localStorage
   */
  clearToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Generic method for custom requests (if needed)
   */
  customRequest<T = unknown>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Observable<T> {
    return this.request<T>(method, url, data, params);
  }
}

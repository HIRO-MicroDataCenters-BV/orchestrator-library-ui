/**
 * Unified API Service
 * Single service for all API operations based on OpenAPI specification
 * Uses centralized types and shared constants for clean architecture
 */

import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, timeout, retry } from 'rxjs/operators';

// Import shared constants
import {
  API_CONSTANTS,
  API_PATHS,
  HTTP_STATUS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  K8S_CONSTANTS,
} from '../../shared/constants';

// Import centralized types and models
import {
  // Kubernetes types
  K8sPodResponse,
  K8sNodeResponse,
  K8sTokenResponse,
  K8sClusterInfoResponse,
  K8sPodParent,
  K8sPodQueryParams,
  K8sNodeQueryParams,
  K8sPodParentQueryParams,
  K8sTokenQueryParams,
  K8sClusterInfoQueryParams,
  // Alert types
  AlertCreateRequest,
  AlertResponse,
  AlertQueryParams,
  // Tuning Parameters types
  TuningParameterCreate,
  TuningParameterResponse,
  TuningParameterQueryParams,
  // Workload Decision types
  WorkloadRequestDecisionCreate,
  WorkloadRequestDecisionSchema,
  WorkloadRequestDecisionUpdate,
  // Workload Action types
  WorkloadActionCreate,
  WorkloadAction,
  WorkloadActionUpdate,
  // Common types
  MessageResponse,
  CommonQueryParams,
  HttpMethod,
} from '../../shared/models';

// Import safe storage utilities
import { TokenStorage } from '../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONSTANTS.BASE_URL;

  // Loading state management
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  /**
   * Universal request method with built-in error handling, retries and timeout
   */
  private request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Observable<T> {
    this.setLoading(true);

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders();
    const httpParams = this.buildParams(params);

    let request$: Observable<T>;
    const options = { headers, params: httpParams };

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
      case 'DELETE':
        request$ = this.http.delete<T>(url, options);
        break;
      case 'PATCH':
        request$ = this.http.patch<T>(url, data, options);
        break;
      default:
        return throwError(() => new Error(`Unsupported method: ${method}`));
    }

    return request$.pipe(
      timeout(API_CONSTANTS.TIMEOUT),
      retry({
        count: API_CONSTANTS.RETRY_ATTEMPTS,
        delay: API_CONSTANTS.RETRY_DELAY,
        resetOnSuccess: true,
      }),
      map((response) => {
        this.setLoading(false);
        return response;
      }),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Build HTTP headers with authentication and content type
   */
  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Build HTTP parameters, filtering out empty values
   */
  private buildParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return httpParams;
  }

  /**
   * Centralized error handling using application constants
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = ERROR_MESSAGES.GENERIC as string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message || (ERROR_MESSAGES.NETWORK as string);
    } else {
      // Server-side error using HTTP_STATUS constants
      switch (error.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED as string;
          this.handleUnauthorizedError();
          break;
        case HTTP_STATUS.FORBIDDEN:
          errorMessage = ERROR_MESSAGES.FORBIDDEN as string;
          break;
        case HTTP_STATUS.NOT_FOUND:
          errorMessage = ERROR_MESSAGES.NOT_FOUND as string;
          break;
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          errorMessage = ERROR_MESSAGES.VALIDATION as string;
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR as string;
          break;
        default:
          errorMessage =
            error.error?.message || (ERROR_MESSAGES.GENERIC as string);
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handle unauthorized error by clearing token
   */
  private handleUnauthorizedError(): void {
    this.clearToken();
    console.warn('Unauthorized access - token cleared');
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // ===================
  // Token management using safe storage utilities and constants
  // ===================

  private getToken(): string | null {
    return TokenStorage.getAccessToken(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private setToken(token: string): void {
    TokenStorage.setAccessToken(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  private clearToken(): void {
    TokenStorage.clearAccessToken(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // ===================
  // KUBERNETES API
  // Based on OpenAPI paths: /k8s_*
  // ===================

  /**
   * GET /k8s_pod/ - List all pods in specified namespace
   */
  listPods(params?: K8sPodQueryParams): Observable<K8sPodResponse> {
    return this.request<K8sPodResponse>('GET', '/k8s_pod/', undefined, params);
  }

  /**
   * GET /k8s_pod_parent/ - Get pod parent controller
   */
  getPodParent(params: K8sPodParentQueryParams): Observable<K8sPodParent> {
    return this.request<K8sPodParent>(
      'GET',
      '/k8s_pod_parent/',
      undefined,
      params
    );
  }

  /**
   * GET /k8s_user_pod/ - List user pods (excluding system pods)
   */
  listUserPods(params?: K8sPodQueryParams): Observable<K8sPodResponse> {
    return this.request<K8sPodResponse>(
      'GET',
      '/k8s_user_pod/',
      undefined,
      params
    );
  }

  /**
   * GET /k8s_node/ - List all nodes in cluster
   */
  listNodes(params?: K8sNodeQueryParams): Observable<K8sNodeResponse> {
    return this.request<K8sNodeResponse>(
      'GET',
      '/k8s_node/',
      undefined,
      params
    );
  }

  /**
   * GET /k8s_cluster_info/ - Get cluster information
   */
  getClusterInfo(
    params?: K8sClusterInfoQueryParams
  ): Observable<K8sClusterInfoResponse> {
    const defaultParams = { advanced: false, ...params };
    return this.request<K8sClusterInfoResponse>(
      'GET',
      '/k8s_cluster_info/',
      undefined,
      defaultParams
    );
  }

  /**
   * GET /k8s_get_token/ - Get read-only token for service account
   */
  getK8sToken(params?: K8sTokenQueryParams): Observable<K8sTokenResponse> {
    const defaultParams = {
      namespace: K8S_CONSTANTS.DEFAULT_VALUES.NAMESPACE,
      service_account_name: K8S_CONSTANTS.DEFAULT_VALUES.SERVICE_ACCOUNT_NAME,
      ...params,
    };

    return this.request<K8sTokenResponse>(
      'GET',
      '/k8s_get_token/',
      undefined,
      defaultParams
    ).pipe(
      map((response) => {
        if (response.token) {
          this.setToken(response.token);
        }
        return response;
      })
    );
  }

  // ===================
  // TUNING PARAMETERS API
  // Based on OpenAPI paths: /tuning_parameters/*
  // ===================

  /**
   * POST /tuning_parameters/ - Create tuning parameter
   */
  createTuningParameter(
    data: TuningParameterCreate
  ): Observable<TuningParameterResponse> {
    return this.request<TuningParameterResponse>(
      'POST',
      `${API_PATHS.TUNING_PARAMETERS}/`,
      data
    );
  }

  /**
   * GET /tuning_parameters/ - Get tuning parameters with pagination and filtering
   */
  getTuningParameters(
    params?: TuningParameterQueryParams
  ): Observable<TuningParameterResponse[]> {
    const defaultParams = { skip: 0, limit: 100, ...params };
    return this.request<TuningParameterResponse[]>(
      'GET',
      `${API_PATHS.TUNING_PARAMETERS}/`,
      undefined,
      defaultParams
    );
  }

  /**
   * GET /tuning_parameters/latest/{limit} - Get latest tuning parameters
   */
  getLatestTuningParameters(
    limit: number
  ): Observable<TuningParameterResponse[]> {
    return this.request<TuningParameterResponse[]>(
      'GET',
      `${API_PATHS.TUNING_PARAMETERS}/latest/${limit}`
    );
  }

  // ===================
  // WORKLOAD REQUEST DECISION API
  // Based on OpenAPI paths: /workload_request_decision/*
  // ===================

  /**
   * POST /workload_request_decision/ - Create workload request decision
   */
  createWorkloadDecision(
    data: WorkloadRequestDecisionCreate
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.request<WorkloadRequestDecisionSchema>(
      'POST',
      `${API_PATHS.WORKLOAD_DECISIONS}/`,
      data
    );
  }

  /**
   * GET /workload_request_decision/ - Get all workload decisions with pagination
   */
  getWorkloadDecisions(
    params?: CommonQueryParams
  ): Observable<WorkloadRequestDecisionSchema[]> {
    const defaultParams = { skip: 0, limit: 100, ...params };
    return this.request<WorkloadRequestDecisionSchema[]>(
      'GET',
      `${API_PATHS.WORKLOAD_DECISIONS}/`,
      undefined,
      defaultParams
    );
  }

  /**
   * GET /workload_request_decision/{decision_id} - Get workload decision by ID
   */
  getWorkloadDecision(
    decisionId: string
  ): Observable<WorkloadRequestDecisionSchema> {
    return this.request<WorkloadRequestDecisionSchema>(
      'GET',
      `${API_PATHS.WORKLOAD_DECISIONS}/${decisionId}`
    );
  }

  /**
   * PUT /workload_request_decision/{decision_id} - Update workload decision
   */
  updateWorkloadDecision(
    decisionId: string,
    data: WorkloadRequestDecisionUpdate
  ): Observable<WorkloadRequestDecisionUpdate> {
    return this.request<WorkloadRequestDecisionUpdate>(
      'PUT',
      `${API_PATHS.WORKLOAD_DECISIONS}/${decisionId}`,
      data
    );
  }

  /**
   * DELETE /workload_request_decision/{decision_id} - Delete workload decision
   */
  deleteWorkloadDecision(decisionId: string): Observable<MessageResponse> {
    return this.request<MessageResponse>(
      'DELETE',
      `${API_PATHS.WORKLOAD_DECISIONS}/${decisionId}`
    );
  }

  // ===================
  // ALERTS API
  // Based on OpenAPI paths: /alerts/*
  // ===================

  /**
   * POST /alerts/ - Create alert
   */
  createAlert(data: AlertCreateRequest): Observable<AlertResponse> {
    return this.request<AlertResponse>('POST', `${API_PATHS.ALERTS}/`, data);
  }

  /**
   * GET /alerts/ - Get alerts with pagination
   */
  getAlerts(params?: AlertQueryParams): Observable<AlertResponse[]> {
    const defaultParams = { skip: 0, limit: 100, ...params };
    return this.request<AlertResponse[]>(
      'GET',
      `${API_PATHS.ALERTS}/`,
      undefined,
      defaultParams
    );
  }

  // ===================
  // WORKLOAD ACTION API
  // Based on OpenAPI paths: /workload_action/*
  // ===================

  /**
   * POST /workload_action/ - Create workload action
   */
  createWorkloadAction(data: WorkloadActionCreate): Observable<WorkloadAction> {
    return this.request<WorkloadAction>(
      'POST',
      `${API_PATHS.WORKLOAD_ACTIONS}/`,
      data
    );
  }

  /**
   * GET /workload_action/ - Get all workload actions with optional filters
   */
  getWorkloadActions(params?: {
    action_type?: string;
    action_status?: string;
  }): Observable<WorkloadAction[]> {
    return this.request<WorkloadAction[]>(
      'GET',
      `${API_PATHS.WORKLOAD_ACTIONS}/`,
      undefined,
      params
    );
  }

  /**
   * GET /workload_action/{action_id} - Get workload action by ID
   */
  getWorkloadAction(actionId: string): Observable<WorkloadAction> {
    return this.request<WorkloadAction>(
      'GET',
      `${API_PATHS.WORKLOAD_ACTIONS}/${actionId}`
    );
  }

  /**
   * PUT /workload_action/{action_id} - Update workload action
   */
  updateWorkloadAction(
    actionId: string,
    data: WorkloadActionUpdate
  ): Observable<WorkloadAction> {
    return this.request<WorkloadAction>(
      'PUT',
      `${API_PATHS.WORKLOAD_ACTIONS}/${actionId}`,
      data
    );
  }

  /**
   * DELETE /workload_action/{action_id} - Delete workload action
   */
  deleteWorkloadAction(actionId: string): Observable<MessageResponse> {
    return this.request<MessageResponse>(
      'DELETE',
      `${API_PATHS.WORKLOAD_ACTIONS}/${actionId}`
    );
  }

  // ===================
  // DUMMY ACES UI API
  // Based on OpenAPI paths: /dummy_aces_ui/*
  // ===================

  /**
   * GET /dummy_aces_ui/ - Get dummy UI HTML
   */
  getDummyAcesUI(): Observable<string> {
    return this.request<string>('GET', '/dummy_aces_ui/');
  }

  // ===================
  // CONVENIENCE METHODS
  // ===================

  /**
   * Check if user is authenticated by checking token existence
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout user by clearing stored token
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Get current loading state as observable
   */
  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  /**
   * Get current loading state synchronously
   */
  getLoadingState(): boolean {
    return this.loadingSubject.value;
  }

  // ===================
  // BACKWARD COMPATIBILITY ALIASES
  // Preserves existing method names for zero breaking changes
  // ===================

  // Kubernetes aliases
  getPods = this.listPods;
  getNodes = this.listNodes;
  getK8sTokenAlias = this.getK8sToken;

  // Workload Decision aliases
  getPodRequestDecisions = this.getWorkloadDecisions;
  getPodRequestDecision = this.getWorkloadDecision;
  createPodRequestDecision = this.createWorkloadDecision;
  updatePodRequestDecision = this.updateWorkloadDecision;
  deletePodRequestDecision = this.deleteWorkloadDecision;

  // Workload Action aliases
  getWorkloadActionById = this.getWorkloadAction;
}

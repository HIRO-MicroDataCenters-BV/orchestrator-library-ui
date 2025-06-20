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
  private request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    params?: { [key: string]: any }
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
  private getAccessToken(): string | null {
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
    const params: any = {};
    if (namespace) params.namespace = namespace;
    if (node_name) params.node_name = node_name;
    if (pod_name) params.pod_name = pod_name;
    if (pod_id) params.pod_id = pod_id;

    return this.request<K8sPodResponse>('GET', '/k8s_pod/', undefined, params);
  }

  /**
   * Get Kubernetes pod parents
   */
  getPodParents(
    namespace?: string,
    parent_name?: string,
    parent_id?: string
  ): Observable<any> {
    const params: any = {};
    if (namespace) params.namespace = namespace;
    if (parent_name) params.parent_name = parent_name;
    if (parent_id) params.parent_id = parent_id;

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
  ): Observable<any> {
    const params: any = {};
    if (namespace) params.namespace = namespace;
    if (node_name) params.node_name = node_name;
    if (pod_name) params.pod_name = pod_name;
    if (pod_id) params.pod_id = pod_id;

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
    const params: any = {};
    if (node_name) params.node_name = node_name;
    if (node_id) params.node_id = node_id;
    if (namespace) params.namespace = namespace;

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
   * Get UI cluster info
   */
  getUIClusterInfo(): Observable<any> {
    return this.request('GET', '/ui_cluster_info/');
  }

  /**
   * Get Kubernetes token and save to localStorage
   */
  getK8sToken(
    namespace: string,
    service_account_name: string
  ): Observable<K8sTokenResponse> {
    const params = { namespace, service_account_name };

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
    skip: number = 0,
    limit: number = 100,
    start_date?: string,
    end_date?: string
  ): Observable<TuningParameterResponse[]> {
    const params: any = { skip, limit };
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

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
  // Pod Request Decision API Methods
  // ===============================

  /**
   * Create pod request decision
   */
  createPodRequestDecision(
    data: PodRequestDecisionCreate
  ): Observable<PodRequestDecisionSchema> {
    return this.request<PodRequestDecisionSchema>(
      'POST',
      '/pod_request_decision/',
      data
    );
  }

  /**
   * Get pod request decisions with pagination
   */
  getPodRequestDecisions(
    skip: number = 0,
    limit: number = 100
  ): Observable<PodRequestDecisionSchema[]> {
    const params = { skip, limit };
    return this.request<PodRequestDecisionSchema[]>(
      'GET',
      '/pod_request_decision/',
      undefined,
      params
    );
  }

  /**
   * Get pod request decision by ID
   */
  getPodRequestDecisionById(
    podDecisionId: string
  ): Observable<PodRequestDecisionSchema> {
    return this.request<PodRequestDecisionSchema>(
      'GET',
      `/pod_request_decision/${podDecisionId}`
    );
  }

  /**
   * Update pod request decision
   */
  updatePodRequestDecision(
    podDecisionId: string,
    data: PodRequestDecisionUpdate
  ): Observable<PodRequestDecisionSchema> {
    return this.request<PodRequestDecisionSchema>(
      'PUT',
      `/pod_request_decision/${podDecisionId}`,
      data
    );
  }

  /**
   * Delete pod request decision
   */
  deletePodRequestDecision(podDecisionId: string): Observable<any> {
    return this.request('DELETE', `/pod_request_decision/${podDecisionId}`);
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
  getAlerts(
    skip: number = 0,
    limit: number = 100
  ): Observable<AlertResponse[]> {
    const params = { skip, limit };
    return this.request<AlertResponse[]>('GET', '/alerts/', undefined, params);
  }

  // ===================
  // UI Methods
  // ===================

  /**
   * Get dummy ACES UI
   */
  getDummyAcesUI(): Observable<string> {
    return this.request<string>('GET', '/dummy_aces_ui/');
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
  customRequest<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    params?: { [key: string]: any }
  ): Observable<T> {
    return this.request<T>(method, url, data, params);
  }
}

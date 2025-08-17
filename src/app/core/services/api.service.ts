import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { MessageResponse } from '../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly baseUrl = this.configService.apiUrl;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private token: string | null = null;

  /**
   * Get all pods from Kubernetes cluster
   * @param params Query parameters for filtering
   */
  listPods(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/k8s_pod/', params);
  }

  /**
   * Get all nodes from Kubernetes cluster
   * @param params Query parameters for filtering
   */
  listNodes(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/k8s_node/', params);
  }

  /**
   * Get cluster information
   * @param params Query parameters
   */
  getClusterInfo(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/k8s_cluster_info/', params);
  }

  /**
   * Get Kubernetes service account token
   * @param params Token request parameters
   */
  getK8sToken(params?: Record<string, unknown>): Observable<unknown> {
    const defaultParams = {
      namespace: 'hiros',
      service_account: 'readonly-user',
      ...params,
    };
    return this.get<unknown>('/k8s_get_token/', defaultParams);
  }

  /**
   * Get all workload decisions
   * @param params Query parameters for filtering
   */
  getWorkloadDecisions(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/workload_request_decision/', params);
  }

  /**
   * Get specific workload decision by ID
   * @param id Decision ID
   */
  getWorkloadDecision(id: string): Observable<unknown> {
    return this.get<unknown>(`/workload_request_decision/${id}`);
  }

  /**
   * Create new workload decision
   * @param data Decision data
   */
  createWorkloadDecision(data: unknown): Observable<unknown> {
    return this.post<unknown>('/workload_request_decision/', data);
  }

  /**
   * Update existing workload decision
   * @param id Decision ID
   * @param data Updated decision data
   */
  updateWorkloadDecision(id: string, data: unknown): Observable<unknown> {
    return this.put<unknown>(`/workload_request_decision/${id}`, data);
  }

  /**
   * Delete workload decision
   * @param id Decision ID
   */
  deleteWorkloadDecision(id: string): Observable<MessageResponse> {
    return this.delete<MessageResponse>(`/workload_request_decision/${id}`);
  }

  /**
   * Get all workload actions
   * @param params Query parameters for filtering
   */
  getWorkloadActions(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/workload_action/', params);
  }

  /**
   * Get specific workload action by ID
   * @param id Action ID
   */
  getWorkloadAction(id: string): Observable<unknown> {
    return this.get<unknown>(`/workload_action/${id}`);
  }

  /**
   * Create new workload action
   * @param data Action data
   */
  createWorkloadAction(data: unknown): Observable<unknown> {
    return this.post<unknown>('/workload_action/', data);
  }

  /**
   * Update existing workload action
   * @param id Action ID
   * @param data Updated action data
   */
  updateWorkloadAction(id: string, data: unknown): Observable<unknown> {
    return this.put<unknown>(`/workload_action/${id}`, data);
  }

  /**
   * Delete workload action
   * @param id Action ID
   */
  deleteWorkloadAction(id: string): Observable<MessageResponse> {
    return this.delete<MessageResponse>(`/workload_action/${id}`);
  }

  /**
   * Get all alerts
   * @param params Query parameters for filtering
   */
  getAlerts(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/alerts/', params);
  }

  /**
   * Create new alert
   * @param data Alert data
   */
  createAlert(data: unknown): Observable<unknown> {
    return this.post<unknown>('/alerts/', data);
  }

  /**
   * Get tuning parameters
   * @param params Query parameters for filtering
   */
  getTuningParameters(params?: Record<string, unknown>): Observable<unknown> {
    return this.get<unknown>('/tuning_parameters/', params);
  }

  /**
   * Create new tuning parameter
   * @param data Parameter data
   */
  createTuningParameter(data: unknown): Observable<unknown> {
    return this.post<unknown>('/tuning_parameters/', data);
  }

  /**
   * Get latest tuning parameters
   * @param limit Number of parameters to retrieve
   */
  getLatestTuningParameters(limit: number): Observable<unknown> {
    return this.get<unknown>(`/tuning_parameters/latest/${limit}`);
  }

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

  private delete<T>(endpoint: string): Observable<T> {
    return this.request<T>('DELETE', endpoint);
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

  getPods = this.listPods;
  getNodes = this.listNodes;
  getPodRequestDecisions = this.getWorkloadDecisions;
}

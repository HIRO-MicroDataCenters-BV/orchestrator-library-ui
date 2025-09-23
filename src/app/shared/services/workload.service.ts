import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Pod,
  PodsResponse,
  Deployment,
  DeploymentsResponse,
  Service,
  ServicesResponse,
  Namespace,
  NamespacesResponse,
  ScheduledDeployment,
  WorkloadDefinitionResponse
} from '../interfaces/workload.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkloadService {
  private readonly baseUrl = `${environment.backendBaseUrl}/api/kubernetes`;
  private readonly deploymentApiUrl = `${environment.backendBaseUrl}/app/definitions`;
  private readonly workloadDefinitionsApiUrl = `${environment.backendBaseUrl}/app/definitions`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieve all pods from a specific namespace
   * @param namespace - Kubernetes namespace (default: 'energy-metrics')
   * @returns Observable<PodsResponse>
   */
  getPods(namespace = 'workspace'): Observable<PodsResponse> {
    console.log(this.baseUrl)
    console.log(environment.backendBaseUrl);
    const params = new HttpParams().set('namespace', namespace);

    const fullUrl = `${this.baseUrl}/pods?${params.toString()}`;
    console.log('🚀 Making HTTP GET request to:', fullUrl);

    return this.http.get<PodsResponse>(`${this.baseUrl}/pods`, { params });
  }

  /**
   * Get pods from all namespaces
   * @returns Observable<PodsResponse>
   */
  getAllPods(): Observable<PodsResponse> {
    console.log('🚀 Making HTTP GET request to get all pods');
    return this.http.get<PodsResponse>(`${this.baseUrl}/pods`);
  }

  /**
   * Get pods filtered by node name
   * @param namespace - Kubernetes namespace
   * @param nodeName - Node name to filter by
   * @returns Observable<PodsResponse>
   */
  getPodsByNode(namespace: string, nodeName: string): Observable<PodsResponse> {
    let params = new HttpParams();
    if (namespace) {
      params = params.set('namespace', namespace);
    }
    if (nodeName) {
      params = params.set('node', nodeName);
    }

    const fullUrl = `${this.baseUrl}/pods?${params.toString()}`;
    console.log('🚀 Making HTTP GET request to:', fullUrl);

    return this.http.get<PodsResponse>(`${this.baseUrl}/pods`, { params });
  }

  /**
   * Get pods filtered by status
   * @param namespace - Kubernetes namespace
   * @param status - Pod status to filter by (Running, Pending, Failed, etc.)
   * @returns Observable<PodsResponse>
   */
  getPodsByStatus(namespace: string, status: string): Observable<PodsResponse> {
    let params = new HttpParams();
    if (namespace) {
      params = params.set('namespace', namespace);
    }
    if (status) {
      params = params.set('status', status);
    }

    const fullUrl = `${this.baseUrl}/pods?${params.toString()}`;
    console.log('🚀 Making HTTP GET request to:', fullUrl);

    return this.http.get<PodsResponse>(`${this.baseUrl}/pods`, { params });
  }

  /**
   * Get all deployments from a specific namespace
   * @param namespace - Kubernetes namespace
   * @returns Observable<DeploymentsResponse>
   */
  getDeployments(namespace = 'energy-metrics'): Observable<DeploymentsResponse> {
    const params = new HttpParams().set('namespace', namespace);

    const fullUrl = `${this.baseUrl}/deployments?${params.toString()}`;
    console.log('🚀 Making HTTP GET request to:', fullUrl);

    return this.http.get<DeploymentsResponse>(`${this.baseUrl}/deployments`, { params });
  }

  /**
   * Get all services from a specific namespace
   * @param namespace - Kubernetes namespace
   * @returns Observable<ServicesResponse>
   */
  getServices(namespace = 'energy-metrics'): Observable<ServicesResponse> {
    const params = new HttpParams().set('namespace', namespace);

    const fullUrl = `${this.baseUrl}/services?${params.toString()}`;
    console.log('🚀 Making HTTP GET request to:', fullUrl);

    return this.http.get<ServicesResponse>(`${this.baseUrl}/services`, { params });
  }

  /**
   * Get all namespaces
   * @returns Observable<NamespacesResponse>
   */
  getNamespaces(): Observable<NamespacesResponse> {
    console.log('🚀 Making HTTP GET request to get all namespaces');
    return this.http.get<NamespacesResponse>(`${this.baseUrl}/namespaces`);
  }

  /**
   * Get scheduled deployments (energy-aware scheduler)
   * @param limit - number of items to return
   * @param offset - pagination offset
   */
  getScheduledDeployments(limit = 100, offset = 0): Observable<ScheduledDeployment[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    const fullUrl = `${this.deploymentApiUrl}?${params.toString()}`;
    console.log('🚀 Fetching scheduled deployments from:', fullUrl);

    return this.http.get<ScheduledDeployment[]>(`${this.deploymentApiUrl}`, { params });
  }

  /**
   * Create a scheduled deployment (workload)
   */
  createScheduledDeployment(body: {
    name: string;
    namespace: string;
    estimated_energy_watts: number;
    workload_type: string;
    description?: string;
  }): Observable<ScheduledDeployment> {
    const url = `${this.deploymentApiUrl}/deployments`;
    console.log('🚀 Creating scheduled deployment at:', url, body);
    return this.http.post<ScheduledDeployment>(url, body);
  }

  /**
   * Upload YAML to create workload definition
   */
  uploadWorkloadYaml(payload: {
    file: File;
    name: string;
    namespace?: string;
    workload_type?: string;
    description?: string;
    estimated_energy_required?: number;
  }): Observable<WorkloadDefinitionResponse> {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('name', payload.name);
    form.append('namespace', payload.namespace || 'default');
    form.append('workload_type', payload.workload_type || 'Optional');
    if (payload.description) form.append('description', payload.description);
    if (
      payload.estimated_energy_required !== undefined &&
      payload.estimated_energy_required !== null
    ) {
      form.append('estimated_energy_required', String(payload.estimated_energy_required));
    }

    const url = `${this.workloadDefinitionsApiUrl}/upload`;
    console.log('🚀 Uploading workload YAML to:', url, payload.name);
    return this.http.post<WorkloadDefinitionResponse>(url, form);
  }

  /**
   * List created workload definitions
   */
  getWorkloadDefinitions(limit = 100, offset = 0): Observable<WorkloadDefinitionResponse[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);
    const url = `${this.workloadDefinitionsApiUrl}/`;
    console.log('🚀 Fetching workload definitions from:', `${url}?${params.toString()}`);
    return this.http.get<WorkloadDefinitionResponse[]>(url, { params });
  }
}

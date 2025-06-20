import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { K8sPodResponse, K8sNodeResponse, K8sClusterInfoResponse, K8sTokenResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class KubernetesService {
  private readonly apiService = inject(ApiService);

  /**
   * Get Kubernetes pods with optional filtering
   * @param filters Optional filters for pods
   */
  getPods(filters?: {
    namespace?: string;
    node_name?: string;
    pod_name?: string;
    pod_id?: string;
  }): Observable<K8sPodResponse> {
    return this.apiService.getPods(
      filters?.namespace,
      filters?.node_name,
      filters?.pod_name,
      filters?.pod_id
    );
  }

  /**
   * Get Kubernetes pod parents with optional filtering
   * @param filters Optional filters for pod parents
   */
  getPodParents(filters?: {
    namespace?: string;
    parent_name?: string;
    parent_id?: string;
  }): Observable<any> {
    return this.apiService.getPodParents(
      filters?.namespace,
      filters?.parent_name,
      filters?.parent_id
    );
  }

  /**
   * Get Kubernetes user pods with optional filtering
   * @param filters Optional filters for user pods
   */
  getUserPods(filters?: {
    namespace?: string;
    node_name?: string;
    pod_name?: string;
    pod_id?: string;
  }): Observable<any> {
    return this.apiService.getUserPods(
      filters?.namespace,
      filters?.node_name,
      filters?.pod_name,
      filters?.pod_id
    );
  }

  /**
   * Get Kubernetes nodes with optional filtering
   * @param filters Optional filters for nodes
   */
  getNodes(filters?: {
    node_name?: string;
    node_id?: string;
    namespace?: string;
  }): Observable<K8sNodeResponse> {
    return this.apiService.getNodes(
      filters?.node_name,
      filters?.node_id,
      filters?.namespace
    );
  }

  /**
   * Get Kubernetes cluster information
   */
  getClusterInfo(): Observable<K8sClusterInfoResponse> {
    return this.apiService.getClusterInfo();
  }

  /**
   * Get UI cluster information
   */
  getUIClusterInfo(): Observable<any> {
    return this.apiService.getUIClusterInfo();
  }

  /**
   * Authenticate and get Kubernetes token
   * @param username Kubernetes username
   * @param password Kubernetes password
   */
  authenticate(username: string, password: string): Observable<K8sTokenResponse> {
    if (!username || !password) {
      return throwError(() => new Error('Username and password are required'));
    }

    return this.apiService.getK8sToken(username, password);
  }

  /**
   * Check if user is authenticated with Kubernetes
   */
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  /**
   * Logout from Kubernetes (clear token)
   */
  logout(): void {
    this.apiService.clearToken();
  }

  /**
   * Get pods by namespace
   * @param namespace Kubernetes namespace
   */
  getPodsByNamespace(namespace: string): Observable<K8sPodResponse> {
    return this.getPods({ namespace });
  }

  /**
   * Get pods by node
   * @param nodeName Node name
   */
  getPodsByNode(nodeName: string): Observable<K8sPodResponse> {
    return this.getPods({ node_name: nodeName });
  }

  /**
   * Get specific pod by ID
   * @param podId Pod ID
   */
  getPodById(podId: string): Observable<K8sPodResponse> {
    return this.getPods({ pod_id: podId });
  }

  /**
   * Get specific node by ID
   * @param nodeId Node ID
   */
  getNodeById(nodeId: string): Observable<K8sNodeResponse> {
    return this.getNodes({ node_id: nodeId });
  }

  /**
   * Get nodes by namespace
   * @param namespace Kubernetes namespace
   */
  getNodesByNamespace(namespace: string): Observable<K8sNodeResponse> {
    return this.getNodes({ namespace });
  }
}

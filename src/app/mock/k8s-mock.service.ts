import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class K8sMockService {

  /**
   * Mock K8s token response
   */
  getK8sToken(): Observable<unknown> {
    const mockTokenResponse = {
      token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJWaVJaMm5iczZXYVhYX3VfNGNFRkJHaS1FT0VzdGRmOUNsVlFLdzZxM2MifQ.eyJhdWQiOlsia3ViZXJuZXRlcy5kZWZhdWx0LnN2YyJdLCJleHAiOjE3MjQyNDMxNjQsImlhdCI6MTcyNDIzOTU2NCwiaXNzIjoiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJoaXJvcyIsInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJyZWFkb25seS11c2VyIiwidWlkIjoiYzVkMjU4ZjYtODE3ZC00MTQ5LWE4Y2YtOGY3YjNlMzQ2YzJkIn19LCJuYmYiOjE3MjQyMzk1NjQsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpoaXJvczpyZWFkb25seS11c2VyIn0',
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      namespace: 'hiros',
      service_account: 'readonly-user'
    };

    return of(mockTokenResponse).pipe(delay(300));
  }

  /**
   * Mock K8s cluster information
   */
  getClusterInfo(): Observable<unknown> {
    const mockClusterInfo = {
      cluster_name: 'mock-cluster',
      kubernetes_version: 'v1.28.3',
      node_count: 5,
      pod_count: 127,
      namespace_count: 12,
      status: 'healthy',
      api_server_url: 'https://mock-cluster.example.com:6443',
      cluster_cidr: '10.244.0.0/16',
      service_cidr: '10.96.0.0/12',
      dns_service_ip: '10.96.0.10'
    };

    return of(mockClusterInfo).pipe(delay(500));
  }

  /**
   * Mock K8s pods list
   */
  getPods(): Observable<unknown> {
    const mockPods = [
      {
        id: 'pod-1',
        name: 'nginx-deployment-6b7d88f99d-abc12',
        namespace: 'default',
        status: 'Running',
        node_name: 'worker-node-1',
        created_at: '2024-01-15T10:30:00Z',
        labels: {
          app: 'nginx',
          'pod-template-hash': '6b7d88f99d'
        }
      },
      {
        id: 'pod-2',
        name: 'redis-deployment-7c8d9f88e-def34',
        namespace: 'default',
        status: 'Running',
        node_name: 'worker-node-2',
        created_at: '2024-01-15T09:15:00Z',
        labels: {
          app: 'redis',
          'pod-template-hash': '7c8d9f88e'
        }
      },
      {
        id: 'pod-3',
        name: 'api-server-5f6g7h88i-ghi56',
        namespace: 'hiros',
        status: 'Running',
        node_name: 'master-node-1',
        created_at: '2024-01-15T08:45:00Z',
        labels: {
          app: 'api-server',
          'pod-template-hash': '5f6g7h88i'
        }
      }
    ];

    return of(mockPods).pipe(delay(400));
  }

  /**
   * Mock K8s nodes list
   */
  getNodes(): Observable<unknown> {
    const mockNodes = [
      {
        id: 'node-1',
        name: 'master-node-1',
        status: 'Ready',
        role: 'master',
        version: 'v1.28.3',
        created_at: '2024-01-10T12:00:00Z',
        capacity: {
          cpu: '4',
          memory: '8Gi',
          pods: '110'
        }
      },
      {
        id: 'node-2',
        name: 'worker-node-1',
        status: 'Ready',
        role: 'worker',
        version: 'v1.28.3',
        created_at: '2024-01-10T12:05:00Z',
        capacity: {
          cpu: '8',
          memory: '16Gi',
          pods: '110'
        }
      },
      {
        id: 'node-3',
        name: 'worker-node-2',
        status: 'Ready',
        role: 'worker',
        version: 'v1.28.3',
        created_at: '2024-01-10T12:10:00Z',
        capacity: {
          cpu: '8',
          memory: '16Gi',
          pods: '110'
        }
      }
    ];

    return of(mockNodes).pipe(delay(350));
  }
}

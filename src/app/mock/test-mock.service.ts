import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestMockService {

  /**
   * Mock DEX authentication response
   */
  mockDexAuth(login: string, password: string): Observable<unknown> {
    const mockResponse = {
      success: true,
      sessionCookie: 'mock-session-cookie-12345',
      tokens: {
        access_token: 'mock-access-token-abcdef',
        id_token: 'mock-id-token-ghijkl',
        refresh_token: 'mock-refresh-token-mnopqr'
      },
      user: {
        email: login,
        name: 'Mock User',
        groups: ['admin', 'developers'],
        preferred_username: login.split('@')[0]
      },
      expires_in: 3600
    };

    // Simulate authentication delay
    return of(mockResponse).pipe(delay(1200));
  }

  /**
   * Mock API request for authenticated endpoints
   */
  mockApiRequest(endpoint: string, method: string = 'GET'): Observable<unknown> {
    const mockResponses: Record<string, unknown> = {
      '/pipeline/apis/v1beta1/pipelines': {
        pipelines: [
          {
            id: 'pipeline-1',
            name: 'data-processing-pipeline',
            status: 'running',
            created_at: '2024-01-15T10:30:00Z',
            description: 'Mock data processing pipeline'
          },
          {
            id: 'pipeline-2',
            name: 'ml-training-pipeline',
            status: 'completed',
            created_at: '2024-01-15T09:15:00Z',
            description: 'Mock ML training pipeline'
          }
        ],
        total: 2
      },
      '/api/health': {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        components: {
          database: 'healthy',
          redis: 'healthy',
          storage: 'healthy'
        }
      },
      '/iframe-dashboard/api/v1/namespace': {
        namespaces: [
          { name: 'default', status: 'Active' },
          { name: 'hiros', status: 'Active' },
          { name: 'kube-system', status: 'Active' }
        ]
      },
      '/iframe-grafana/api/health': {
        commit: 'mock-commit-hash',
        database: 'ok',
        version: '9.5.0'
      },
      '/iframe-cog/health': {
        status: 'UP',
        components: {
          db: { status: 'UP' },
          diskSpace: { status: 'UP', details: { free: 50000000000 } }
        }
      },
      '/dex/.well-known/openid_configuration': {
        issuer: 'http://localhost:5556/dex',
        authorization_endpoint: 'http://localhost:5556/dex/auth',
        token_endpoint: 'http://localhost:5556/dex/token',
        userinfo_endpoint: 'http://localhost:5556/dex/userinfo',
        jwks_uri: 'http://localhost:5556/dex/keys',
        response_types_supported: ['code', 'token', 'id_token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256']
      },
      '/authservice/oidc/callback': {
        message: 'Callback endpoint is available',
        supported_methods: ['POST'],
        parameters: ['code', 'state']
      }
    };

    const response = mockResponses[endpoint] || {
      message: `Mock response for ${endpoint}`,
      method: method,
      timestamp: new Date().toISOString()
    };

    // Simulate network delay
    const delay_ms = Math.random() * 500 + 200; // 200-700ms
    return of(response).pipe(delay(delay_ms));
  }

  /**
   * Mock proxy endpoint tests
   */
  mockProxyTest(endpoint: string): Observable<unknown> {
    return this.mockApiRequest(endpoint);
  }

  /**
   * Mock session validation
   */
  mockSessionValidation(): Observable<unknown> {
    const mockSession = {
      valid: true,
      user: {
        id: 'mock-user-123',
        email: 'admin@hiro.com',
        name: 'Mock Admin User',
        roles: ['admin', 'developer'],
        permissions: ['read', 'write', 'admin']
      },
      session: {
        id: 'session-456',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        last_activity: new Date().toISOString()
      }
    };

    return of(mockSession).pipe(delay(300));
  }

  /**
   * Mock error responses for testing error handling
   */
  mockErrorResponse(errorType: 'network' | 'auth' | 'forbidden' | 'server' = 'network'): Observable<never> {
    let error: any;

    switch (errorType) {
      case 'network':
        error = {
          status: 0,
          message: 'Network connection failed',
          error: 'Connection timeout'
        };
        break;
      case 'auth':
        error = {
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized'
        };
        break;
      case 'forbidden':
        error = {
          status: 403,
          message: 'Access forbidden',
          error: 'Insufficient permissions'
        };
        break;
      case 'server':
        error = {
          status: 500,
          message: 'Internal server error',
          error: 'Something went wrong on the server'
        };
        break;
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.error(error);
      }, 800);
    });
  }

  /**
   * Mock performance metrics for testing
   */
  mockPerformanceMetrics(): Observable<unknown> {
    const metrics = {
      response_times: {
        avg: Math.random() * 200 + 50, // 50-250ms
        min: Math.random() * 50 + 10,  // 10-60ms
        max: Math.random() * 500 + 200 // 200-700ms
      },
      success_rate: Math.random() * 10 + 90, // 90-100%
      error_rate: Math.random() * 5, // 0-5%
      throughput: Math.random() * 1000 + 500, // 500-1500 req/min
      active_connections: Math.floor(Math.random() * 100 + 10), // 10-110
      cpu_usage: Math.random() * 50 + 20, // 20-70%
      memory_usage: Math.random() * 40 + 30, // 30-70%
      timestamp: new Date().toISOString()
    };

    return of(metrics).pipe(delay(400));
  }

  /**
   * Mock configuration data
   */
  mockConfiguration(): Observable<unknown> {
    const config = {
      environment: 'development',
      debug_mode: true,
      proxy_endpoints: [
        { name: 'API Backend', url: '/api', status: 'active' },
        { name: 'Dashboard', url: '/iframe-dashboard', status: 'active' },
        { name: 'Grafana', url: '/iframe-grafana', status: 'active' },
        { name: 'COG Service', url: '/iframe-cog', status: 'active' },
        { name: 'DEX Auth', url: '/dex', status: 'active' },
        { name: 'AuthService', url: '/authservice', status: 'active' }
      ],
      features: {
        mock_data: true,
        debug_logging: true,
        performance_monitoring: true,
        error_tracking: true
      },
      timeouts: {
        api_request: 5000,
        authentication: 10000,
        proxy_request: 8000
      },
      last_updated: new Date().toISOString()
    };

    return of(config).pipe(delay(250));
  }

  /**
   * Mock test scenario generator
   */
  generateTestScenario(scenarioType: 'success' | 'mixed' | 'failure'): Observable<unknown[]> {
    const scenarios = {
      success: [
        { name: 'All endpoints responding', success_rate: 100 },
        { name: 'Fast response times', avg_response: 150 },
        { name: 'No authentication errors', auth_errors: 0 }
      ],
      mixed: [
        { name: 'Some endpoints slow', success_rate: 85 },
        { name: 'Intermittent auth issues', avg_response: 300 },
        { name: 'Occasional timeouts', auth_errors: 2 }
      ],
      failure: [
        { name: 'Multiple endpoints down', success_rate: 40 },
        { name: 'Authentication failures', avg_response: 1000 },
        { name: 'High error rate', auth_errors: 8 }
      ]
    };

    return of(scenarios[scenarioType]).pipe(delay(100));
  }
}

# API Services Documentation

This document describes the API services architecture and provides usage examples for the Orchestrator Library UI application.

## Overview

The API services are organized into several layers:

1. **ApiService** - Core service that handles HTTP requests, authentication, and error handling
2. **Specialized Services** - Domain-specific services that use ApiService for their operations
3. **Models** - TypeScript interfaces defining the data structures

## Architecture

```
├── ApiService (Core)
│   ├── Generic request wrapper
│   ├── Token management
│   ├── Error handling
│   └── Base HTTP operations
│
├── KubernetesService
│   ├── Pod operations
│   ├── Node operations
│   ├── Cluster info
│   └── Authentication
│
├── TuningParametersService
│   ├── CRUD operations
│   ├── Statistics
│   └── Validation
│
├── PodRequestDecisionService
│   ├── Decision management
│   ├── Resource updates
│   └── Status tracking
│
└── AlertsService
    ├── Alert creation
    ├── Filtering
    └── Statistics
```

## Core ApiService

The `ApiService` provides a generic request wrapper that:
- Automatically adds authentication tokens
- Handles common error scenarios
- Provides consistent response formatting
- Manages localStorage token operations

### Usage

```typescript
import { ApiService } from './api.service';

// Direct usage (rarely needed)
this.apiService.customRequest('GET', '/custom-endpoint', null, { param: 'value' });
```

## Authentication Flow

### Getting Kubernetes Token

```typescript
import { KubernetesService } from './kubernetes.service';

// Authenticate with Kubernetes
this.kubernetesService.authenticate('username', 'password').subscribe({
  next: (response) => {
    console.log('Token obtained:', response.access_token);
    // Token is automatically saved to localStorage
  },
  error: (error) => {
    console.error('Authentication failed:', error);
  }
});
```

## Kubernetes Operations

### Getting Pods

```typescript
import { KubernetesService } from './kubernetes.service';

// Get all pods
this.kubernetesService.getPods().subscribe(pods => {
  console.log('All pods:', pods);
});

// Get pods with filters
this.kubernetesService.getPods({
  namespace: 'default',
  node_name: 'worker-1'
}).subscribe(pods => {
  console.log('Filtered pods:', pods);
});

// Get pods by namespace
this.kubernetesService.getPodsByNamespace('kube-system').subscribe(pods => {
  console.log('System pods:', pods);
});
```

### Getting Nodes

```typescript
// Get all nodes
this.kubernetesService.getNodes().subscribe(nodes => {
  console.log('All nodes:', nodes);
});

// Get specific node
this.kubernetesService.getNodeById('node-123').subscribe(node => {
  console.log('Node details:', node);
});
```

### Cluster Information

```typescript
// Get cluster info
this.kubernetesService.getClusterInfo().subscribe(info => {
  console.log('Cluster info:', info);
});

// Get UI-specific cluster info
this.kubernetesService.getUIClusterInfo().subscribe(info => {
  console.log('UI cluster info:', info);
});
```

## Tuning Parameters

### Creating Parameters

```typescript
import { TuningParametersService } from './tuning-parameters.service';

// Create new tuning parameters
const params = {
  output_1: 0.85,
  output_2: 0.92,
  output_3: 0.78,
  alpha: 0.1,
  beta: 0.2,
  gamma: 0.3
};

this.tuningService.create(params).subscribe({
  next: (response) => {
    console.log('Parameters created:', response);
  },
  error: (error) => {
    console.error('Creation failed:', error);
  }
});

// Using validation helper
this.tuningService.createWithValidation(
  { output1: 0.85, output2: 0.92, output3: 0.78 },
  { alpha: 0.1, beta: 0.2, gamma: 0.3 }
).subscribe(response => {
  console.log('Parameters created with validation:', response);
});
```

### Retrieving Parameters

```typescript
// Get all parameters with pagination
this.tuningService.getAll({ skip: 0, limit: 50 }).subscribe(params => {
  console.log('Parameters:', params);
});

// Get latest parameters
this.tuningService.getLatest(10).subscribe(params => {
  console.log('Latest 10 parameters:', params);
});

// Get parameters by date range
this.tuningService.getByDateRange('2024-01-01', '2024-01-31').subscribe(params => {
  console.log('January parameters:', params);
});

// Get today's parameters
this.tuningService.getToday().subscribe(params => {
  console.log('Today\'s parameters:', params);
});
```

### Statistics

```typescript
this.tuningService.getAll().subscribe(params => {
  const stats = this.tuningService.getStatistics(params);
  console.log('Statistics:', stats);
  // Output: { count, averages, ranges }
});
```

## Pod Request Decisions

### Creating Decisions

```typescript
import { PodRequestDecisionService } from './pod-request-decision.service';

// Direct creation
const decision = {
  pod_id: 'pod-123',
  pod_name: 'my-app',
  namespace: 'default',
  node_id: 'node-456',
  is_elastic: true,
  queue_name: 'high-priority',
  demand_cpu: 100,
  demand_memory: 256,
  demand_slack_cpu: 50,
  demand_slack_memory: 128,
  is_decision_status: true,
  pod_parent_id: 'deployment-789',
  pod_parent_kind: 'Deployment'
};

this.podDecisionService.create(decision).subscribe(response => {
  console.log('Decision created:', response);
});

// Using builder pattern
this.podDecisionService.createDecisionBuilder()
  .setPod('pod-123', 'my-app')
  .setNamespace('default')
  .setNode('node-456')
  .setElastic(true)
  .setQueue('high-priority')
  .setResources(100, 256)
  .setSlackResources(50, 128)
  .setDecisionStatus(true)
  .setParent('deployment-789', 'Deployment')
  .build()
  .subscribe(response => {
    console.log('Decision created with builder:', response);
  });
```

### Managing Decisions

```typescript
// Get all decisions
this.podDecisionService.getAll().subscribe(decisions => {
  console.log('All decisions:', decisions);
});

// Get paginated decisions
this.podDecisionService.getPaginated(1, 20).subscribe(decisions => {
  console.log('Page 1 decisions:', decisions);
});

// Get specific decision
this.podDecisionService.getById('decision-123').subscribe(decision => {
  console.log('Decision details:', decision);
});

// Update decision
this.podDecisionService.update('decision-123', {
  is_decision_status: false,
  demand_cpu: 150
}).subscribe(updated => {
  console.log('Decision updated:', updated);
});

// Update resources
this.podDecisionService.updateResources('decision-123', {
  demand_cpu: 200,
  demand_memory: 512
}).subscribe(updated => {
  console.log('Resources updated:', updated);
});

// Delete decision
this.podDecisionService.delete('decision-123').subscribe(() => {
  console.log('Decision deleted');
});
```

### Filtering and Statistics

```typescript
this.podDecisionService.getAll().subscribe(decisions => {
  // Filter decisions
  const elasticDecisions = this.podDecisionService.filterDecisions(decisions, {
    isElastic: true
  });

  const namespaceDecisions = this.podDecisionService.filterDecisions(decisions, {
    namespace: 'production'
  });

  // Get statistics
  const stats = this.podDecisionService.getResourceStatistics(decisions);
  console.log('Resource statistics:', stats);
});
```

## Alerts Management

### Creating Alerts

```typescript
import { AlertsService, AlertType } from './alerts.service';

// Create different types of alerts
this.alertsService.createError('Pod failed to start', 'pod-123').subscribe(alert => {
  console.log('Error alert created:', alert);
});

this.alertsService.createWarning('High CPU usage detected', undefined, 'node-456').subscribe(alert => {
  console.log('Warning alert created:', alert);
});

this.alertsService.createInfo('Deployment completed successfully').subscribe(alert => {
  console.log('Info alert created:', alert);
});

// Using builder pattern
this.alertsService.createAlertBuilder()
  .forError()
  .setDescription('Critical system failure')
  .setPodId('pod-123')
  .setNodeId('node-456')
  .build()
  .subscribe(alert => {
    console.log('Alert created with builder:', alert);
  });
```

### Managing Alerts

```typescript
// Get all alerts
this.alertsService.getAll().subscribe(alerts => {
  console.log('All alerts:', alerts);
});

// Get paginated alerts
this.alertsService.getPaginated(1, 50).subscribe(alerts => {
  console.log('Page 1 alerts:', alerts);
});

// Filter alerts
this.alertsService.getAll().subscribe(alerts => {
  const errorAlerts = this.alertsService.filterByType(alerts, AlertType.ERROR);
  const podAlerts = this.alertsService.filterByPodId(alerts, 'pod-123');
  const recentAlerts = this.alertsService.getRecentAlerts(alerts, 24); // Last 24 hours
  
  console.log('Error alerts:', errorAlerts);
  console.log('Pod alerts:', podAlerts);
  console.log('Recent alerts:', recentAlerts);
});
```

### Alert Statistics

```typescript
this.alertsService.getAll().subscribe(alerts => {
  const stats = this.alertsService.getStatistics(alerts);
  console.log('Alert statistics:', stats);
  
  const grouped = this.alertsService.groupByType(alerts);
  console.log('Grouped alerts:', grouped);
});
```

## Component Integration Example

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { 
  KubernetesService, 
  TuningParametersService, 
  AlertsService 
} from '../core/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly kubernetesService = inject(KubernetesService);
  private readonly tuningService = inject(TuningParametersService);
  private readonly alertsService = inject(AlertsService);

  pods$ = this.kubernetesService.getPods();
  nodes$ = this.kubernetesService.getNodes();
  latestParams$ = this.tuningService.getLatest(5);
  recentAlerts$ = this.alertsService.getPaginated(1, 10);

  ngOnInit() {
    // Authentication check
    if (!this.kubernetesService.isAuthenticated()) {
      this.authenticate();
    }
    
    this.loadDashboardData();
  }

  private authenticate() {
    this.kubernetesService.authenticate('user', 'pass').subscribe({
      next: () => this.loadDashboardData(),
      error: (error) => this.handleError(error)
    });
  }

  private loadDashboardData() {
    // Load dashboard data after authentication
    this.pods$.subscribe(pods => {
      console.log('Dashboard pods loaded:', pods);
    });
  }

  private handleError(error: any) {
    console.error('Dashboard error:', error);
    this.alertsService.createError(`Dashboard error: ${error.message}`).subscribe();
  }
}
```

## Error Handling

All services use consistent error handling through the `ApiService`. Errors are returned as `ApiError` objects:

```typescript
interface ApiError {
  status: number;
  message: string;
  details?: any;
}
```

### Error Handling Example

```typescript
this.kubernetesService.getPods().subscribe({
  next: (pods) => {
    // Handle success
  },
  error: (error: ApiError) => {
    switch (error.status) {
      case 401:
        // Handle unauthorized
        console.log('Authentication required');
        break;
      case 403:
        // Handle forbidden
        console.log('Access denied');
        break;
      case 500:
        // Handle server error
        console.log('Server error:', error.message);
        break;
      default:
        console.log('Unknown error:', error);
    }
  }
});
```

## Best Practices

1. **Always handle errors** - Use proper error handling in subscribe blocks
2. **Use specialized services** - Prefer domain-specific services over direct ApiService usage
3. **Leverage builders** - Use builder patterns for complex object creation
4. **Check authentication** - Verify authentication status before making requests
5. **Use pagination** - Always use pagination for list operations
6. **Validate data** - Services include built-in validation, but additional client-side validation is recommended
7. **Handle loading states** - Implement proper loading indicators in components
8. **Cache when appropriate** - Consider caching frequently accessed data

## Environment Configuration

Make sure your `environment.ts` file includes the correct API configuration:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api', // or your API base URL
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user'
};
```

## Dependencies

The services require the following Angular modules to be imported in your `app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};
```

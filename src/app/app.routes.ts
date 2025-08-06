import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ErrorLayoutComponent } from './layouts/error-layout/error-layout.component';

export const routes: Routes = [
  // Protected routes (require authentication)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
      },
      {
        path: 'cog',
        loadComponent: () =>
          import('./pages/cog/cog.component').then((m) => m.CogComponent),
      },
      {
        path: 'k8s',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/k8s/k8s.component').then((m) => m.K8sComponent),
          },
          {
            path: 'energy-prediction',
            loadComponent: () =>
              import('./pages/k8s/energy-prediction/energy-prediction.component').then(
                (m) => m.EnergyPredictionComponent
              ),
            data: { title: 'Energy Prediction' },
          },
          {
            path: 'energy-prediction-v2',
            loadComponent: () =>
              import('./pages/k8s/energy-prediction-v2/energy-prediction-v2.component').then(
                (m) => m.EnergyPredictionV2Component
              ),
            data: { title: 'Energy Prediction V2' },
          },
          {
            path: 'full-chart',
            loadComponent: () =>
              import('./pages/k8s/full-chart/full-chart.component').then(
                (m) => m.FullChartComponent
              ),
            data: { title: 'Full Chart' },
          },
        ],
      },
      {
        path: 'emdc',
        children: [
          {
            path: 'workloads',
            children: [
              {
                path: 'request_decisions',
                loadComponent: () =>
                  import(
                    './pages/emdc/request_decisions/request_decisions.component'
                  ).then((m) => m.RequestDecisionsComponent),
                data: { title: 'Request Decisions' },
              },
              {
                path: 'actions',
                loadComponent: () =>
                  import('./pages/emdc/actions/actions.component').then(
                    (m) => m.ActionsComponent
                  ),
                data: { title: 'Actions' },
              },
            ],
          },
          {
            path: 'alerts',
            loadComponent: () =>
              import('./pages/emdc/alerts/alerts.component').then(
                (m) => m.AlertsComponent
              ),
            data: { title: 'Actions' },
          },
        ],
      },
    ],
  },
  {
    path: 'error',
    component: ErrorLayoutComponent,
    children: [
      {
        path: '404',
        loadComponent: () =>
          import('./pages/error/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
        data: { title: '404 - Not Found' },
      },
      {
        path: '500',
        loadComponent: () =>
          import('./pages/error/server-error/server-error.component').then(
            (m) => m.ServerErrorComponent
          ),
        data: { title: '500 - Server Error' },
      },
    ],
  },
  { path: '**', redirectTo: '/error/404' },
];

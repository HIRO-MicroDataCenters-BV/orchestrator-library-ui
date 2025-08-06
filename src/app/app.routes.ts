import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ErrorLayoutComponent } from './layouts/error-layout/error-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard, GuestGuard } from './core/services/auth';

export const routes: Routes = [
  // Auth routes (public, for non-authenticated users)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        data: { title: 'Login' },
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./pages/auth/callback/callback.component').then(
            (m) => m.CallbackComponent
          ),
        data: { title: 'Authentication Callback' },
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Ambassador Auth callback route (public)
  {
    path: 'authservice/oidc/callback',
    loadComponent: () =>
      import('./pages/auth/callback/callback.component').then(
        (m) => m.CallbackComponent
      ),
    data: { title: 'Authentication Callback' },
  },

  // Protected routes (require authentication)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
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
        data: { title: 'Overview' },
      },
      {
        path: 'cog',
        loadComponent: () =>
          import('./pages/cog/cog.component').then((m) => m.CogComponent),
        data: { title: 'COG' },
      },
      {
        path: 'k8s',
        loadComponent: () =>
          import('./pages/k8s/k8s.component').then((m) => m.K8sComponent),
        data: { title: 'Kubernetes Dashboard' },
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
            data: { title: 'Alerts' },
          },
        ],
      },
    ],
  },

  // Error routes (public)
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
        path: '403',
        loadComponent: () =>
          import('./pages/error/forbidden/forbidden.component').then(
            (m) => m.ForbiddenComponent
          ),
        data: { title: '403 - Access Denied' },
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

  // Auth-specific error routes without layout guards
  {
    path: 'auth/unauthorized',
    loadComponent: () =>
      import('./pages/error/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
    data: { title: 'Unauthorized' },
  },
  {
    path: 'auth/forbidden',
    loadComponent: () =>
      import('./pages/error/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent
      ),
    data: { title: 'Access Denied' },
  },

  {
    path: 'test/proxy',
    loadComponent: () =>
      import('./pages/test/proxy-test.component').then(
        (m) => m.ProxyTestComponent
      ),
    data: { title: 'Proxy Test' },
  },

  // Fallback routes
  { path: '**', redirectTo: '/error/404' },
];

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'emdc/workloads/request_decisions/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'emdc/workloads/actions/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'emdc/alerts/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

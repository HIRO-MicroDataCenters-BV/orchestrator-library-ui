import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Proxy middleware configuration for iframe routes
 */
const proxyConfig = {
  '/iframe-dashboard/**': {
    target: 'http://51.44.28.47:30016',
    changeOrigin: true,
    pathRewrite: { '^/iframe-dashboard': '' },
    onProxyRes: (proxyRes, req, res) => {
      // Handle CORS and iframe headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
      proxyRes.headers['access-control-allow-methods'] =
        'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] =
        'Origin, X-Requested-With, Content-Type, Accept, Authorization';

      // Remove X-Frame-Options to allow iframe embedding
      delete proxyRes.headers['x-frame-options'];

      // Set CSP to allow iframe embedding
      proxyRes.headers['content-security-policy'] = proxyRes.headers[
        'content-security-policy'
      ]
        ? proxyRes.headers['content-security-policy'].replace(
            /frame-ancestors[^;]*;?/g,
            ''
          ) + '; frame-ancestors *'
        : 'frame-ancestors *';
    },
  },
  '/iframe-grafana/**': {
    target: 'http://51.44.28.47:30000',
    changeOrigin: true,
    pathRewrite: { '^/iframe-grafana': '' },
    onProxyRes: (proxyRes, req, res) => {
      // Handle CORS and iframe headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
      proxyRes.headers['access-control-allow-methods'] =
        'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] =
        'Origin, X-Requested-With, Content-Type, Accept, Authorization';

      // Remove X-Frame-Options to allow iframe embedding
      delete proxyRes.headers['x-frame-options'];

      // Set CSP to allow iframe embedding
      proxyRes.headers['content-security-policy'] = proxyRes.headers[
        'content-security-policy'
      ]
        ? proxyRes.headers['content-security-policy'].replace(
            /frame-ancestors[^;]*;?/g,
            ''
          ) + '; frame-ancestors *'
        : 'frame-ancestors *';
    },
    onProxyReq: (proxyReq, req, res) => {
      // Extract token from query parameter and add to Authorization header
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('access_token');

      if (token) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
        // Remove token from URL to avoid passing it to Grafana
        url.searchParams.delete('access_token');
        proxyReq.path = url.pathname + url.search;
      } else if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
  },
  '/iframe-cog/**': {
    target: 'https://dashboard.cog.hiro-develop.nl',
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/iframe-cog': '' },
    onProxyRes: (proxyRes, req, res) => {
      // Handle CORS and iframe headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
      proxyRes.headers['access-control-allow-methods'] =
        'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] =
        'Origin, X-Requested-With, Content-Type, Accept, Authorization';

      // Remove X-Frame-Options to allow iframe embedding
      delete proxyRes.headers['x-frame-options'];

      // Set CSP to allow iframe embedding
      proxyRes.headers['content-security-policy'] = proxyRes.headers[
        'content-security-policy'
      ]
        ? proxyRes.headers['content-security-policy'].replace(
            /frame-ancestors[^;]*;?/g,
            ''
          ) + '; frame-ancestors *'
        : 'frame-ancestors *';
    },
    onProxyReq: (proxyReq, req, res) => {
      // Extract token from query parameter and add to Authorization header
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('access_token');

      if (token) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
        // Remove token from URL to avoid passing it to COG
        url.searchParams.delete('access_token');
        proxyReq.path = url.pathname + url.search;
      } else if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
  },
  '/api/**': {
    target: 'http://51.44.28.47:30015',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  },
  '/dex/**': {
    target: 'http://51.44.28.47:30080',
    changeOrigin: true,
  },
  '/authservice/**': {
    target: 'http://51.44.28.47:30080',
    changeOrigin: true,
  },
  '/.well-known/**': {
    target: 'http://51.44.28.47:30080',
    changeOrigin: true,
    pathRewrite: { '^/.well-known': '/dex/.well-known' },
  },
};

// Setup proxy middleware for each route
Object.entries(proxyConfig).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware(config));
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`Node Express server listening on http://localhost:${port}`);
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

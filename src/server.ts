import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'node:path';
import type { Request, Response } from 'express';

// Environment variables configuration
const config = {
  api: process.env['API_TARGET'] || 'http://51.44.28.47:30015',
  dex: process.env['DEX_TARGET'] || 'http://51.44.28.47:30080',
  dashboard: process.env['DASHBOARD_TARGET'] || 'http://51.44.28.47:30016',
  grafana: process.env['GRAFANA_TARGET'] || 'http://51.44.28.47:30000',
  cog: process.env['COG_TARGET'] || 'https://dashboard.cog.hiro-develop.nl/uidev/',
};

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Health check endpoint for Docker health checks
 * Must be defined before all other middleware
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Middleware to modify proxy responses
 */
function modifyProxyHeaders(_proxyPath: string) {
  return (req: Request, res: Response, next: (error?: unknown) => void) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to add headers
    res.send = function (body: unknown) {
      // Add CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );

      // Remove X-Frame-Options and add CSP
      res.removeHeader('X-Frame-Options');
      res.header('Content-Security-Policy', 'upgrade-insecure-requests; frame-ancestors *');

      return originalSend.call(this, body);
    };

    res.json = function (obj: unknown) {
      // Add CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );

      // Remove X-Frame-Options and add CSP
      res.removeHeader('X-Frame-Options');
      res.header('Content-Security-Policy', 'upgrade-insecure-requests; frame-ancestors *');

      return originalJson.call(this, obj);
    };

    next();
  };
}

/**
 * Middleware to handle token extraction for iframe routes
 */
function extractTokenFromURL(
  req: Request,
  res: Response,
  next: (error?: unknown) => void
) {
  if (req.url) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('access_token');

    if (token) {
      req.headers.authorization = `Bearer ${token}`;
      url.searchParams.delete('access_token');
      req.url = url.pathname + url.search;
    }
  }
  next();
}

/**
 * Proxy middleware configuration for iframe routes
 */
// Setup proxy middleware for each route
app.use('/iframe-dashboard', modifyProxyHeaders('/iframe-dashboard'));
app.use(
  '/iframe-dashboard',
  createProxyMiddleware({
    target: config.dashboard,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/iframe-dashboard': '' },
  })
);

app.use(
  '/iframe-grafana',
  extractTokenFromURL,
  modifyProxyHeaders('/iframe-grafana')
);
app.use(
  '/iframe-grafana',
  createProxyMiddleware({
    target: config.grafana,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/iframe-grafana': '' },
  })
);

app.use('/iframe-cog', extractTokenFromURL, modifyProxyHeaders('/iframe-cog'));
app.use(
  '/iframe-cog',
  createProxyMiddleware({
    target: config.cog,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    pathRewrite: { '^/iframe-cog': '' },
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: config.api,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/api': '' },
  })
);

app.use(
  '/dex',
  createProxyMiddleware({
    target: config.dex,
    changeOrigin: true,
    followRedirects: true,
  })
);

app.use(
  '/authservice',
  createProxyMiddleware({
    target: config.dex,
    changeOrigin: true,
    followRedirects: true,
  })
);

app.use(
  '/.well-known',
  createProxyMiddleware({
    target: config.dex,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/.well-known': '/dex/.well-known' },
  })
);

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
  const port = Number(process.env['PORT']) || 3000;
  app.listen(port, '0.0.0.0', (error?: unknown) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log('Proxy configuration:', {
      api: config.api,
      dashboard: config.dashboard,
      grafana: config.grafana,
      cog: config.cog,
      dex: config.dex,
    });
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

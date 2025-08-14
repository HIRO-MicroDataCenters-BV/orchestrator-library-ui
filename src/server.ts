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

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Middleware to modify proxy responses
 */
function modifyProxyHeaders(proxyPath: string) {
  return (req: Request, res: Response, next: any) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to add headers
    res.send = function (body: any) {
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
      res.header('Content-Security-Policy', 'frame-ancestors *');

      return originalSend.call(this, body);
    };

    res.json = function (obj: any) {
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
      res.header('Content-Security-Policy', 'frame-ancestors *');

      return originalJson.call(this, obj);
    };

    next();
  };
}

/**
 * Middleware to handle token extraction for iframe routes
 */
function extractTokenFromURL(req: Request, res: Response, next: any) {
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
    target: 'http://51.44.28.47:30016',
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
    target: 'http://51.44.28.47:30000',
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/iframe-grafana': '' },
  })
);

app.use('/iframe-cog', extractTokenFromURL, modifyProxyHeaders('/iframe-cog'));
app.use(
  '/iframe-cog',
  createProxyMiddleware({
    target: 'https://dashboard.cog.hiro-develop.nl',
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    pathRewrite: { '^/iframe-cog': '' },
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://51.44.28.47:30015',
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: { '^/api': '' },
  })
);

app.use(
  '/dex',
  createProxyMiddleware({
    target: 'http://51.44.28.47:30080',
    changeOrigin: true,
    followRedirects: true,
  })
);

app.use(
  '/authservice',
  createProxyMiddleware({
    target: 'http://51.44.28.47:30080',
    changeOrigin: true,
    followRedirects: true,
  })
);

app.use(
  '/.well-known',
  createProxyMiddleware({
    target: 'http://51.44.28.47:30080',
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

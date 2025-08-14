module.exports = {
  '/api/**': {
    target: 'http://51.44.28.47:30015',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '',
    },
    onError: function (err, req, res) {
      console.error('[API PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('API proxy error: ' + err.message);
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[API PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/.well-known/openid-configuration': {
    target: 'http://51.44.28.47:30080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/.well-known/openid-configuration':
        '/dex/.well-known/openid-configuration',
    },
    onError: function (err, req, res) {
      console.error('[OIDC DISCOVERY PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('OIDC discovery proxy error: ' + err.message);
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[ROOT OIDC DISCOVERY PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/dex/.well-known/**': {
    target: 'http://51.44.28.47:30080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/dex/.well-known': '/dex/.well-known',
    },
    onError: function (err, req, res) {
      console.error('[DEX OIDC DISCOVERY PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('DEX OIDC discovery proxy error: ' + err.message);
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[DEX OIDC DISCOVERY PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/iframe-dashboard/**': {
    target: 'http://51.44.28.47:30016',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    followRedirects: true,
    cookieDomainRewrite: 'localhost',
    pathRewrite: {
      '^/iframe-dashboard': '',
    },
    onError: function (err, req, res) {
      console.error('[IFRAME DASHBOARD PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('K8s dashboard proxy error: ' + err.message);
    },
    onProxyRes: function (proxyRes, req, res) {
      // Handle CORS headers for K8s dashboard
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
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[IFRAME DASHBOARD PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/iframe-grafana/**': {
    target: 'http://51.44.28.47:30000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    followRedirects: true,
    cookieDomainRewrite: 'localhost',
    pathRewrite: {
      '^/iframe-grafana': '',
    },
    onError: function (err, req, res) {
      console.error('[IFRAME GRAFANA PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Grafana iframe proxy error: ' + err.message);
    },
    onProxyRes: function (proxyRes, req, res) {
      // Handle CORS headers for Grafana
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
    onProxyReq: function (proxyReq, req, res) {
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

      console.log(
        '[IFRAME GRAFANA PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/iframe-cog/**': {
    target: 'https://dashboard.cog.hiro-develop.nl',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    followRedirects: true,
    cookieDomainRewrite: 'localhost',
    pathRewrite: {
      '^/iframe-cog': '',
    },
    onError: function (err, req, res) {
      console.error('[IFRAME COG PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('COG iframe proxy error: ' + err.message);
    },
    onProxyRes: function (proxyRes, req, res) {
      // Handle CORS headers for COG
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
    onProxyReq: function (proxyReq, req, res) {
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

      console.log(
        '[IFRAME COG PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/dex/**': {
    target: 'http://51.44.28.47:30080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onError: function (err, req, res) {
      console.error('[DEX PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('DEX proxy error: ' + err.message);
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[DEX PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
  '/authservice/**': {
    target: 'http://51.44.28.47:30080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onError: function (err, req, res) {
      console.error('[AUTHSERVICE PROXY ERROR]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('AuthService proxy error: ' + err.message);
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        '[AUTHSERVICE PROXY]',
        req.method,
        req.url,
        '->',
        proxyReq.host + proxyReq.path
      );
    },
  },
};

const http = require('http');
const https = require('https');

// Test direct connections to actual services used in the application
const tests = [
  {
    url: 'http://51.44.28.47:30016/',
    name: 'K8s Dashboard (iframe-dashboard)',
    description: 'Kubernetes Dashboard service',
  },
  {
    url: 'http://51.44.28.47:30000/',
    name: 'Grafana Health (iframe-grafana)',
    description: 'Grafana monitoring service main page',
  },
  {
    url: 'https://dashboard.cog.hiro-develop.nl/',
    name: 'COG Dashboard (iframe-cog)',
    description: 'COG service dashboard',
  },
  {
    url: 'http://51.44.28.47:30080/dex/.well-known/openid_configuration',
    name: 'OIDC Discovery (dex)',
    description: 'DEX OIDC configuration endpoint',
  },
  {
    url: 'http://51.44.28.47:30015/k8s_cluster_info/',
    name: 'API Backend',
    description: 'Main API backend service',
  },
];

console.log('🧪 Testing direct connections to backend services...\n');

tests.forEach((test, index) => {
  const url = new URL(test.url);
  const client = url.protocol === 'https:' ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Test Agent)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    rejectUnauthorized: false,
    timeout: 10000,
  };

  console.log(`${index + 1}. Testing ${test.name}...`);
  console.log(`   URL: ${test.url}`);
  console.log(`   Description: ${test.description}`);

  const req = client.get(options, (res) => {
    const statusColor =
      res.statusCode < 300
        ? '\x1b[32m'
        : res.statusCode < 400
        ? '\x1b[33m'
        : '\x1b[31m';
    const resetColor = '\x1b[0m';

    console.log(
      `   Status: ${statusColor}${res.statusCode} ${res.statusMessage}${resetColor}`
    );

    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log(`   Redirect to: ${res.headers.location}`);
    }

    if (res.headers['content-type']) {
      console.log(`   Content-Type: ${res.headers['content-type']}`);
    }

    console.log('');
  });

  req.on('error', (err) => {
    console.log(`   \x1b[31mERROR: ${err.message}\x1b[0m`);
    console.log('');
  });

  req.on('timeout', () => {
    console.log(`   \x1b[31mERROR: Request timeout (10s)\x1b[0m`);
    req.destroy();
    console.log('');
  });
});

// Test proxy routes through Angular dev server (if running)
console.log('\n🔄 Testing proxy routes through Angular dev server...\n');

const proxyTests = [
  {
    url: 'http://localhost:4200/iframe-dashboard/',
    name: 'Dashboard Proxy',
    target: '/iframe-dashboard → K8s Dashboard',
  },
  {
    url: 'http://localhost:4200/iframe-grafana/',
    name: 'Grafana Proxy',
    target: '/iframe-grafana → Grafana',
  },
  {
    url: 'http://localhost:4200/iframe-cog/',
    name: 'COG Proxy',
    target: '/iframe-cog → COG Dashboard',
  },
  {
    url: 'http://localhost:4200/dex/.well-known/openid_configuration',
    name: 'OIDC Proxy',
    target: '/dex → DEX OIDC',
  },
  {
    url: 'http://localhost:4200/api/k8s_cluster_info/',
    name: 'API Proxy',
    target: '/api → Backend API',
  },
];

proxyTests.forEach((test, index) => {
  const url = new URL(test.url);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Proxy Test Agent)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 10000,
  };

  console.log(`${index + 1}. Testing ${test.name}...`);
  console.log(`   URL: ${test.url}`);
  console.log(`   Route: ${test.target}`);

  const req = http.get(options, (res) => {
    const statusColor =
      res.statusCode < 300
        ? '\x1b[32m'
        : res.statusCode < 400
        ? '\x1b[33m'
        : '\x1b[31m';
    const resetColor = '\x1b[0m';

    console.log(
      `   Status: ${statusColor}${res.statusCode} ${res.statusMessage}${resetColor}`
    );

    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log(`   Redirect to: ${res.headers.location}`);
    }

    console.log('');
  });

  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log(
        `   \x1b[33mWARNING: Angular dev server not running (localhost:4200)\x1b[0m`
      );
    } else {
      console.log(`   \x1b[31mERROR: ${err.message}\x1b[0m`);
    }
    console.log('');
  });

  req.on('timeout', () => {
    console.log(`   \x1b[31mERROR: Request timeout (10s)\x1b[0m`);
    req.destroy();
    console.log('');
  });
});

console.log('\n📋 Expected Results:');
console.log('• K8s Dashboard: 200 OK or 302 Redirect (auth required)');
console.log('• Grafana Health: 200 OK with JSON response');
console.log('• COG Dashboard: 200 OK or 302 Redirect (auth required)');
console.log('• OIDC Discovery: 200 OK with JSON configuration');
console.log('• API Backend: 200 OK with cluster info JSON');
console.log('\n🚀 Run "npm start" or "ng serve" to test proxy routes\n');

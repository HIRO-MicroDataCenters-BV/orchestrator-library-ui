const http = require('http');
const https = require('https');

// Test direct connections
const tests = [
  { url: 'http://51.44.28.47:30000/api/health', name: 'Grafana Health' },
  { url: 'http://51.44.28.47:30015/k8s_cluster_info/', name: 'API Cluster Info' },
  { url: 'http://51.44.28.47:30016/', name: 'K8s Dashboard' },
  { url: 'https://dashboard.cog.hiro-develop.nl/', name: 'COG Dashboard' },
];

tests.forEach(test => {
  const url = new URL(test.url);
  const client = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    rejectUnauthorized: false
  };

  client.get(options, (res) => {
    console.log(`${test.name}: ${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log(`  Redirect to: ${res.headers.location}`);
    }
  }).on('error', (err) => {
    console.log(`${test.name}: ERROR - ${err.message}`);
  });
});

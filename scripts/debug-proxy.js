#!/usr/bin/env node

/**
 * Proxy Debug Script
 *
 * This script helps diagnose 404 errors with Angular proxy routes by:
 * 1. Testing direct connections to backend services
 * 2. Testing proxy routes through the dev server
 * 3. Checking for common configuration issues
 * 4. Providing detailed error analysis
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Test configurations
const ANGULAR_DEV_SERVER = 'http://localhost:4200';
const BACKEND_SERVICES = [
  {
    name: 'API Backend',
    direct: 'http://51.44.28.47:30015',
    proxy: '/api',
    testPath: '/k8s_cluster_info/',
    expected: 200,
    description: 'Main API backend service for cluster management',
  },
  {
    name: 'Kubernetes Dashboard (iframe-dashboard)',
    direct: 'http://51.44.28.47:30016',
    proxy: '/iframe-dashboard',
    testPath: '/',
    expected: [200, 302, 401],
    description: 'K8s Dashboard embedded in iframe - dashboardUrl',
  },
  {
    name: 'Grafana (iframe-grafana)',
    direct: 'http://51.44.28.47:30000',
    proxy: '/iframe-grafana',
    testPath: '/',
    expected: [200, 302],
    description: 'Grafana monitoring service embedded in iframe - grafanaUrl',
  },
  {
    name: 'COG Dashboard (iframe-cog)',
    direct: 'https://dashboard.cog.hiro-develop.nl',
    proxy: '/iframe-cog',
    testPath: '/',
    expected: [200, 302, 401],
    description: 'COG service dashboard embedded in iframe - cogUrl',
  },
  {
    name: 'DEX OIDC Service',
    direct: 'http://51.44.28.47:30080',
    proxy: '/dex',
    testPath: '/.well-known/openid_configuration',
    expected: 200,
    description: 'DEX OIDC authentication service for SSO',
  },
  {
    name: 'AuthService',
    direct: 'http://51.44.28.47:30080',
    proxy: '/authservice',
    testPath: '/oidc/callback',
    expected: [200, 302, 404],
    description: 'Authentication service handling OIDC callbacks',
  },
];

class ProxyDebugger {
  constructor() {
    this.results = {
      direct: {},
      proxy: {},
      config: {},
    };
  }

  async run() {
    console.log(
      `${colors.bold}${colors.cyan}🔍 Angular Proxy Route Debugger${colors.reset}\n`
    );

    // Check if Angular dev server is running
    await this.checkDevServer();

    // Test configuration files
    await this.checkConfiguration();

    // Test direct connections
    console.log(
      `${colors.bold}${colors.blue}📡 Testing Direct Backend Connections${colors.reset}`
    );
    await this.testDirectConnections();

    // Test proxy routes
    console.log(
      `\n${colors.bold}${colors.blue}🔄 Testing Proxy Routes${colors.reset}`
    );
    await this.testProxyRoutes();

    // Analyze results
    this.analyzeResults();

    // Provide recommendations
    this.provideRecommendations();
  }

  async checkDevServer() {
    console.log(
      `${colors.yellow}Checking if Angular dev server is running...${colors.reset}`
    );

    try {
      await this.makeRequest(`${ANGULAR_DEV_SERVER}/`);
      console.log(
        `${colors.green}✅ Angular dev server is running on port 4200${colors.reset}\n`
      );
    } catch (error) {
      console.log(
        `${colors.red}❌ Angular dev server is NOT running${colors.reset}`
      );
      console.log(
        `${colors.yellow}Please start the dev server with: ng serve${colors.reset}\n`
      );
      process.exit(1);
    }
  }

  async checkConfiguration() {
    console.log(
      `${colors.bold}${colors.blue}📋 Checking Configuration Files${colors.reset}`
    );

    // Check proxy.conf.js
    const proxyPath = path.join(__dirname, 'proxy.conf.js');
    if (fs.existsSync(proxyPath)) {
      console.log(`${colors.green}✅ proxy.conf.js found${colors.reset}`);
      try {
        const proxyConfig = require(proxyPath);
        const proxyRoutes = Object.keys(proxyConfig);
        console.log(
          `${colors.cyan}   Configured proxy routes: ${proxyRoutes.join(', ')}${
            colors.reset
          }`
        );
        this.results.config.proxyRoutes = proxyRoutes;
      } catch (error) {
        console.log(
          `${colors.red}❌ Error reading proxy.conf.js: ${error.message}${colors.reset}`
        );
      }
    } else {
      console.log(`${colors.red}❌ proxy.conf.js not found${colors.reset}`);
    }

    // Check project.json
    const projectPath = path.join(__dirname, 'project.json');
    if (fs.existsSync(projectPath)) {
      console.log(`${colors.green}✅ project.json found${colors.reset}`);
      try {
        const projectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
        const serveConfig = projectConfig.targets?.serve?.options;
        if (serveConfig?.proxyConfig) {
          console.log(
            `${colors.cyan}   Proxy config referenced: ${serveConfig.proxyConfig}${colors.reset}`
          );
        }
      } catch (error) {
        console.log(
          `${colors.red}❌ Error reading project.json: ${error.message}${colors.reset}`
        );
      }
    }

    console.log('');
  }

  async testDirectConnections() {
    for (const service of BACKEND_SERVICES) {
      const url = `${service.direct}${service.testPath}`;
      console.log(`${colors.yellow}Testing: ${service.name}${colors.reset}`);
      console.log(`${colors.cyan}  URL: ${url}${colors.reset}`);

      try {
        const result = await this.makeRequest(url, { timeout: 10000 });
        const status = result.statusCode;
        const isExpected = Array.isArray(service.expected)
          ? service.expected.includes(status)
          : status === service.expected;

        if (isExpected) {
          console.log(
            `${colors.green}  ✅ Status: ${status} (Expected)${colors.reset}`
          );
        } else {
          console.log(
            `${colors.yellow}  ⚠️  Status: ${status} (Expected: ${service.expected})${colors.reset}`
          );
        }

        this.results.direct[service.name] = { status, success: isExpected };
      } catch (error) {
        console.log(`${colors.red}  ❌ Error: ${error.message}${colors.reset}`);
        this.results.direct[service.name] = {
          error: error.message,
          success: false,
        };
      }

      console.log('');
    }
  }

  async testProxyRoutes() {
    for (const service of BACKEND_SERVICES) {
      const url = `${ANGULAR_DEV_SERVER}${service.proxy}${service.testPath}`;
      console.log(
        `${colors.yellow}Testing: ${service.name} (via proxy)${colors.reset}`
      );
      console.log(`${colors.cyan}  URL: ${url}${colors.reset}`);

      try {
        const result = await this.makeRequest(url, { timeout: 15000 });
        const status = result.statusCode;
        const isExpected = Array.isArray(service.expected)
          ? service.expected.includes(status)
          : status === service.expected;

        if (isExpected) {
          console.log(
            `${colors.green}  ✅ Status: ${status} (Proxy working)${colors.reset}`
          );
        } else if (status === 404) {
          console.log(
            `${colors.red}  ❌ Status: 404 (PROXY NOT WORKING - This is the issue!)${colors.reset}`
          );
        } else {
          console.log(
            `${colors.yellow}  ⚠️  Status: ${status} (Unexpected)${colors.reset}`
          );
        }

        this.results.proxy[service.name] = { status, success: isExpected };
      } catch (error) {
        console.log(`${colors.red}  ❌ Error: ${error.message}${colors.reset}`);
        this.results.proxy[service.name] = {
          error: error.message,
          success: false,
        };
      }

      console.log('');
    }
  }

  analyzeResults() {
    console.log(
      `${colors.bold}${colors.magenta}📊 Analysis Results${colors.reset}\n`
    );

    let directSuccess = 0;
    let proxySuccess = 0;
    let totalServices = BACKEND_SERVICES.length;

    // Count successes
    Object.values(this.results.direct).forEach((result) => {
      if (result.success) directSuccess++;
    });

    Object.values(this.results.proxy).forEach((result) => {
      if (result.success) proxySuccess++;
    });

    console.log(
      `Direct connections: ${directSuccess}/${totalServices} successful`
    );
    console.log(
      `Proxy connections: ${proxySuccess}/${totalServices} successful\n`
    );

    // Identify specific issues
    if (directSuccess > proxySuccess) {
      console.log(
        `${colors.red}🚨 Proxy routes are failing while direct connections work${colors.reset}`
      );
      console.log(
        `${colors.yellow}This indicates a proxy configuration issue${colors.reset}\n`
      );
    }

    if (directSuccess === 0) {
      console.log(
        `${colors.red}🚨 Backend services appear to be down${colors.reset}`
      );
      console.log(
        `${colors.yellow}Check if the backend services are running${colors.reset}\n`
      );
    }
  }

  provideRecommendations() {
    console.log(
      `${colors.bold}${colors.green}💡 Recommendations${colors.reset}\n`
    );

    const proxyFailures = Object.entries(this.results.proxy).filter(
      ([_, result]) => !result.success
    );

    if (proxyFailures.length > 0) {
      console.log(`${colors.bold}For 404 Proxy Route Errors:${colors.reset}`);
      console.log(
        `1. Ensure Angular dev server is started with: ${colors.cyan}ng serve${colors.reset}`
      );
      console.log(
        `2. Verify proxy.conf.js is correctly referenced in project.json`
      );
      console.log(
        `3. Check that Angular routes don't conflict with proxy routes`
      );
      console.log(
        `4. Restart the dev server after proxy configuration changes`
      );
      console.log(`5. Check browser network tab for actual request URLs\n`);

      console.log(`${colors.bold}Debug Commands:${colors.reset}`);
      console.log(
        `• Test individual proxy route: ${colors.cyan}curl -v http://localhost:4200/api/k8s_cluster_info/${colors.reset}`
      );
      console.log(`• Check dev server logs for proxy errors`);
      console.log(`• Verify no Angular routes match proxy patterns\n`);
    }

    const directFailures = Object.entries(this.results.direct).filter(
      ([_, result]) => !result.success
    );

    if (directFailures.length > 0) {
      console.log(`${colors.bold}For Backend Service Issues:${colors.reset}`);
      console.log(`1. Check if backend services are running`);
      console.log(`2. Verify network connectivity to backend hosts`);
      console.log(`3. Check firewall/security group settings`);
      console.log(`4. Verify service endpoints and ports\n`);
    }

    console.log(`${colors.bold}Additional Steps:${colors.reset}`);
    console.log(`• Review Angular interceptors for proxy route exclusions`);
    console.log(`• Check browser console for JavaScript errors`);
    console.log(`• Verify CORS headers for cross-origin requests`);
    console.log(`• Test with browser dev tools Network tab open`);
  }

  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'ProxyDebugger/1.0',
          Accept: 'application/json, text/html, */*',
        },
        timeout: options.timeout || 5000,
        rejectUnauthorized: false,
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: data.substring(0, 500), // Limit data size
          });
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Connection failed: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.setTimeout(options.timeout || 5000);
      req.end();
    });
  }

  // Additional diagnostic methods
  async checkAngularRoutes() {
    console.log(
      `${colors.bold}${colors.blue}🛣️  Checking Angular Routes${colors.reset}`
    );

    try {
      const routesPath = path.join(__dirname, 'src', 'app', 'app.routes.ts');
      if (fs.existsSync(routesPath)) {
        const routesContent = fs.readFileSync(routesPath, 'utf8');

        // Check for conflicting routes
        const proxyPatterns = [
          '/api',
          '/iframe-dashboard',
          '/iframe-grafana',
          '/iframe-cog',
          '/dex',
          '/authservice',
        ];
        const conflicts = [];

        proxyPatterns.forEach((pattern) => {
          if (routesContent.includes(`path: '${pattern.substring(1)}'`)) {
            conflicts.push(pattern);
          }
        });

        if (conflicts.length > 0) {
          console.log(
            `${colors.red}❌ Route conflicts detected: ${conflicts.join(', ')}${
              colors.reset
            }`
          );
        } else {
          console.log(
            `${colors.green}✅ No route conflicts detected${colors.reset}`
          );
        }
      }
    } catch (error) {
      console.log(
        `${colors.red}❌ Error checking routes: ${error.message}${colors.reset}`
      );
    }

    console.log('');
  }

  async checkDevServerConfig() {
    console.log(
      `${colors.bold}${colors.blue}⚙️  Checking Dev Server Configuration${colors.reset}`
    );

    try {
      // Check if proxy config is properly referenced
      const projectPath = path.join(__dirname, 'project.json');
      if (fs.existsSync(projectPath)) {
        const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
        const serveOptions = project.targets?.serve?.options;

        if (serveOptions?.proxyConfig) {
          console.log(
            `${colors.green}✅ Proxy config referenced: ${serveOptions.proxyConfig}${colors.reset}`
          );

          // Check if the proxy config file exists
          const proxyConfigPath = path.join(
            __dirname,
            serveOptions.proxyConfig
          );
          if (fs.existsSync(proxyConfigPath)) {
            console.log(
              `${colors.green}✅ Proxy config file exists${colors.reset}`
            );
          } else {
            console.log(
              `${colors.red}❌ Proxy config file missing: ${proxyConfigPath}${colors.reset}`
            );
          }
        } else {
          console.log(
            `${colors.red}❌ No proxy config referenced in project.json${colors.reset}`
          );
        }
      }
    } catch (error) {
      console.log(
        `${colors.red}❌ Error checking dev server config: ${error.message}${colors.reset}`
      );
    }

    console.log('');
  }

  // Enhanced run method
  async runFull() {
    await this.run();
    await this.checkAngularRoutes();
    await this.checkDevServerConfig();

    // Generate debug report
    this.generateReport();
  }

  generateReport() {
    console.log(
      `${colors.bold}${colors.cyan}📄 Debug Report Summary${colors.reset}\n`
    );

    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      devServerRunning: true, // We checked this earlier
      results: this.results,
      recommendations: this.getRecommendations(),
    };

    const reportPath = path.join(
      __dirname,
      `proxy-debug-report-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`${colors.green}Report saved to: ${reportPath}${colors.reset}`);
  }

  getRecommendations() {
    const recommendations = [];

    // Analyze proxy vs direct results
    const proxyIssues = Object.entries(this.results.proxy).filter(
      ([_, result]) => !result.success
    );

    if (proxyIssues.length > 0) {
      recommendations.push({
        issue: 'Proxy routes returning 404',
        solutions: [
          'Restart Angular dev server',
          'Check proxy.conf.js syntax',
          'Verify Angular interceptors exclude proxy routes',
          'Check for route conflicts in app.routes.ts',
          'Ensure historyApiFallback is configured correctly',
        ],
      });
    }

    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const proxyDebugger = new ProxyDebugger();

  if (args.includes('--full') || args.includes('-f')) {
    proxyDebugger.runFull();
  } else {
    proxyDebugger.run();
  }
}

module.exports = ProxyDebugger;

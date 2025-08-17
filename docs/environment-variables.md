# Environment Variables Documentation

This document describes all environment variables used by the Orchestrator Library UI application.

## Required Environment Variables

### Core API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `API_URL` | Backend API base URL | `http://51.44.28.47:30015` | Yes |
| `DASHBOARD_URL` | Kubernetes dashboard URL | `http://51.44.28.47:30016` | No |
| `GRAFANA_URL` | Grafana monitoring URL | `http://51.44.28.47:30000` | No |
| `COG_URL` | COG system URL | `https://dashboard.cog.hiro-develop.nl/cogui/` | No |
| `DEX_URL` | Dex authentication URL | `https://dashboard.cog.hiro-develop.nl/apidev` | No |

### OIDC Authentication Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OIDC_AUTHORITY` | OIDC provider authority URL | `http://51.44.28.47:30015/dex` | Yes |
| `OIDC_CLIENT_ID` | OIDC client identifier | `authservice-oidc` | Yes |
| `OIDC_CLIENT_SECRET` | OIDC client secret | `your-secret-here` | Yes |
| `OIDC_SCOPE` | OIDC scopes | `openid profile email groups` | No |
| `OIDC_REDIRECT_URI` | OAuth redirect URI after login | `http://51.44.28.47:30015/authservice/oidc/callback` | Yes |
| `OIDC_POST_LOGOUT_REDIRECT_URI` | Redirect URI after logout | `http://51.44.28.47:30015/auth/login` | Yes |

### Development vs Production

#### Development (.env.development)
```bash
# Core URLs
API_URL=http://localhost:8086
GRAFANA_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:8080

# OIDC Configuration
OIDC_AUTHORITY=http://localhost:8080/dex
OIDC_CLIENT_ID=orchestrator-ui-dev
OIDC_CLIENT_SECRET=dev-secret-not-for-production
OIDC_REDIRECT_URI=http://localhost:4200/auth/callback
OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:4200/auth/login
```

#### Production (.env.production)
```bash
# Core URLs
API_URL=https://api.your-domain.com
GRAFANA_URL=https://grafana.your-domain.com
DASHBOARD_URL=https://dashboard.your-domain.com

# OIDC Configuration
OIDC_AUTHORITY=https://auth.your-domain.com
OIDC_CLIENT_ID=orchestrator-ui
OIDC_CLIENT_SECRET=your-production-secret
OIDC_REDIRECT_URI=https://your-domain.com/auth/callback
OIDC_POST_LOGOUT_REDIRECT_URI=https://your-domain.com/auth/login
```

## Docker Environment Variables

When running in Docker, you can pass environment variables:

```bash
docker run -d \
  -e API_URL=https://api.example.com \
  -e OIDC_AUTHORITY=https://auth.example.com \
  -e OIDC_CLIENT_ID=your-client-id \
  -e OIDC_CLIENT_SECRET=your-secret \
  -e OIDC_REDIRECT_URI=https://example.com/auth/callback \
  -e OIDC_POST_LOGOUT_REDIRECT_URI=https://example.com/auth/login \
  -p 80:80 \
  orchestrator-ui:latest
```

## Kubernetes Deployment

For Kubernetes deployments, use ConfigMaps and Secrets:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: orchestrator-ui-config
data:
  API_URL: "https://api.example.com"
  OIDC_AUTHORITY: "https://auth.example.com"
  OIDC_CLIENT_ID: "orchestrator-ui"
  OIDC_REDIRECT_URI: "https://example.com/auth/callback"
  OIDC_POST_LOGOUT_REDIRECT_URI: "https://example.com/auth/login"

---
apiVersion: v1
kind: Secret
metadata:
  name: orchestrator-ui-secrets
type: Opaque
stringData:
  OIDC_CLIENT_SECRET: "your-secret-here"
```

## Runtime Environment Injection

For client-side applications, environment variables can be injected at runtime:

### Option 1: Via index.html
```html
<script>
  window.__env__ = {
    API_URL: '${API_URL}',
    OIDC_AUTHORITY: '${OIDC_AUTHORITY}',
    OIDC_CLIENT_ID: '${OIDC_CLIENT_ID}',
    // ... other variables
  };
</script>
```

### Option 2: Via configuration endpoint
Create an endpoint `/api/config` that returns configuration based on environment:

```typescript
@Injectable()
export class ConfigService {
  private config$ = this.http.get<AppConfig>('/api/config');
  
  async loadConfig(): Promise<AppConfig> {
    return this.config$.toPromise();
  }
}
```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different secrets for different environments**
3. **Rotate secrets regularly**
4. **Use proper secret management tools (HashiCorp Vault, Azure Key Vault, AWS Secrets Manager)**
5. **Validate environment variables at startup**

## Validation

The application validates required environment variables at startup:

```typescript
import { ConfigService } from './core/services/config.service';

const configService = new ConfigService();
const missing = configService.validateConfig();

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}
```

## Migration from Hardcoded Values

If migrating from hardcoded configuration values:

1. Update your deployment scripts to include environment variables
2. Test in development environment first
3. Update CI/CD pipelines
4. Deploy to staging for validation
5. Deploy to production

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Check logs for validation errors
2. **CORS issues**: Ensure URLs are correct and accessible
3. **OIDC authentication failures**: Verify client ID, secret, and redirect URIs
4. **Network connectivity**: Test API endpoints are reachable

### Debug Mode

Enable debug logging in development:

```bash
OIDC_LOG_LEVEL=0  # Debug level for OIDC
NODE_ENV=development
```

### Health Check

The application provides a health check endpoint that validates configuration:

```bash
curl http://localhost:4000/health
```

Response includes configuration status (without sensitive data).
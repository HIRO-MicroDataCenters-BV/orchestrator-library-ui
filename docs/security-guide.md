# Security Guide for Orchestrator Library UI

## Table of Contents
- [Overview](#overview)
- [Environment Security](#environment-security)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Container Security](#container-security)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

## Overview

This guide outlines security best practices for deploying and maintaining the Orchestrator Library UI application. Following these guidelines will help protect against common vulnerabilities and ensure secure operation.

## Environment Security

### 🔐 Secret Management

**CRITICAL: Never commit secrets to version control**

#### ❌ Bad Practice
```typescript
// NEVER do this
const clientSecret = '8KD8XQ11DTP1685XF8TK3844QAYY7Q';
```

#### ✅ Good Practice
```typescript
// Use environment variables
const clientSecret = process.env['OIDC_CLIENT_SECRET'];
```

### Environment Variable Security

1. **Production Secrets**
   ```bash
   # Use strong, unique secrets for production
   OIDC_CLIENT_SECRET="$(openssl rand -base64 32)"
   ```

2. **Secret Rotation**
   - Rotate secrets every 90 days minimum
   - Use different secrets for each environment
   - Monitor secret usage and access

3. **Secret Storage**
   - Use dedicated secret management systems:
     - HashiCorp Vault
     - Azure Key Vault
     - AWS Secrets Manager
     - Kubernetes Secrets

### Kubernetes Secret Management

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: orchestrator-ui-secrets
  namespace: production
type: Opaque
stringData:
  OIDC_CLIENT_SECRET: "your-secure-secret-here"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator-ui
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - secretRef:
            name: orchestrator-ui-secrets
```

## Authentication & Authorization

### OIDC Configuration Security

1. **Client Configuration**
   ```typescript
   // Secure OIDC settings
   const oidcConfig = {
     authority: process.env['OIDC_AUTHORITY'],
     clientId: process.env['OIDC_CLIENT_ID'],
     clientSecret: process.env['OIDC_CLIENT_SECRET'],
     scope: 'openid profile email groups',
     responseType: 'code', // Use authorization code flow
     silentRenew: true,
     useRefreshToken: true,
     renewTimeBeforeTokenExpiresInSeconds: 60,
   };
   ```

2. **Redirect URI Validation**
   - Whitelist all redirect URIs in your OIDC provider
   - Use HTTPS for all redirect URIs in production
   - Validate redirect_uri parameter

3. **Token Security**
   ```typescript
   // Secure token storage
   class TokenService {
     private readonly tokenKey = 'auth_token';
     
     storeToken(token: string): void {
       // Use secure storage
       sessionStorage.setItem(this.tokenKey, token);
       // Consider using httpOnly cookies for enhanced security
     }
     
     getToken(): string | null {
       return sessionStorage.getItem(this.tokenKey);
     }
     
     clearToken(): void {
       sessionStorage.removeItem(this.tokenKey);
       localStorage.removeItem(this.tokenKey);
     }
   }
   ```

### Session Management

1. **Session Timeout**
   ```typescript
   const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
   
   class SessionManager {
     private timeout: NodeJS.Timeout;
     
     resetTimeout(): void {
       clearTimeout(this.timeout);
       this.timeout = setTimeout(() => {
         this.logout();
       }, SESSION_TIMEOUT);
     }
   }
   ```

2. **Secure Logout**
   ```typescript
   async logout(): Promise<void> {
     // Clear all tokens
     this.tokenService.clearToken();
     
     // Revoke tokens on server
     await this.revokeTokens();
     
     // Clear all application state
     this.clearApplicationState();
     
     // Redirect to logout URL
     window.location.href = this.getLogoutUrl();
   }
   ```

## Data Protection

### Input Validation

1. **Sanitize User Input**
   ```typescript
   import DOMPurify from 'dompurify';
   
   function sanitizeInput(input: string): string {
     return DOMPurify.sanitize(input);
   }
   ```

2. **Validate API Responses**
   ```typescript
   interface User {
     id: string;
     email: string;
     roles: string[];
   }
   
   function validateUser(data: unknown): User {
     if (!data || typeof data !== 'object') {
       throw new Error('Invalid user data');
     }
     
     const user = data as Record<string, unknown>;
     
     if (typeof user.id !== 'string' || !user.id) {
       throw new Error('Invalid user ID');
     }
     
     // Additional validation...
     return user as User;
   }
   ```

### Content Security Policy (CSP)

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' wss: https:;
  frame-src 'self' https://dashboard.example.com https://grafana.example.com;
">
```

## Network Security

### HTTPS Configuration

1. **Nginx Configuration**
   ```nginx
   server {
     listen 443 ssl http2;
     listen [::]:443 ssl http2;
     
     ssl_certificate /etc/ssl/certs/app.crt;
     ssl_certificate_key /etc/ssl/private/app.key;
     
     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
     ssl_prefer_server_ciphers off;
     
     # Security headers
     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
     add_header X-Content-Type-Options nosniff;
     add_header X-Frame-Options DENY;
     add_header X-XSS-Protection "1; mode=block";
     add_header Referrer-Policy "strict-origin-when-cross-origin";
   }
   ```

2. **CORS Configuration**
   ```typescript
   // server.ts
   app.use((req, res, next) => {
     const allowedOrigins = [
       'https://your-domain.com',
       'https://admin.your-domain.com'
     ];
     
     const origin = req.headers.origin;
     if (allowedOrigins.includes(origin)) {
       res.header('Access-Control-Allow-Origin', origin);
     }
     
     res.header('Access-Control-Allow-Credentials', 'true');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
     
     next();
   });
   ```

### API Security

1. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   
   app.use('/api', limiter);
   ```

2. **Request Validation**
   ```typescript
   function validateApiKey(req: Request, res: Response, next: NextFunction) {
     const apiKey = req.headers['x-api-key'];
     
     if (!apiKey || !isValidApiKey(apiKey)) {
       return res.status(401).json({ error: 'Invalid API key' });
     }
     
     next();
   }
   ```

## Container Security

### Docker Security

1. **Secure Dockerfile**
   ```dockerfile
   # Use non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   
   # Copy files with correct ownership
   COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
   
   # Switch to non-root user
   USER nextjs
   
   # Expose only necessary ports
   EXPOSE 4000
   
   # Use specific base image tags
   FROM node:18-alpine3.18
   ```

2. **Image Scanning**
   ```bash
   # Scan for vulnerabilities
   docker scan orchestrator-ui:latest
   
   # Use Trivy for comprehensive scanning
   trivy image orchestrator-ui:latest
   ```

### Kubernetes Security

1. **Security Context**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   spec:
     template:
       spec:
         securityContext:
           runAsNonRoot: true
           runAsUser: 1001
           fsGroup: 1001
         containers:
         - name: app
           securityContext:
             allowPrivilegeEscalation: false
             readOnlyRootFilesystem: true
             capabilities:
               drop:
               - ALL
   ```

2. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: orchestrator-ui-policy
   spec:
     podSelector:
       matchLabels:
         app: orchestrator-ui
     policyTypes:
     - Ingress
     - Egress
     ingress:
     - from:
       - namespaceSelector:
           matchLabels:
             name: ingress-system
       ports:
       - protocol: TCP
         port: 4000
   ```

## Monitoring & Logging

### Security Logging

1. **Audit Logging**
   ```typescript
   class SecurityLogger {
     logAuthenticationAttempt(user: string, success: boolean, ip: string): void {
       const event = {
         timestamp: new Date().toISOString(),
         event: 'authentication_attempt',
         user,
         success,
         ip,
         userAgent: this.getUserAgent()
       };
       
       console.log(JSON.stringify(event));
     }
     
     logTokenRefresh(user: string, success: boolean): void {
       const event = {
         timestamp: new Date().toISOString(),
         event: 'token_refresh',
         user,
         success
       };
       
       console.log(JSON.stringify(event));
     }
   }
   ```

2. **Error Handling**
   ```typescript
   class SecureErrorHandler {
     handleError(error: Error, req: Request): void {
       // Log detailed error internally
       this.logger.error({
         message: error.message,
         stack: error.stack,
         url: req.url,
         method: req.method,
         ip: req.ip,
         userAgent: req.get('User-Agent')
       });
       
       // Return generic error to client
       const publicError = this.sanitizeError(error);
       throw publicError;
     }
     
     private sanitizeError(error: Error): Error {
       // Never expose internal details
       return new Error('An internal error occurred');
     }
   }
   ```

### Security Monitoring

1. **Health Checks**
   ```typescript
   app.get('/health/security', (req, res) => {
     const checks = {
       timestamp: new Date().toISOString(),
       certificateExpiry: this.checkCertificateExpiry(),
       tokenValidation: this.checkTokenValidation(),
       rateLimit: this.checkRateLimit(),
       dependencies: this.checkDependencyVulnerabilities()
     };
     
     const allHealthy = Object.values(checks).every(check => 
       typeof check === 'boolean' ? check : check.status === 'healthy'
     );
     
     res.status(allHealthy ? 200 : 503).json(checks);
   });
   ```

## Security Checklist

### Pre-Deployment
- [ ] All secrets moved to environment variables
- [ ] Environment variables properly configured
- [ ] HTTPS enabled with valid certificates
- [ ] CSP headers configured
- [ ] Security headers enabled
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Dependencies updated to latest secure versions
- [ ] Container running as non-root user
- [ ] Docker image scanned for vulnerabilities

### Post-Deployment
- [ ] Security monitoring enabled
- [ ] Audit logging configured
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented
- [ ] Security scanning scheduled
- [ ] Certificate renewal automated
- [ ] Access controls reviewed
- [ ] Security training completed

### Regular Maintenance
- [ ] Dependency updates (monthly)
- [ ] Security patches applied
- [ ] Certificate expiry monitored
- [ ] Access audit (quarterly)
- [ ] Penetration testing (annually)
- [ ] Security policy review (annually)

## Incident Response

### Security Incident Response Plan

1. **Detection**
   - Monitor security alerts
   - Review audit logs regularly
   - Set up automated alerting

2. **Assessment**
   ```bash
   # Check for suspicious activity
   kubectl logs -l app=orchestrator-ui | grep -i "error\|failed\|unauthorized"
   
   # Check resource usage
   kubectl top pods -l app=orchestrator-ui
   ```

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Scale down affected deployments if necessary

4. **Recovery**
   - Apply security patches
   - Rotate all secrets
   - Restore from clean backups if needed
   - Verify system integrity

5. **Lessons Learned**
   - Document the incident
   - Update security procedures
   - Improve monitoring and detection

### Emergency Contacts

- **Security Team**: security@your-company.com
- **DevOps Team**: devops@your-company.com
- **Management**: management@your-company.com

### Useful Commands

```bash
# Emergency secret rotation
kubectl delete secret orchestrator-ui-secrets
kubectl create secret generic orchestrator-ui-secrets \
  --from-literal=OIDC_CLIENT_SECRET="$(openssl rand -base64 32)"

# Force pod restart
kubectl rollout restart deployment/orchestrator-ui

# View security events
kubectl get events --field-selector type=Warning

# Check for failed authentication attempts
kubectl logs -l app=orchestrator-ui | grep "authentication_failed"
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures to address new threats and vulnerabilities.
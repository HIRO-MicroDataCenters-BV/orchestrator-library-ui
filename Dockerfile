# Stage 1: Build the Angular app
FROM node:20-alpine3.20 AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Ensure replace-env.sh is available in builder stage
RUN if [ ! -f /app/replace-env.sh ]; then echo "Error: replace-env.sh not found"; exit 1; fi

# Build the Angular app
RUN pnpm run build:prod

# Stage 2: Production image with nginx + Node.js
FROM node:20-alpine3.20

WORKDIR /usr/app

# Install nginx and pnpm
RUN apk add --no-cache nginx wget && \
    npm install -g pnpm

# Copy the dist folder from the builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json and pnpm-lock.yaml and install production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /run/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /run/nginx

# Copy Angular environment replacement script from builder stage
COPY --from=builder /app/replace-env.sh /usr/app/replace-env.sh
RUN chmod +x /usr/app/replace-env.sh

# Create startup script
RUN echo '#!/bin/sh' > /usr/app/start.sh && \
    echo 'set -e' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo 'echo "Replacing Angular environment variables..."' >> /usr/app/start.sh && \
    echo '/usr/app/replace-env.sh' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo 'echo "Starting Node.js SSR server..."' >> /usr/app/start.sh && \
    echo 'node dist/orchestration_library-front/server/server.mjs &' >> /usr/app/start.sh && \
    echo 'NODE_PID=$!' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo 'echo "Waiting for Node.js server to start..."' >> /usr/app/start.sh && \
    echo 'sleep 5' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo 'echo "Starting nginx..."' >> /usr/app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /usr/app/start.sh && \
    echo 'NGINX_PID=$!' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo '# Function to handle shutdown' >> /usr/app/start.sh && \
    echo 'shutdown() {' >> /usr/app/start.sh && \
    echo 'echo "Shutting down..."' >> /usr/app/start.sh && \
    echo 'kill $NGINX_PID 2>/dev/null || true' >> /usr/app/start.sh && \
    echo 'kill $NODE_PID 2>/dev/null || true' >> /usr/app/start.sh && \
    echo 'exit 0' >> /usr/app/start.sh && \
    echo '}' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo '# Trap signals' >> /usr/app/start.sh && \
    echo 'trap shutdown SIGTERM SIGINT' >> /usr/app/start.sh && \
    echo '' >> /usr/app/start.sh && \
    echo '# Wait for either process to exit' >> /usr/app/start.sh && \
    echo 'wait $NODE_PID $NGINX_PID' >> /usr/app/start.sh

RUN chmod +x /usr/app/start.sh

# Expose ports
EXPOSE 80 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80 > /dev/null || exit 1

# Start both nginx and Node.js
CMD ["/usr/app/start.sh"]

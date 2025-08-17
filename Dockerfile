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

# Create startup script
RUN cat > /usr/app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "Starting Node.js SSR server..."
node dist/orchestration_library-front/server/server.mjs &
NODE_PID=$!

echo "Waiting for Node.js server to start..."
sleep 5

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Function to handle shutdown
shutdown() {
echo "Shutting down..."
kill $NGINX_PID 2>/dev/null || true
kill $NODE_PID 2>/dev/null || true
exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Wait for either process to exit
wait $NODE_PID $NGINX_PID
EOF

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

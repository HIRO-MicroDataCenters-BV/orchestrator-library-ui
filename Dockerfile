# Stage 1: Build the Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build the Angular app
RUN pnpm build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built app from builder
COPY --from=builder /app/dist/orchestration_library-front/browser /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

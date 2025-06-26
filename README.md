# Orchestration Library Front

A modern Angular 20 web application built with Nx workspace, Tailwind CSS, and Spartan UI components. This project provides a user interface for orchestration library management.

## Project Overview

This project is built using the following technologies:

- **Angular 20**: Modern web framework for building single-page applications
- **Nx**: Smart, extensible build framework for monorepos
- **Tailwind CSS**: Utility-first CSS framework
- **Spartan UI**: UI component library based on Tailwind CSS
- **Transloco**: Internationalization library for Angular
- **SSR (Server-Side Rendering)**: For improved performance and SEO

## Project Structure

```
├── libs/                  # Shared libraries
│   └── ui/                # UI component libraries
├── public/                # Public assets
├── src/                   # Source code
│   ├── app/               # Application code
│   │   ├── core/          # Core functionality
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   └── app.routes.ts  # Application routes
│   ├── environments/      # Environment configurations
│   └── styles.css         # Global styles
└── nx.json                # Nx configuration
```

## Getting Started

### Prerequisites

- Node.js (LTS version)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm start
```

The application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Building

```bash
# Build the project
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## Server-Side Rendering

```bash
# Serve the SSR version
pnpm serve:ssr
```

## Testing

```bash
# Run unit tests
pnpm test
```

## Additional Commands

```bash
# Watch mode for development
pnpm watch

# Extract i18n messages
nx extract-i18n
```

## Features

- Modern Angular architecture with standalone components
- Server-side rendering for improved performance
- Internationalization support with Transloco
- Responsive UI with Tailwind CSS
- Component library with Spartan UI
- Nx workspace for efficient development

## Docker Deployment

This project supports containerization with Docker for easy deployment.

### Building the Docker Image

```bash
# Build the Docker image
docker build -t orchestrator-ui:latest .
```

### Running with Docker

```bash
# Run the container
docker run -p 4000:4000 orchestrator-ui:latest
```

The application will be available at `http://localhost:4000/`.

### Using Docker Compose

```bash
# Start the application with Docker Compose
docker-compose up -d

# Stop the application
docker-compose down
```

## Docker Architecture

The Docker setup uses a multi-stage build process:

1. **Build Stage**: Compiles the Angular application with SSR support
2. **Runtime Stage**: Runs the SSR application using Node.js

The container exposes port 4000 for the Node.js server that handles SSR.

## Learn More

- [Angular Documentation](https://angular.dev/)
- [Nx Documentation](https://nx.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Spartan UI Documentation](https://spartan.ng/)

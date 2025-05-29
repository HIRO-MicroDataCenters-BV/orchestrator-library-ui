# OrchestrationLibraryFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0 and follows the best practices of [spartan.ng](https://spartan.ng/).

## Project Structure

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── auth/            # Authentication related services
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── services/        # Core services
│   ├── shared/              # Shared modules, components, pipes
│   ├── features/            # Feature modules
│   │   ├── public/          # Public routes
│   │   └── private/         # Private routes
│   └── layout/              # Layout components
├── assets/
├── environments/            # Environment configurations
└── styles/                 # Global styles
```

## Features List

### Core Features

- **Authentication System**

  - JWT-based authentication
  - Secure token storage
  - Automatic token injection in requests
  - User session management

- **Environment Configuration**

  - Development/Production environment separation
  - Secure configuration management
  - Environment-specific API endpoints

- **Error Handling**

  - Global error interceptor
  - Centralized error service
  - Custom error pages
  - HTTP error handling

- **API Integration**
  - Centralized API service
  - Automatic token management
  - Type-safe API calls
  - Request/Response interceptors

### Architecture Benefits

1. **Modular Structure**

   - Lazy-loaded feature modules
   - Clear separation of concerns
   - Scalable architecture
   - Easy to maintain and extend

2. **Security**

   - Protected routes with AuthGuard
   - Secure token handling
   - Environment-based secrets
   - HTTP interceptors for security

3. **Performance**

   - Lazy loading of modules
   - Optimized bundle size
   - Efficient state management
   - Caching strategies

4. **Developer Experience**
   - Clear project structure
   - Type safety with TypeScript
   - Consistent coding patterns
   - Easy to understand and maintain

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

For information about spartan.ng and its features, visit [spartan.ng documentation](https://spartan.ng/).

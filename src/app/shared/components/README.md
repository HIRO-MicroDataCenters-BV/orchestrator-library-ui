# Shared Overlay Components

This directory contains reusable overlay components for loading and error states throughout the application.

## Components

### LoadingOverlayComponent

A universal loading overlay component with absolute positioning that can be placed over any content area.

#### Usage

```typescript
import { LoadingOverlayComponent } from '@/shared/components';

// In your component
@Component({
  imports: [LoadingOverlayComponent],
  template: `
    <div class="relative">
      <app-loading-overlay
        [isVisible]="isLoading"
        [showBackdrop]="true"
        size="md"
        theme="primary"
      ></app-loading-overlay>
      
      <!-- Your content here -->
    </div>
  `
})
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controls overlay visibility |
| `showBackdrop` | `boolean` | `true` | Show semi-transparent backdrop |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `theme` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Color theme |

#### Features

- Absolute positioning with `z-index: 50`
- Backdrop blur effect
- Smooth spinner animation
- Responsive sizing
- Clean, minimal design
- Accessible content slot

---

### ErrorOverlayComponent

A universal error overlay component for displaying error states with optional retry functionality.

#### Usage

```typescript
import { ErrorOverlayComponent } from '@/shared/components';

// In your component
@Component({
  imports: [ErrorOverlayComponent],
  template: `
    <div class="relative">
      <app-error-overlay
        [isVisible]="hasError"
        [title]="'error.title'"
        [message]="errorMessage"
        [showBackdrop]="true"
        [showRetry]="true"
        size="md"
        theme="danger"
        (retry)="onRetry()"
      ></app-error-overlay>
      
      <!-- Your content here -->
    </div>
  `
})
export class MyComponent {
  hasError = false;
  errorMessage = 'error.failed_to_load';
  
  onRetry() {
    // Handle retry logic
    this.loadData();
  }
}
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controls overlay visibility |
| `title` | `string` | `'error.title'` | Translation key for error title |
| `message` | `string` | `'error.generic'` | Translation key for error message |
| `showBackdrop` | `boolean` | `true` | Show semi-transparent backdrop |
| `showRetry` | `boolean` | `false` | Show retry button |
| `retryText` | `string` | `'action.retry'` | Translation key for retry button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Icon size |
| `theme` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Color theme |

#### Events

| Event | Type | Description |
|-------|------|-------------|
| `retry` | `EventEmitter<void>` | Emitted when retry button is clicked |

#### Features

- Absolute positioning with `z-index: 50`
- Backdrop blur effect
- SVG error icon
- Retry button with hover states
- Transloco integration
- Accessible content slot
- Keyboard navigation support

---

## Implementation in Dashboard Cards

Both components are integrated into the dashboard card system with universal positioning:

```typescript
// dashboard-card.component.ts
export class AppDashboardCardComponent {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  loadCardData() {
    this.isLoading = true;
    this.hasError = false;
    
    // Load data...
    
    // On success:
    this.isLoading = false;
    
    // On error:
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = 'error.failed_to_load';
  }

  retryLoad() {
    this.loadCardData();
  }
}
```

```html
<!-- dashboard-card.component.html -->
<div class="dashboard-card relative">
  <!-- Universal Loading Overlay -->
  <app-loading-overlay
    [isVisible]="isLoading"
    [showBackdrop]="true"
  ></app-loading-overlay>

  <!-- Universal Error Overlay -->
  <app-error-overlay
    [isVisible]="hasError"
    [message]="errorMessage"
    [showBackdrop]="true"
    [showRetry]="true"
    (retry)="retryLoad()"
  ></app-error-overlay>

  <!-- Card content -->
</div>
```

## CSS Requirements

For proper positioning, ensure your container has `position: relative`:

```css
.container {
  position: relative;
  /* Other styles */
}
```

## Translation Keys

Ensure these translation keys exist in your i18n files:

```json
{
  "error": {
    "title": "Error",
    "generic": "Something went wrong",
    "failed_to_load": "Failed to load data"
  },
  "action": {
    "retry": "Retry"
  }
}
```

## Best Practices

1. **Always use `position: relative`** on the container element
2. **Keep loading states minimal** - only spinner, no text
3. **Implement retry logic** for recoverable errors
4. **Use backdrop for better contrast** over complex content
5. **Consider reduced motion preferences** - animations respect `prefers-reduced-motion`
6. **Keep error messages user-friendly** and actionable

## Accessibility

- Screen reader friendly with proper ARIA labels
- Keyboard navigation support for retry button
- High contrast colors for error states
- Respects reduced motion preferences
- Focus management when overlays appear/disappear
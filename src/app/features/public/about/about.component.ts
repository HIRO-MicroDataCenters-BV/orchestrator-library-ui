import { Component } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';

@Component({
  selector: 'app-about',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div hlmCard class="p-6">
        <h1 class="text-4xl font-bold mb-4">About Our Library</h1>
        <p class="text-lg text-muted-foreground mb-6">
          We are dedicated to providing access to knowledge and fostering a love
          for reading in our community.
        </p>
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Our Mission</h2>
          <p class="text-muted-foreground">
            To connect people with information, ideas, and experiences through
            quality resources and services.
          </p>
          <h2 class="text-2xl font-semibold">Our Vision</h2>
          <p class="text-muted-foreground">
            To be a vibrant center of community life, promoting literacy,
            learning, and cultural enrichment.
          </p>
        </div>
        <div class="mt-6">
          <button hlmBtn variant="outline">Contact Us</button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [HlmButtonDirective, HlmCardDirective],
})
export class AboutComponent {}

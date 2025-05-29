import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';

@Component({
  selector: 'app-error-page',
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <div hlmCard class="w-full max-w-md space-y-8 p-6 text-center">
        <h1 class="text-6xl font-bold text-destructive">{{ status }}</h1>
        <p class="text-xl text-muted-foreground">{{ message }}</p>
        <button hlmBtn variant="outline" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [HlmButtonDirective, HlmCardDirective],
})
export class ErrorPageComponent implements OnInit {
  status: number = 404;
  message: string = 'Page not found';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['status']) {
        this.status = data['status'];
      }
      if (data['message']) {
        this.message = data['message'];
      }
    });
  }

  goBack() {
    window.history.back();
  }
}

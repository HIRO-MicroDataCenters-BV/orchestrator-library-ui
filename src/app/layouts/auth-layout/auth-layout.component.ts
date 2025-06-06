import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslocoModule
  ],
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent {
  currentYear = new Date().getFullYear();
}
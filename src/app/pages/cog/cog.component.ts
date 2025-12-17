import { Component, OnInit, inject } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';
import { AuthService } from '../../core/services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cog',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="cogUrl | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./cog.component.scss'],
})
export class CogComponent implements OnInit {
  private readonly authService = inject(AuthService);

  cogUrl = '';

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    // Use local proxy path to ensure CSP headers are applied and mixed content is avoided
    // The proxy will forward to the actual COG URL and handle the token extraction
    const baseUrl = environment.cogUrl;
    console.log('COG URL: ', baseUrl);
    //'/iframe-cog';

    if (token) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      this.cogUrl = `${baseUrl}${separator}access_token=${encodeURIComponent(
        token
      )}`;
    } else {
      this.cogUrl = baseUrl;
    }
  }
}

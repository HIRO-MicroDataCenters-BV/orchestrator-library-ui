import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cog',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="url | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./cog.component.scss'],
})
export class CogComponent {
  url = environment.cogUrl;
}

import { Component } from '@angular/core';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SafePipe],
  template: `<div class="container">
    <iframe
      [src]="url | safe : 'resourceUrl'"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>`,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  url = 'http://localhost:8080/';
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [RouterOutlet, TranslocoModule],
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {}
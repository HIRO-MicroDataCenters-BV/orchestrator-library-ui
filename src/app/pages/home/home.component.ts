import { Component } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HlmButtonDirective, HlmInputDirective, TranslocoModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
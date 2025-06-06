import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardContentDirective, HlmCardDescriptionDirective, HlmCardDirective, HlmCardHeaderDirective, HlmCardTitleDirective } from '@spartan-ng/ui-card-helm';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmButtonDirective,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmCardDescriptionDirective,
    HlmCardContentDirective
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  user: User | null = null;
  
  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
  
  logout(): void {
    this.authService.logout();
  }
}
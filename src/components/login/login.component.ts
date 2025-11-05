import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);

  username = signal('');
  password = signal('');
  errorMessage = signal('');

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');
    const success = this.authService.login(this.username(), this.password());
    if (!success) {
      this.errorMessage.set('Invalid username or password.');
    }
  }

  onUsernameInput(event: Event) {
    this.username.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }
}
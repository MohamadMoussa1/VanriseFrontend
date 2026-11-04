import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { extractErrorMessage } from '../../utils/error-handler.util';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoggingOut: boolean = false;
  errorMessage: string | null = null;

  get isAuthenticated(): boolean {
    if (typeof this.authService.isAuthenticated === 'function') {
      return this.authService.isAuthenticated();
    }
    if (typeof this.authService.isLoggedIn === 'function') {
      return this.authService.isLoggedIn();
    }
    return false;
  }

  get currentUser(): string | null {
    if (typeof this.authService.authenticatedUser === 'function') {
      return this.authService.authenticatedUser();
    }
    return null;
  }

  onLogout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.cdr.markForCheck();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoggingOut = false;
        console.error('Logout failed:', err);

        if (err.status === 401) {
          this.authService.clearAuthState();
          this.cdr.markForCheck();
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage = extractErrorMessage(err, 'Logout failed. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }
}

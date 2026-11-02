import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the authentication server. Please ensure the backend is running.';
        } else if (err.status >= 500) {
          this.errorMessage = 'A server error occurred while logging out. Please try again.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Logout failed. Please try again.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}

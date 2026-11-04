import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { extractErrorMessage } from '../utils/error-handler.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  username: string = '';
  password: string = '';

  isLoading: boolean = false;
  errorMessage: string | null = null;
  usernameError: string | null = null;
  passwordError: string | null = null;

  onSubmit(): void {
    // Reset previous errors
    this.errorMessage = null;
    this.usernameError = null;
    this.passwordError = null;

    const trimmedUsername = this.username.trim();
    let hasValidationError = false;

    // Validate Username
    if (!trimmedUsername) {
      this.usernameError = 'Username is required.';
      hasValidationError = true;
    }

    // Validate Password
    if (!this.password) {
      this.passwordError = 'Password is required.';
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    // Prevent duplicate submissions
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const submittedPassword = this.password;
    // Clear password input immediately for security
    this.password = '';
    this.cdr.markForCheck();

    this.authService.login({
      username: trimmedUsername,
      password: submittedPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
        // Redirect to the default main page
        this.router.navigate(['/devices']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error status:', err.status, err.statusText);

        if (err.status === 401) {
          const customMsg = (typeof err.error === 'string' && err.error.trim()) || err.error?.message;
          this.errorMessage = customMsg || 'Invalid username or password.';
        } else {
          this.errorMessage = extractErrorMessage(err, 'Login failed. Please check your credentials and try again.');
        }

        this.cdr.markForCheck();
      }
    });
  }

  onFieldChange(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }
}

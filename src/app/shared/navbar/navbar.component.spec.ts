import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: {
    logout: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    authenticatedUser: WritableSignal<string | null>;
    isAuthenticated: WritableSignal<boolean>;
    clearAuthState: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = {
      logout: vi.fn(),
      isLoggedIn: vi.fn().mockReturnValue(true),
      authenticatedUser: signal<string | null>('admin'),
      isAuthenticated: signal<boolean>(true),
      clearAuthState: vi.fn()
    };

    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the logout button when user is authenticated', () => {
    const logoutBtn = fixture.nativeElement.querySelector('#logoutBtn');
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain('Logout');
  });

  it('should not display the logout button when user is not authenticated', () => {
    authServiceMock.isAuthenticated.set(false);
    authServiceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector('#logoutBtn');
    expect(logoutBtn).toBeNull();
  });

  it('should call authService.logout and navigate to /login on success', () => {
    authServiceMock.logout.mockReturnValue(of({ message: 'Logout successful' }));

    component.onLogout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component.isLoggingOut).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle server error on logout, display error message, and not navigate', () => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    authServiceMock.logout.mockReturnValue(throwError(() => errorResponse));

    component.onLogout();
    fixture.detectChanges();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component.isLoggingOut).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('A server error occurred');

    const alert = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('A server error occurred');
  });

  it('should display connection error when backend is unreachable on logout', () => {
    const errorResponse = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error'
    });
    authServiceMock.logout.mockReturnValue(throwError(() => errorResponse));

    component.onLogout();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Unable to connect to the server');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

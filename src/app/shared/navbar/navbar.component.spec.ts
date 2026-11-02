import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'isLoggedIn'], {
      authenticatedUser: signal<string | null>('admin'),
      isAuthenticated: signal<boolean>(true)
    });
    authServiceSpy.isLoggedIn.and.returnValue(true);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
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
    (authServiceSpy.isAuthenticated as any).set(false);
    authServiceSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector('#logoutBtn');
    expect(logoutBtn).toBeNull();
  });

  it('should call authService.logout and navigate to /login on success', () => {
    authServiceSpy.logout.and.returnValue(of({ message: 'Logout successful' }));

    component.onLogout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.isLoggingOut).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle server error on logout, display error message, and not navigate', () => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    authServiceSpy.logout.and.returnValue(throwError(() => errorResponse));

    component.onLogout();
    fixture.detectChanges();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.isLoggingOut).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('A server error occurred while logging out');

    const alert = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('A server error occurred while logging out');
  });

  it('should display connection error when backend is unreachable on logout', () => {
    const errorResponse = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error'
    });
    authServiceSpy.logout.and.returnValue(throwError(() => errorResponse));

    component.onLogout();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Unable to connect to the authentication server');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should prevent duplicate logout requests when already logging out', () => {
    authServiceSpy.logout.and.returnValue(of({ message: 'Logout successful' }));
    component.isLoggingOut = true;

    component.onLogout();

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});

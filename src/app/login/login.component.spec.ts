import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error when username is empty', () => {
    component.username = '';
    component.password = 'validPass';
    component.onSubmit();

    expect(component.usernameError).toBe('Username is required.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should show validation error when password is empty', () => {
    component.username = 'admin';
    component.password = '';
    component.onSubmit();

    expect(component.passwordError).toBe('Password is required.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call authService.login, clear password and navigate to /devices on success', () => {
    authServiceSpy.login.and.returnValue(of({ message: 'Login successful', username: 'admin' }));
    component.username = 'admin';
    component.password = 'password123';

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'password123'
    });
    expect(component.password).toBe('');
    expect(component.isLoading).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/devices']);
  });

  it('should display "Invalid username or password." when backend returns 401', () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Invalid username or password.' }
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.username = 'admin';
    component.password = 'wrongpass';
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid username or password.');
    expect(component.password).toBe('');
    expect(component.isLoading).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should display connection error when backend is unreachable (status 0)', () => {
    const errorResponse = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error'
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.username = 'admin';
    component.password = 'password123';
    component.onSubmit();

    expect(component.errorMessage).toContain('Unable to connect to the authentication server');
    expect(component.password).toBe('');
    expect(component.isLoading).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should prevent duplicate submission while isLoading is true', () => {
    component.isLoading = true;
    component.username = 'admin';
    component.password = 'password123';

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});

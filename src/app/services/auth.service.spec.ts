import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request with withCredentials: true', () => {
    const mockResponse = { message: 'Login successful', username: 'admin' };

    service.login({ username: 'admin', password: 'password123' }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(service.authenticatedUser()).toBe('admin');
    });

    const req = httpTesting.expectOne('https://localhost:7178/api/Auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      username: 'admin',
      password: 'password123'
    });

    req.flush(mockResponse);
  });

  it('should send logout request with withCredentials: true, empty body, and clear authenticatedUser on success', () => {
    service.authenticatedUser.set('admin');
    expect(service.isLoggedIn()).toBe(true);

    const mockLogoutResponse = { message: 'Logout successful' };

    service.logout().subscribe((res) => {
      expect(res).toEqual(mockLogoutResponse);
      expect(service.authenticatedUser()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });

    const req = httpTesting.expectOne('https://localhost:7178/api/Auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({});

    req.flush(mockLogoutResponse);
  });

  it('should NOT clear authenticatedUser if logout request fails', () => {
    service.authenticatedUser.set('admin');
    expect(service.isLoggedIn()).toBe(true);

    service.logout().subscribe({
      next: () => fail('Logout should have failed'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpTesting.expectOne('https://localhost:7178/api/Auth/logout');
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    expect(service.authenticatedUser()).toBe('admin');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should clear authenticatedUser when clearAuthState is called', () => {
    service.authenticatedUser.set('admin');
    service.clearAuthState();
    expect(service.authenticatedUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});

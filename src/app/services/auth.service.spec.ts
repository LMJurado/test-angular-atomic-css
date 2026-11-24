import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('userProgress_123456');
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('user');
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('userProgress_123456');
  });

  it('seeds the test account and complete progress for the certificate', () => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const progress = JSON.parse(localStorage.getItem('userProgress_123456') || '{}');
    const demoUser = users.find((user: { username: string }) => user.username === '123456');

    expect(demoUser.password).toBe('123456');
    expect(progress.completedModules).toEqual([1, 2, 3]);
    expect(progress.completedTopics['3']).toEqual([1, 2, 3]);
    expect(progress.completedActivities['3-3']).toEqual(['interactive', 'assignment']);
  });

  it('allows the test account to log in when the backend is unavailable', fakeAsync(() => {
    let loginSucceeded = false;

    service.login('123456', '123456').subscribe(() => {
      loginSucceeded = true;
    });
    httpTestingController.expectOne('http://localhost:3000/api/auth/login')
      .flush({}, { status: 500, statusText: 'Backend unavailable' });
    tick(500);

    expect(loginSucceeded).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.user?.username).toBe('123456');
  }));
});

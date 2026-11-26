import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { StudentGuard } from './student.guard';
import { AuthService } from '../../services/auth.service';

describe('Role guards', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isAdmin', 'isStudent'], { ready: Promise.resolve() });
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        AuthGuard, AdminGuard, StudentGuard,
        { provide: AuthService, useValue: auth }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('allows authenticated users and denies students administrative access', async () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.isAdmin.and.returnValue(false);
    const authResult = await TestBed.inject(AuthGuard).canActivate();
    const adminResult = await TestBed.inject(AdminGuard).canActivate();
    expect(authResult).toBeTrue();
    expect(adminResult).not.toBeTrue();
    expect(router.serializeUrl(adminResult as any)).toBe('/nuevo/inicio');
  });

  it('redirects unauthenticated students to login and lets students reach learning routes', async () => {
    auth.isLoggedIn.and.returnValue(false);
    auth.isAdmin.and.returnValue(false);
    auth.isStudent.and.returnValue(false);
    const denied = await TestBed.inject(StudentGuard).canActivate();
    expect(router.serializeUrl(denied as any)).toBe('/nuevo/login');

    auth.isStudent.and.returnValue(true);
    expect(await TestBed.inject(StudentGuard).canActivate()).toBeTrue();
  });
});

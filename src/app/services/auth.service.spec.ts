import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { AuthRepository } from '../core/repositories/contracts/auth.repository';
import { UserRepository } from '../core/repositories/contracts/user.repository';
import { SESSION_STORAGE_KEY } from '../core/storage/storage-keys';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jasmine.SpyObj<AuthRepository>;
  let userRepository: jasmine.SpyObj<UserRepository>;

  beforeEach(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('plataforma-ova.users.v1');
    localStorage.removeItem('registeredUsers');
    authRepository = jasmine.createSpyObj<AuthRepository>('AuthRepository', ['restoreSession', 'login', 'logout']);
    userRepository = jasmine.createSpyObj<UserRepository>('UserRepository', [
      'initialize', 'getAll', 'getById', 'getByUsernameOrEmail', 'verifyCredentials', 'create',
      'update', 'setRole', 'setStatus', 'updatePassword', 'delete', 'countAdmins'
    ]);
    userRepository.initialize.and.resolveTo();
    authRepository.restoreSession.and.resolveTo(null);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: UserRepository, useValue: userRepository }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('initializes repositories and restores the current session', async () => {
    await service.ready;
    expect(userRepository.initialize).toHaveBeenCalled();
    expect(authRepository.restoreSession).toHaveBeenCalled();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('creates public registrations with the STUDENT role', async () => {
    await service.ready;
    userRepository.create.and.resolveTo({
      id: 'student-1', name: 'Ana Pérez', nombre: 'Ana', apellido: 'Pérez', username: 'ana', email: 'ana@example.local',
      institucion: '', role: 'STUDENT', status: 'ACTIVE', createdAt: '', updatedAt: ''
    });

    const user = await service.register({ name: 'Ana Pérez', username: 'ana', email: 'ana@example.local', password: 'secret1' }).toPromise();

    expect(user.role).toBe('STUDENT');
    expect(userRepository.create).toHaveBeenCalledWith(jasmine.objectContaining({ role: 'STUDENT', username: 'ana' }));
  });

  it('prevents removing the last active administrator', async () => {
    await service.ready;
    userRepository.getById.and.resolveTo({
      id: 'admin-1', name: 'Admin', nombre: 'Admin', apellido: '', username: 'admin', email: 'admin@example.local',
      institucion: '', role: 'ADMIN', status: 'ACTIVE', createdAt: '', updatedAt: ''
    });
    userRepository.countAdmins.and.resolveTo(1);

    let error: unknown;
    try { await service.changeUserRole('admin-1', 'STUDENT'); } catch (caught) { error = caught; }
    expect(error instanceof Error && error.message).toContain('último administrador');
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

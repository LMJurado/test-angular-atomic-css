import { TestBed } from '@angular/core/testing';

import { LocalStorageUserRepository } from './local-storage-user.repository';
import { SESSION_STORAGE_KEY, USERS_STORAGE_KEY } from '../../storage/storage-keys';

describe('LocalStorageUserRepository', () => {
  let repository: LocalStorageUserRepository;

  beforeEach(() => {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('registeredUsers');
    TestBed.configureTestingModule({ providers: [LocalStorageUserRepository] });
    repository = TestBed.inject(LocalStorageUserRepository);
  });

  it('seeds the requested admins and a student without storing plaintext passwords', async () => {
    const users = await repository.getAll();
    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    expect(users.map(user => user.username)).toContain('Merculeaft');
    expect(users.map(user => user.username)).toContain('Gabomac211');
    expect(users.some(user => user.role === 'STUDENT')).toBeTrue();
    expect(stored.every((user: Record<string, unknown>) => typeof user.passwordHash === 'string' && !('password' in user))).toBeTrue();
  });

  it('seeds active administrator accounts and rejects unverified passwords', async () => {
    const users = await repository.getAll();
    expect(users.find(user => user.username === 'Merculeaft')?.role).toBe('ADMIN');
    expect(users.find(user => user.username === 'Gabomac211')?.role).toBe('ADMIN');
    expect((await repository.verifyCredentials('123456', '123456'))?.role).toBe('STUDENT');
    expect(await repository.verifyCredentials('Gabomac211', 'wrong-password')).toBeNull();
  });

  it('keeps usernames unique and supports status changes', async () => {
    await repository.create({ name: 'Estudiante', username: 'estudiante', email: 'e@example.local', password: 'secret1' });
    let duplicateError: unknown;
    try { await repository.create({ name: 'Otro', username: 'ESTUDIANTE', email: 'other@example.local', password: 'secret1' }); }
    catch (error) { duplicateError = error; }
    expect(duplicateError instanceof Error).toBeTrue();
    const student = await repository.getByUsernameOrEmail('estudiante');
    await repository.setStatus(student!.id, 'INACTIVE');
    expect(await repository.verifyCredentials('estudiante', 'secret1')).toBeNull();
  });
});

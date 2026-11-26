import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserRole, UserStatus } from '../core/models/user.model';
import { AuthRepository } from '../core/repositories/contracts/auth.repository';
import { UserRepository } from '../core/repositories/contracts/user.repository';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly userChanges$: Observable<User | null> = this.userSubject.asObservable();
  readonly ready: Promise<void>;

  constructor(
    private readonly users: UserRepository,
    private readonly authRepository: AuthRepository
  ) {
    this.ready = this.initialize();
  }

  get user(): User | null { return this.userSubject.value; }

  isLoggedIn(): boolean { return !!this.user; }
  isAdmin(): boolean { return this.user?.role === 'ADMIN' && this.user.status === 'ACTIVE'; }
  isStudent(): boolean { return this.user?.role === 'STUDENT' && this.user.status === 'ACTIVE'; }
  currentUserName(): string { return this.user?.name || ''; }
  currentUserInitials(): string { return this.user?.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?'; }

  login(usernameOrEmail: string, password: string): Observable<User> {
    return from(this.loginWhenReady(usernameOrEmail, password));
  }

  register(payload: Partial<CreateUserInput> & Record<string, any>): Observable<User> {
    return from(this.registerStudent(payload));
  }

  logout(): void {
    this.authRepository.logout();
    this.userSubject.next(null);
  }

  userExists(username: string): Observable<boolean> {
    return from(this.users.getByUsernameOrEmail(username).then(Boolean));
  }

  updateUserPassword(username: string, newPassword: string): Observable<void> {
    return from(this.users.updatePassword(username, newPassword));
  }

  listUsers(): Promise<User[]> { return this.users.getAll(); }
  getUser(id: string): Promise<User | null> { return this.users.getById(id); }

  createUser(input: CreateUserInput): Promise<User> {
    return this.users.create(input);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const current = await this.users.getById(id);
    if (!current) throw new Error('Usuario no encontrado.');
    if (current.role === 'ADMIN' && current.status === 'ACTIVE' &&
        ((input.role && input.role !== 'ADMIN') || (input.status && input.status !== 'ACTIVE')) &&
        await this.users.countAdmins() <= 1) {
      throw new Error('No puedes retirar el acceso del último administrador activo.');
    }
    const updated = await this.users.update(id, input);
    if (this.user?.id === updated.id) this.userSubject.next(updated);
    return updated;
  }

  async changeUserRole(id: string, role: UserRole): Promise<User> {
    return this.updateUser(id, { role });
  }

  async changeUserStatus(id: string, status: UserStatus): Promise<User> {
    return this.updateUser(id, { status });
  }

  async deleteUser(id: string): Promise<void> {
    const target = await this.users.getById(id);
    if (!target) throw new Error('Usuario no encontrado.');
    if (target.role === 'ADMIN' && target.status === 'ACTIVE' && await this.users.countAdmins() <= 1) {
      throw new Error('No puedes eliminar el último administrador activo.');
    }
    if (this.user?.id === id) throw new Error('Cierra sesión antes de eliminar tu propia cuenta.');
    await this.users.delete(id);
  }

  private async initialize(): Promise<void> {
    await this.users.initialize();
    this.userSubject.next(await this.authRepository.restoreSession());
  }

  private async loginWhenReady(identifier: string, password: string): Promise<User> {
    await this.ready;
    const user = await this.authRepository.login(identifier, password);
    this.userSubject.next(user);
    return user;
  }

  private async registerStudent(payload: Partial<CreateUserInput> & Record<string, any>): Promise<User> {
    await this.ready;
    return this.users.create({
      nombre: payload.nombre,
      apellido: payload.apellido,
      name: payload.name,
      username: String(payload.username || ''),
      email: String(payload.email || ''),
      institucion: payload.institucion || '',
      password: String(payload.password || ''),
      role: 'STUDENT',
      status: 'ACTIVE'
    });
  }
}

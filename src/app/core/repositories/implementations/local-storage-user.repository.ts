import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';

import { CreateUserInput, StoredUser, UpdateUserInput, User, UserRole, UserStatus } from '../../models/user.model';
import { UserRepository } from '../contracts/user.repository';
import {
  LEGACY_USERS_STORAGE_KEY, STORAGE_SCHEMA_VERSION_KEY, USERS_STORAGE_KEY
} from '../../storage/storage-keys';

const PASSWORD_ITERATIONS = 180_000;

const SEEDED_USERS: StoredUser[] = [
  {
    id: 'demo-student', name: 'Usuario de prueba', nombre: 'Usuario de prueba', apellido: 'Certificados',
    username: '123456', email: 'prueba@academia.local', institucion: 'Universidad de Nariño',
    role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    passwordSalt: 'Bx3obkGz2fiSE74PUMWK+Q==', passwordHash: '4zH+6p+6NBTni8PilPcl4QhFV7OlHlNiTyuTpLNsiZY=', passwordIterations: PASSWORD_ITERATIONS
  },
  {
    id: 'admin-luis-jurado', name: 'Luis Jurado', nombre: 'Luis', apellido: 'Jurado',
    username: 'Merculeaft', email: 'merculeaft@demo.local', institucion: '',
    role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-11-26T00:00:00.000Z', updatedAt: '2026-11-26T00:00:00.000Z',
    passwordSalt: 'yw8HkO2QOF6eBdsiFBNKsw==', passwordHash: '3eEkHTBDWsHzsxehxpoPXAvrioHgoBBQMnua9v3/JyM=', passwordIterations: PASSWORD_ITERATIONS
  },
  {
    id: 'admin-gabriel-guerrero', name: 'Gabriel Guerrero', nombre: 'Gabriel', apellido: 'Guerrero',
    username: 'Gabomac211', email: 'gabomac211@demo.local', institucion: '',
    role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-11-26T00:00:00.000Z', updatedAt: '2026-11-26T00:00:00.000Z',
    passwordSalt: 'yRAo2ggkCmT7aaP+eJiexA==', passwordHash: '0FSyrE9xkapMW5C70Dw+6FrlhOjnInHXJujqaaDrmkw=', passwordIterations: PASSWORD_ITERATIONS
  }
];

@Injectable({ providedIn: 'root' })
export class LocalStorageUserRepository extends UserRepository {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initialization?: Promise<void>;

  initialize(): Promise<void> {
    this.initialization ??= this.initializeStorage();
    return this.initialization;
  }

  async getAll(): Promise<User[]> {
    await this.initialize();
    return this.readUsers().map(({ passwordHash: _hash, passwordSalt: _salt, passwordIterations: _iterations, ...user }) => user);
  }

  async getById(id: string): Promise<User | null> {
    await this.initialize();
    const user = this.readUsers().find(item => item.id === id);
    return user ? this.toPublicUser(user) : null;
  }

  async getByUsernameOrEmail(identifier: string): Promise<User | null> {
    await this.initialize();
    const normalized = identifier.trim().toLocaleLowerCase();
    const user = this.readUsers().find(item => item.username.toLocaleLowerCase() === normalized || item.email.toLocaleLowerCase() === normalized);
    return user ? this.toPublicUser(user) : null;
  }

  async verifyCredentials(identifier: string, password: string): Promise<User | null> {
    await this.initialize();
    const normalized = identifier.trim().toLocaleLowerCase();
    const user = this.readUsers().find(item => item.username.toLocaleLowerCase() === normalized || item.email.toLocaleLowerCase() === normalized);
    if (!user || user.status !== 'ACTIVE') return null;
    return await this.verifyPassword(password, user) ? this.toPublicUser(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    await this.initialize();
    const users = this.readUsers();
    this.assertUnique(users, input.username, input.email);
    const now = new Date().toISOString();
    const name = (input.name || `${input.nombre || ''} ${input.apellido || ''}`).trim();
    const user: StoredUser = {
      id: this.newId(), name, nombre: input.nombre || name.split(' ')[0] || name,
      apellido: input.apellido || name.split(' ').slice(1).join(' '), username: input.username.trim(),
      email: input.email.trim().toLocaleLowerCase(), institucion: input.institucion || '',
      role: input.role || 'STUDENT', status: input.status || 'ACTIVE', createdAt: now, updatedAt: now,
      ...(await this.hashPassword(input.password))
    };
    users.push(user);
    this.writeUsers(users);
    return this.toPublicUser(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await this.initialize();
    const users = this.readUsers();
    const index = users.findIndex(item => item.id === id);
    if (index < 0) throw new Error('Usuario no encontrado.');
    const current = users[index];
    const username = input.username?.trim() || current.username;
    const email = input.email?.trim().toLocaleLowerCase() || current.email;
    this.assertUnique(users.filter(item => item.id !== id), username, email);
    const name = input.name?.trim() || `${input.nombre ?? current.nombre} ${input.apellido ?? current.apellido}`.trim();
    const updated: StoredUser = {
      ...current,
      ...input,
      id,
      name,
      nombre: input.nombre?.trim() || name.split(' ')[0] || current.nombre,
      apellido: input.apellido?.trim() ?? current.apellido,
      username,
      email,
      updatedAt: new Date().toISOString()
    };
    if (input.password) Object.assign(updated, await this.hashPassword(input.password));
    delete (updated as Partial<StoredUser> & { password?: string }).password;
    users[index] = updated;
    this.writeUsers(users);
    return this.toPublicUser(updated);
  }

  async setRole(id: string, role: UserRole): Promise<User> {
    return this.update(id, { role });
  }

  async setStatus(id: string, status: UserStatus): Promise<User> {
    return this.update(id, { status });
  }

  async updatePassword(username: string, password: string): Promise<void> {
    await this.initialize();
    const users = this.readUsers();
    const index = users.findIndex(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    if (index < 0) throw new Error('Usuario no encontrado.');
    users[index] = { ...users[index], ...(await this.hashPassword(password)), updatedAt: new Date().toISOString() };
    this.writeUsers(users);
  }

  async delete(id: string): Promise<void> {
    await this.initialize();
    const users = this.readUsers();
    if (!users.some(user => user.id === id)) throw new Error('Usuario no encontrado.');
    this.writeUsers(users.filter(user => user.id !== id));
  }

  async countAdmins(): Promise<number> {
    await this.initialize();
    return this.readUsers().filter(user => user.role === 'ADMIN' && user.status === 'ACTIVE').length;
  }

  private async initializeStorage(): Promise<void> {
    if (!this.isBrowser) return;
    const storage = this.storage();
    if (!storage) return;
    const users = this.readUsers();
    const legacyRaw = storage.getItem(LEGACY_USERS_STORAGE_KEY);
    if (!users.length && legacyRaw) {
      const legacyUsers = this.parse<Partial<StoredUser>[]>(legacyRaw, []);
      for (const oldUser of legacyUsers) {
        if (!oldUser.username || !oldUser.email) continue;
        const password = (oldUser as Partial<StoredUser> & { password?: string }).password;
        const now = new Date().toISOString();
        const name = `${oldUser.nombre || ''} ${oldUser.apellido || ''}`.trim() || oldUser.username;
        const stored: StoredUser = {
          id: oldUser.id || this.newId(), name, nombre: oldUser.nombre || name.split(' ')[0],
          apellido: oldUser.apellido || name.split(' ').slice(1).join(' '), username: oldUser.username,
          email: oldUser.email.toLocaleLowerCase(), institucion: oldUser.institucion || '',
          role: oldUser.role === 'ADMIN' ? 'ADMIN' : 'STUDENT', status: oldUser.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          createdAt: oldUser.createdAt || now, updatedAt: now,
          ...(password ? await this.hashPassword(password) : await this.hashPassword(this.newId()))
        };
        users.push(stored);
      }
    }
    for (const seed of SEEDED_USERS) {
      if (!users.some(user => user.username.toLocaleLowerCase() === seed.username.toLocaleLowerCase())) users.push(seed);
    }
    this.writeUsers(users);
    storage.removeItem(LEGACY_USERS_STORAGE_KEY);
    storage.setItem(STORAGE_SCHEMA_VERSION_KEY, '1');
  }

  private async hashPassword(password: string): Promise<Pick<StoredUser, 'passwordSalt' | 'passwordHash' | 'passwordIterations'>> {
    const cryptoApi = this.document.defaultView?.crypto;
    if (!cryptoApi?.subtle) throw new Error('Este navegador no permite la autenticación local de demostración.');
    const saltBuffer = new ArrayBuffer(16);
    const salt = new Uint8Array(saltBuffer);
    cryptoApi.getRandomValues(salt);
    const key = await cryptoApi.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const result = await cryptoApi.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations: PASSWORD_ITERATIONS }, key, 256);
    return { passwordSalt: this.toBase64(salt), passwordHash: this.toBase64(new Uint8Array(result)), passwordIterations: PASSWORD_ITERATIONS };
  }

  private async verifyPassword(password: string, user: StoredUser): Promise<boolean> {
    const cryptoApi = this.document.defaultView?.crypto;
    if (!cryptoApi?.subtle) return false;
    const key = await cryptoApi.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const saltBytes = this.fromBase64(user.passwordSalt);
    const saltBuffer = new ArrayBuffer(saltBytes.byteLength);
    new Uint8Array(saltBuffer).set(saltBytes);
    const result = await cryptoApi.subtle.deriveBits({
      name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations: user.passwordIterations
    }, key, 256);
    return this.toBase64(new Uint8Array(result)) === user.passwordHash;
  }

  private toPublicUser(user: StoredUser): User {
    const { passwordHash: _hash, passwordSalt: _salt, passwordIterations: _iterations, ...publicUser } = user;
    return publicUser;
  }

  private assertUnique(users: StoredUser[], username: string, email: string): void {
    const normalizedUsername = username.trim().toLocaleLowerCase();
    const normalizedEmail = email.trim().toLocaleLowerCase();
    if (users.some(user => user.username.toLocaleLowerCase() === normalizedUsername)) throw new Error('El nombre de usuario ya está registrado.');
    if (users.some(user => user.email.toLocaleLowerCase() === normalizedEmail)) throw new Error('El correo ya está registrado.');
  }

  private readUsers(): StoredUser[] {
    const raw = this.storage()?.getItem(USERS_STORAGE_KEY);
    return raw ? this.parse<StoredUser[]>(raw, []) : [];
  }

  private writeUsers(users: StoredUser[]): void {
    this.storage()?.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private storage(): Storage | null {
    try { return this.document.defaultView?.localStorage || null; } catch { return null; }
  }

  private parse<T>(raw: string, fallback: T): T {
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }

  private newId(): string {
    return this.document.defaultView?.crypto?.randomUUID?.() || `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), character => character.charCodeAt(0));
  }
}

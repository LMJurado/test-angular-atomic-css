import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

import { User } from '../../models/user.model';
import { AuthRepository } from '../contracts/auth.repository';
import { UserRepository } from '../contracts/user.repository';
import { LEGACY_SESSION_STORAGE_KEY, SESSION_STORAGE_KEY } from '../../storage/storage-keys';

@Injectable({ providedIn: 'root' })
export class LocalStorageAuthRepository extends AuthRepository {
  private readonly document = inject(DOCUMENT);

  constructor(private readonly users: UserRepository) { super(); }

  async restoreSession(): Promise<User | null> {
    await this.users.initialize();
    const storage = this.storage();
    const raw = storage?.getItem(SESSION_STORAGE_KEY) || storage?.getItem(LEGACY_SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const previous = JSON.parse(raw) as Partial<User>;
      const user = previous.id ? await this.users.getById(previous.id) : await this.users.getByUsernameOrEmail(previous.username || previous.email || '');
      if (!user || user.status !== 'ACTIVE') {
        this.logout();
        return null;
      }
      storage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      storage?.removeItem(LEGACY_SESSION_STORAGE_KEY);
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  async login(identifier: string, password: string): Promise<User> {
    const user = await this.users.verifyCredentials(identifier, password);
    if (!user) throw new Error('Credenciales incorrectas o cuenta inactiva.');
    this.storage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    this.storage()?.removeItem(SESSION_STORAGE_KEY);
    this.storage()?.removeItem(LEGACY_SESSION_STORAGE_KEY);
  }

  private storage(): Storage | null {
    try { return this.document.defaultView?.localStorage || null; } catch { return null; }
  }
}

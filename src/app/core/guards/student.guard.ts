import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class StudentGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.auth.ready;
    if (this.auth.isStudent()) return true;
    return this.router.createUrlTree([this.auth.isAdmin() ? '/nuevo/admin' : '/nuevo/login']);
  }
}

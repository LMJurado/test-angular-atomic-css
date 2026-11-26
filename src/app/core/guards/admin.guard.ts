import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.auth.ready;
    if (this.auth.isAdmin()) return true;
    return this.router.createUrlTree([this.auth.isLoggedIn() ? '/nuevo/inicio' : '/nuevo/login']);
  }
}

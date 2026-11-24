import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-modern-layout',
  templateUrl: './modern-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernLayoutComponent {
  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private router: Router
  ) {}

  isSplashPage(): boolean {
    return this.router.url === '/nuevo' || this.router.url === '/nuevo/';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/nuevo/login']);
  }
}

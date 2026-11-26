import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { SplashScreenPageLogic } from '../../pages/modern/logic/splash-screen.page-logic';
import { SoundService } from '../../services/sound.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-modern-splash',
  templateUrl: '../../pages/modern/splash.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernSplashComponent extends SplashScreenPageLogic {
  constructor(
    private modernRouter: Router,
    private modernSound: SoundService,
    public theme: ThemeService
  ) {
    super(modernRouter, modernSound);
  }

  override ngOnInit(): void {
    setTimeout(() => {
      this.isExiting = true;
      this.modernSound.playStartSound();
      setTimeout(() => this.modernRouter.navigate(['/nuevo/login']), 500);
    }, 3500);
  }
}

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'plataforma-ova-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly currentTheme = signal<Theme>(this.readTheme());

  readonly theme = this.currentTheme.asReadonly();

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  private readTheme(): Theme {
    if (!this.isBrowser) {
      return 'light';
    }

    return this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) {
      return;
    }

    this.document.documentElement.setAttribute('data-theme', theme);
    const favicon = this.document.querySelector<HTMLLinkElement>('#app-favicon');
    if (favicon) {
      favicon.href = theme === 'dark'
        ? 'assets/img/favicon-for-dark-theme.png'
        : 'assets/img/favicon-for-light-theme.png';
    }
    this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

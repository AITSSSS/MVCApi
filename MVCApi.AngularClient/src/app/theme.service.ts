import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'light-theme' | 'dark-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private static readonly themeCookieName = 'app_theme';
  private readonly themeSubject = new BehaviorSubject<AppTheme>('light-theme');
  readonly theme$: Observable<AppTheme> = this.themeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const persistedTheme = this.readThemeFromCookie();
    this.applyTheme(persistedTheme ?? 'light-theme');
  }

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const nextTheme: AppTheme =
      this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
    this.applyTheme(nextTheme);
  }

  private applyTheme(theme: AppTheme): void {
    const classList = this.document.body.classList;
    classList.remove('light-theme', 'dark-theme');
    classList.add(theme);

    this.saveThemeToCookie(theme);
    this.themeSubject.next(theme);
  }

  private readThemeFromCookie(): AppTheme | null {
    const cookies = this.document.cookie
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    const themeCookie = cookies.find((part) =>
      part.startsWith(`${ThemeService.themeCookieName}=`)
    );

    if (!themeCookie) {
      return null;
    }

    const value = decodeURIComponent(themeCookie.split('=')[1] ?? '');
    return value === 'dark-theme' || value === 'light-theme' ? value : null;
  }

  private saveThemeToCookie(theme: AppTheme): void {
    const expiresInDays = 365;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + expiresInDays);

    this.document.cookie = `${ThemeService.themeCookieName}=${encodeURIComponent(
      theme
    )}; expires=${expiresDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}

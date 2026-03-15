import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  const clearThemeCookie = () => {
    document.cookie = 'app_theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  };

  beforeEach(() => {
    clearThemeCookie();
    document.body.classList.remove('light-theme', 'dark-theme');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    clearThemeCookie();
    document.body.classList.remove('light-theme', 'dark-theme');
  });

  it('should use light theme by default', () => {
    expect(service.currentTheme).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBeTrue();
  });

  it('should read persisted theme from cookie', () => {
    clearThemeCookie();
    document.cookie = 'app_theme=dark-theme; path=/';

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const cookieBasedService = TestBed.inject(ThemeService);

    expect(cookieBasedService.currentTheme).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should toggle to dark theme and persist it in cookie', () => {
    service.toggleTheme();

    expect(service.currentTheme).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
    expect(document.cookie).toContain('app_theme=dark-theme');
  });
});

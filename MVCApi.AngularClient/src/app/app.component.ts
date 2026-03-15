import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';
import { UiFeedbackService } from './ui-feedback.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title: string = 'eshop';
  isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated;
  isLoading$: Observable<boolean> = this.uiFeedback.isLoading$;
  isDarkTheme$: Observable<boolean> = this.themeService.theme$.pipe(
    map((theme) => theme === 'dark-theme')
  );

  constructor(
    private readonly authService: AuthService,
    private readonly themeService: ThemeService,
    private readonly uiFeedback: UiFeedbackService
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

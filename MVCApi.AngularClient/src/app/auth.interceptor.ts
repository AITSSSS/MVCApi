import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { UiFeedbackService } from './ui-feedback.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    private readonly uiFeedback: UiFeedbackService
  ) {}

  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Server is unavailable. Please try again in a moment.';
    }

    if (typeof err.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }

    if (err.error?.message) {
      return err.error.message;
    }

    return `Request failed (${err.status}).`;
  }

  private handleAuthError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 401 || err.status === 403) {
      this.uiFeedback.error('You need to sign in to continue.');
      this.router.navigate(['/login'], {
        state: { data: 'You must be logged in to view this resource' },
      });
    } else {
      this.uiFeedback.error(this.getErrorMessage(err));
    }

    return throwError(() => err);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.uiFeedback.beginRequest();

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => this.handleAuthError(error)),
      finalize(() => this.uiFeedback.endRequest())
    );
  }
}

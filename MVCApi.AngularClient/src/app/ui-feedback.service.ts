import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly pendingRequestCount = new BehaviorSubject<number>(0);
  readonly isLoading$: Observable<boolean> = this.pendingRequestCount.pipe(
    map((count) => count > 0)
  );

  beginRequest(): void {
    this.pendingRequestCount.next(this.pendingRequestCount.value + 1);
  }

  endRequest(): void {
    this.pendingRequestCount.next(Math.max(this.pendingRequestCount.value - 1, 0));
  }

  success(message: string): void {
    window.alert(message);
  }

  info(message: string): void {
    window.alert(message);
  }

  error(message: string): void {
    window.alert(message);
  }

  confirmDestructive(message: string, title: string = 'Please confirm'): Observable<boolean> {
    return of(window.confirm(`${title}\n\n${message}`));
  }
}

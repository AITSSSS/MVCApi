import { TestBed } from '@angular/core/testing';
import { firstValueFrom, skip, take } from 'rxjs';
import { UiFeedbackService } from './ui-feedback.service';

describe('UiFeedbackService', () => {
  let service: UiFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiFeedbackService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should expose loading=true when request starts', async () => {
    const loadingPromise = firstValueFrom(service.isLoading$.pipe(skip(1), take(1)));

    service.beginRequest();

    await expectAsync(loadingPromise).toBeResolvedTo(true);
  });

  it('should expose loading=false after finishing request', async () => {
    service.beginRequest();
    const loadingPromise = firstValueFrom(service.isLoading$.pipe(skip(1), take(1)));

    service.endRequest();

    await expectAsync(loadingPromise).toBeResolvedTo(false);
  });
});

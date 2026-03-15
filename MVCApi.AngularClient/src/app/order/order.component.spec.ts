import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OrderService, OrderState } from 'src/api';
import { UiFeedbackService } from '../ui-feedback.service';

import { OrderComponent } from './order.component';

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let uiFeedback: jasmine.SpyObj<UiFeedbackService>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj<OrderService>('OrderService', [
      'apiOrderGetOrderByIdIdGet',
      'apiOrderChangeStatePut',
    ]);
    uiFeedback = jasmine.createSpyObj<UiFeedbackService>('UiFeedbackService', [
      'success',
      'error',
      'confirmDestructive',
    ]);

    orderService.apiOrderGetOrderByIdIdGet.and.returnValue(of({} as any));
    orderService.apiOrderChangeStatePut.and.returnValue(of({} as any));
    uiFeedback.confirmDestructive.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      declarations: [OrderComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'order-1' } } },
        },
        { provide: OrderService, useValue: orderService },
        { provide: UiFeedbackService, useValue: uiFeedback },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm destructive cancel state change', () => {
    component.selectedIdx = OrderState.Cancelled;

    component.onChangeState();

    expect(uiFeedback.confirmDestructive).toHaveBeenCalled();
    expect(orderService.apiOrderChangeStatePut).toHaveBeenCalledWith({
      orderId: 'order-1',
      state: OrderState.Cancelled,
    });
  });
});

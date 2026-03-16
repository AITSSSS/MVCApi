import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderService } from 'src/api';

import { OrdersInRangeComponent } from './orders-in-range.component';

describe('OrdersInRangeComponent', () => {
  let component: OrdersInRangeComponent;
  let fixture: ComponentFixture<OrdersInRangeComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj<OrderService>('OrderService', [
      'apiOrderGetOrdersInDateRangeGet',
    ]);
    orderService.apiOrderGetOrdersInDateRangeGet.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      declarations: [OrdersInRangeComponent],
      providers: [{ provide: OrderService, useValue: orderService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersInRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

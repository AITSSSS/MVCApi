import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { OrderService, OrderState } from 'src/api';
import { AuthService } from '../auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj<OrderService>('OrderService', [
      'apiOrderGetOrderByIdIdGet',
    ]);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: of({ id: 'u-1', domainUserId: 'c-1' }),
          },
        },
        { provide: OrderService, useValue: orderService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    localStorage.setItem('order_history', JSON.stringify(['o-1']));
    orderService.apiOrderGetOrderByIdIdGet.and.returnValue(
      of({ id: 'o-1', customer: { id: 'c-1' }, orderState: OrderState.New } as any)
    );

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('order_history');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user orders from local history', () => {
    expect(orderService.apiOrderGetOrderByIdIdGet).toHaveBeenCalledWith(
      'o-1',
      jasmine.any(String)
    );
    expect(component.orders.length).toBe(1);
    expect(component.getStatusLabel(OrderState.New)).toBe('New');
  });
});


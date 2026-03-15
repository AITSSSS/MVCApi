import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import {
  ApplicationUserDto,
  CustomerDto,
  CustomerService,
  OrderService,
  ShoppingCartDto,
} from 'src/api';
import { AuthService } from '../auth.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { UiFeedbackService } from '../ui-feedback.service';
import { CheckoutComponent } from './checkout.component';

registerLocaleData(localePl);

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let currentUser$: Subject<ApplicationUserDto | null>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let cartService: jasmine.SpyObj<ShoppingCartService>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: jasmine.SpyObj<Router>;
  let uiFeedback: jasmine.SpyObj<UiFeedbackService>;

  const userWithoutCustomer = {
    id: 'user-1',
    domainUserId: undefined,
  } as unknown as ApplicationUserDto;

  const userWithCustomer = {
    id: 'user-1',
    domainUserId: 'customer-1',
  } as unknown as ApplicationUserDto;

  const customerMock = {
    id: 'customer-1',
    addresses: [
      {
        id: 'address-1',
        country: 'Poland',
        postCode: '00-001',
        city: 'Warsaw',
        street: 'Main',
        streetNumber: '1',
      },
    ],
    contactInfos: [
      {
        id: 'contact-1',
        email: 'john@example.com',
        phoneNumber: '123456789',
      },
    ],
  } as unknown as CustomerDto;

  const cartMock = {
    id: 'cart-1',
    products: [
      {
        count: 2,
        product: {
          name: 'Product 1',
          price: { value: 10 },
        },
      },
      {
        count: 1,
        product: {
          name: 'Product 2',
          price: { value: 5 },
        },
      },
    ],
  } as unknown as ShoppingCartDto;

  beforeEach(async () => {
    currentUser$ = new Subject<ApplicationUserDto | null>();
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', [
      'apiCustomerGetCustomerByIdIdGet',
    ]);
    cartService = jasmine.createSpyObj<ShoppingCartService>('ShoppingCartService', [
      'getOrCreateCart',
      'clearCart',
    ]);
    orderService = jasmine.createSpyObj<OrderService>('OrderService', [
      'apiOrderCreateOrderPost',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    uiFeedback = jasmine.createSpyObj<UiFeedbackService>('UiFeedbackService', [
      'success',
      'error',
      'confirmDestructive',
    ]);

    customerService.apiCustomerGetCustomerByIdIdGet.and.returnValue(
      of(customerMock) as unknown as ReturnType<CustomerService['apiCustomerGetCustomerByIdIdGet']>
    );
    cartService.getOrCreateCart.and.resolveTo(cartMock);
    orderService.apiOrderCreateOrderPost.and.returnValue(
      of('order-1') as unknown as ReturnType<OrderService['apiOrderCreateOrderPost']>
    );

    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      providers: [
        { provide: AuthService, useValue: { currentUser: currentUser$.asObservable() } },
        { provide: CustomerService, useValue: customerService },
        { provide: ShoppingCartService, useValue: cartService },
        { provide: OrderService, useValue: orderService },
        { provide: Router, useValue: router },
        { provide: UiFeedbackService, useValue: uiFeedback },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show customer form when user has no customer profile', fakeAsync(() => {
    fixture.detectChanges();
    currentUser$.next(userWithoutCustomer);
    tick();
    fixture.detectChanges();

    expect(component.user).toEqual(userWithoutCustomer);
    expect(component.hasCustomer).toBeFalse();
    expect(customerService.apiCustomerGetCustomerByIdIdGet).not.toHaveBeenCalled();
    expect(component.cart).toEqual(cartMock);
    expect(component.totalPrice).toBe(25);
    expect(fixture.debugElement.query(By.css('.alert.alert-info'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-customer-form'))).toBeTruthy();
  }));

  it('should load customer data and render checkout details for existing customer', fakeAsync(() => {
    fixture.detectChanges();
    currentUser$.next(userWithCustomer);
    tick();
    fixture.detectChanges();

    expect(component.hasCustomer).toBeTrue();
    expect(customerService.apiCustomerGetCustomerByIdIdGet).toHaveBeenCalledWith('customer-1');
    expect(component.customer).toEqual(customerMock);
    expect(component.totalPrice).toBe(25);

    const selectableCards = fixture.debugElement.queryAll(By.css('div.col-md-3.card.p-2'));
    const summaryText = fixture.nativeElement.textContent as string;

    expect(selectableCards.length).toBe(2);
    expect(summaryText).toContain('Select your delivery address');
    expect(summaryText).toContain('Select your contact info');
    expect(summaryText).toContain('Product 1');
    expect(summaryText).toContain('Product 2');
  }));

  it('should show error alert when customer fetch fails', fakeAsync(() => {
    customerService.apiCustomerGetCustomerByIdIdGet.and.returnValue(
      throwError(() => new Error('failed')) as unknown as ReturnType<CustomerService['apiCustomerGetCustomerByIdIdGet']>
    );

    fixture.detectChanges();
    currentUser$.next(userWithCustomer);
    tick();
    fixture.detectChanges();

    expect(component.hasCustomer).toBeTrue();
    expect(component.customer).toBeNull();
    expect(uiFeedback.error).toHaveBeenCalledWith('Could not load customer data for checkout.');
    expect(fixture.debugElement.query(By.css('.alert.alert-error'))).toBeTruthy();
  }));

  it('should update selected indices from clicks and enable submit button', fakeAsync(() => {
    fixture.detectChanges();
    currentUser$.next(userWithCustomer);
    tick();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('div.col-md-3.card.p-2'));
    const button = fixture.debugElement.query(By.css('button.btn.btn-primary')).nativeElement as HTMLButtonElement;

    expect(button.disabled).toBeTrue();

    cards[0].triggerEventHandler('click', null);
    cards[1].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.selectedAddressIdx).toBe(0);
    expect(component.selectedContactInfoIdx).toBe(0);
    expect(button.disabled).toBeFalse();
  }));

  it('should submit order, clear cart and navigate to order page', fakeAsync(() => {
    fixture.detectChanges();
    currentUser$.next(userWithCustomer);
    tick();
    fixture.detectChanges();

    component.selectedAddressIdx = 0;
    component.selectedContactInfoIdx = 0;

    component.submitOrder();

    expect(orderService.apiOrderCreateOrderPost).toHaveBeenCalledWith({
      customerId: 'customer-1',
      cartId: 'cart-1',
      addressId: 'address-1',
      contactInfoId: 'contact-1',
    });
    expect(cartService.clearCart).toHaveBeenCalled();
    expect(uiFeedback.success).toHaveBeenCalledWith('Order has been created successfully.');
    expect(router.navigate).toHaveBeenCalledWith(['order/order-1']);
  }));

  it('should not submit order when required data is missing', () => {
    component.submitOrder();

    expect(orderService.apiOrderCreateOrderPost).not.toHaveBeenCalled();
    expect(cartService.clearCart).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});


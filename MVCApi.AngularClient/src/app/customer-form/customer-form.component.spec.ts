import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { CreateCustomer, CustomerService } from 'src/api';
import { AuthService } from '../auth.service';
import { CustomerFormComponent } from './customer-form.component';

describe('CustomerFormComponent', () => {
  let component: CustomerFormComponent;
  let fixture: ComponentFixture<CustomerFormComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let authService: { currentUser: BehaviorSubject<any>; linkCustomer: jasmine.Spy };

  const validFormValue = {
    firstName: 'Jan',
    lastName: 'Kowalski',
    dateOfBirth: '2000-01-01',
    country: 'Poland',
    city: 'Warsaw',
    street: 'Main',
    streetNumber: '10',
    postCode: '00-001',
    email: 'jan@example.com',
    phoneNumber: '123456789'
  };

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', [
      'apiCustomerCreateCustomerPost'
    ]);
    authService = {
      currentUser: new BehaviorSubject<any>({ domainUserId: undefined }),
      linkCustomer: jasmine.createSpy('linkCustomer')
    };

    customerService.apiCustomerCreateCustomerPost.and.returnValue(
      of('customer-1') as unknown as ReturnType<CustomerService['apiCustomerCreateCustomerPost']>
    );

    await TestBed.configureTestingModule({
      declarations: [CustomerFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CustomerService, useValue: customerService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose form controls through f getter', () => {
    expect(component.f['firstName']).toBe(component.form.controls['firstName']);
    expect(component.f['email']).toBe(component.form.controls['email']);
  });

  it('should be invalid when form is empty', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.f['firstName'].errors?.['required']).toBeTrue();
    expect(component.f['email'].errors?.['required']).toBeTrue();
  });

  it('should mark dateOfBirth as invalid when customer is under 18', () => {
    component.form.patchValue({
      ...validFormValue,
      dateOfBirth: `${component.minDate}-01-01`
    });

    expect(component.f['dateOfBirth'].errors?.['invalidDate']).toBeTrue();
  });

  it('should accept dateOfBirth when customer is over 18', () => {
    component.form.patchValue(validFormValue);

    expect(component.f['dateOfBirth'].errors).toBeNull();
    expect(component.form.valid).toBeTrue();
  });

  it('should not submit when form is invalid', () => {
    component.form.patchValue({
      email: 'invalid-email'
    });

    component.submit();

    expect(component.submitted).toBeTrue();
    expect(component.form.valid).toBeFalse();
    expect(customerService.apiCustomerCreateCustomerPost).not.toHaveBeenCalled();
    expect(authService.linkCustomer).not.toHaveBeenCalled();
  });

  it('should submit valid form and link customer when user has no linked customer', () => {
    authService.currentUser.next({ domainUserId: undefined });
    component.form.patchValue(validFormValue);

    component.submit();

    expect(component.submitted).toBeTrue();
    expect(customerService.apiCustomerCreateCustomerPost).toHaveBeenCalledWith(
      component.form.value as CreateCustomer
    );
    expect(authService.linkCustomer).toHaveBeenCalledWith('customer-1');
  });

  it('should submit valid form and not link customer when user already has linked customer', () => {
    authService.currentUser.next({ domainUserId: 'existing-customer-id' });
    component.form.patchValue(validFormValue);

    component.submit();

    expect(customerService.apiCustomerCreateCustomerPost).toHaveBeenCalledWith(
      component.form.value as CreateCustomer
    );
    expect(authService.linkCustomer).not.toHaveBeenCalled();
  });
});


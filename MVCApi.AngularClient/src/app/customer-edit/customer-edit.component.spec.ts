import { formatDate } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  AddressDto,
  AddressService,
  ContactInfoDto,
  ContactInfoService,
  CustomerDto,
  CustomerService
} from 'src/api';

import { CustomerEditComponent } from './customer-edit.component';

describe('CustomerEditComponent', () => {
  let component: CustomerEditComponent;
  let fixture: ComponentFixture<CustomerEditComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let addressService: jasmine.SpyObj<AddressService>;
  let contactInfoService: jasmine.SpyObj<ContactInfoService>;
  let router: jasmine.SpyObj<Router>;

  const customerMock: CustomerDto = {
    id: 'customer-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    dateOfBirth: '2000-01-02T00:00:00',
    addresses: [{ id: 'address-1' } as AddressDto],
    contactInfos: [{ id: 'contact-1' } as ContactInfoDto]
  };

  const addressMock: AddressDto = {
    id: 'address-1',
    country: 'Poland',
    city: 'Warsaw',
    street: 'Main',
    streetNumber: '10',
    postCode: '00-001'
  };

  const contactInfoMock: ContactInfoDto = {
    id: 'contact-1',
    email: 'jan@example.com',
    phoneNumber: '123456789'
  };

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', [
      'apiCustomerGetCustomerByIdIdGet',
      'apiCustomerEditCustomerIdPut'
    ]);
    addressService = jasmine.createSpyObj<AddressService>('AddressService', [
      'apiAddressGetAddressByIdIdGet'
    ]);
    contactInfoService = jasmine.createSpyObj<ContactInfoService>('ContactInfoService', [
      'apiContactInfoGetContactInfoByIdIdGet'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    customerService.apiCustomerGetCustomerByIdIdGet.and.returnValue(
      of(customerMock) as unknown as ReturnType<CustomerService['apiCustomerGetCustomerByIdIdGet']>
    );
    customerService.apiCustomerEditCustomerIdPut.and.returnValue(
      of({}) as unknown as ReturnType<CustomerService['apiCustomerEditCustomerIdPut']>
    );
    addressService.apiAddressGetAddressByIdIdGet.and.returnValue(
      of(addressMock) as unknown as ReturnType<AddressService['apiAddressGetAddressByIdIdGet']>
    );
    contactInfoService.apiContactInfoGetContactInfoByIdIdGet.and.returnValue(
      of(contactInfoMock) as unknown as ReturnType<ContactInfoService['apiContactInfoGetContactInfoByIdIdGet']>
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CustomerEditComponent],
      providers: [
        { provide: CustomerService, useValue: customerService },
        { provide: AddressService, useValue: addressService },
        { provide: ContactInfoService, useValue: contactInfoService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ customerId: 'customer-1' })
            }
          }
        },
        { provide: Router, useValue: router }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    spyOn(console, 'log');
    fixture = TestBed.createComponent(CustomerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customer data on init and patch form', () => {
    expect(component.customerId).toBe('customer-1');
    expect(customerService.apiCustomerGetCustomerByIdIdGet).toHaveBeenCalledWith('customer-1');
    expect(addressService.apiAddressGetAddressByIdIdGet).toHaveBeenCalledWith('address-1');
    expect(contactInfoService.apiContactInfoGetContactInfoByIdIdGet).toHaveBeenCalledWith('contact-1');

    expect(component.form.value).toEqual(jasmine.objectContaining({
      firstName: 'Jan',
      lastName: 'Kowalski',
      dateOfBirth: formatDate('2000-01-02T00:00:00', 'YYYY-MM-dd', 'en-US'),
      country: 'Poland',
      city: 'Warsaw',
      street: 'Main',
      streetNumber: '10',
      postCode: '00-001',
      email: 'jan@example.com',
      phoneNumber: '123456789'
    }));
  });

  it('should not submit when form is invalid', () => {
    component.form.patchValue({ email: 'invalid-email' });

    component.submit();

    expect(component.submitted).toBeTrue();
    expect(component.form.valid).toBeFalse();
    expect(customerService.apiCustomerEditCustomerIdPut).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should submit valid form and navigate to customers list', () => {
    component.submit();

    expect(component.submitted).toBeTrue();
    expect(customerService.apiCustomerEditCustomerIdPut).toHaveBeenCalledWith(
      'customer-1',
      jasmine.objectContaining({
        firstName: 'Jan',
        lastName: 'Kowalski',
        dateOfBirth: formatDate('2000-01-02T00:00:00', 'YYYY-MM-dd', 'en-US'),
        country: 'Poland',
        city: 'Warsaw',
        street: 'Main',
        streetNumber: '10',
        postCode: '00-001',
        email: 'jan@example.com',
        phoneNumber: '123456789'
      })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/', 'customers']);
  });

  it('should mark dateOfBirth as invalid when customer is not over 18', () => {
    component.form.patchValue({
      dateOfBirth: `${component.minDate}-01-01`
    });

    expect(component.f['dateOfBirth'].errors?.['invalidDate']).toBeTrue();
  });

  it('should expose form controls through f getter', () => {
    expect(component.f['firstName']).toBe(component.form.controls['firstName']);
    expect(component.f['email']).toBe(component.form.controls['email']);
  });
});

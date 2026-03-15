import { formatDate } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
import { UiFeedbackService } from '../ui-feedback.service';

describe('CustomerEditComponent', () => {
  let component: CustomerEditComponent;
  let fixture: ComponentFixture<CustomerEditComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let addressService: jasmine.SpyObj<AddressService>;
  let contactInfoService: jasmine.SpyObj<ContactInfoService>;
  let router: jasmine.SpyObj<Router>;
  let uiFeedback: jasmine.SpyObj<UiFeedbackService>;

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
      'apiAddressGetAddressByIdIdGet',
      'apiAddressEditAddressIdPut'
    ]);
    contactInfoService = jasmine.createSpyObj<ContactInfoService>('ContactInfoService', [
      'apiContactInfoGetContactInfoByIdIdGet',
      'apiContactInfoEditContactInfoIdPut'
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    uiFeedback = jasmine.createSpyObj<UiFeedbackService>('UiFeedbackService', ['success', 'error']);

    customerService.apiCustomerGetCustomerByIdIdGet.and.returnValue(
      of(customerMock) as unknown as ReturnType<CustomerService['apiCustomerGetCustomerByIdIdGet']>
    );
    customerService.apiCustomerEditCustomerIdPut.and.returnValue(
      of({}) as unknown as ReturnType<CustomerService['apiCustomerEditCustomerIdPut']>
    );
    addressService.apiAddressGetAddressByIdIdGet.and.returnValue(
      of(addressMock) as unknown as ReturnType<AddressService['apiAddressGetAddressByIdIdGet']>
    );
    addressService.apiAddressEditAddressIdPut.and.returnValue(
      of({}) as unknown as ReturnType<AddressService['apiAddressEditAddressIdPut']>
    );
    contactInfoService.apiContactInfoGetContactInfoByIdIdGet.and.returnValue(
      of(contactInfoMock) as unknown as ReturnType<ContactInfoService['apiContactInfoGetContactInfoByIdIdGet']>
    );
    contactInfoService.apiContactInfoEditContactInfoIdPut.and.returnValue(
      of({}) as unknown as ReturnType<ContactInfoService['apiContactInfoEditContactInfoIdPut']>
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
        { provide: Router, useValue: router },
        { provide: UiFeedbackService, useValue: uiFeedback }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
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
      dateOfBirth: formatDate('2000-01-02T00:00:00', 'yyyy-MM-dd', 'en-US'),
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

  it('should submit valid form and navigate to customers list', fakeAsync(() => {
    component.submit();

    expect(component.submitted).toBeTrue();
    expect(component.saveStatus).toBe('saved');
    expect(component.isSaving).toBeFalse();
    expect(customerService.apiCustomerEditCustomerIdPut).toHaveBeenCalledWith(
      'customer-1',
      jasmine.objectContaining({
        firstName: 'Jan',
        lastName: 'Kowalski',
        dateOfBirth: formatDate('2000-01-02T00:00:00', 'yyyy-MM-dd', 'en-US'),
      })
    );
    expect(addressService.apiAddressEditAddressIdPut).toHaveBeenCalledWith(
      'address-1',
      jasmine.objectContaining({
        country: 'Poland',
        city: 'Warsaw',
        street: 'Main',
        streetNumber: '10',
        postCode: '00-001',
      })
    );
    expect(contactInfoService.apiContactInfoEditContactInfoIdPut).toHaveBeenCalledWith(
      'contact-1',
      jasmine.objectContaining({
        email: 'jan@example.com',
        phoneNumber: '123456789',
      })
    );
    expect(uiFeedback.success).toHaveBeenCalledWith('Customer updated successfully.');

    tick(701);
    expect(router.navigate).toHaveBeenCalledWith(['/', 'customers']);
  }));

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

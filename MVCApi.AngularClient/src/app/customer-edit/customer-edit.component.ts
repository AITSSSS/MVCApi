import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import {
  AddressDto,
  AddressService,
  ContactInfoDto,
  ContactInfoService,
  CustomerDto,
  CustomerService,
  EditAddress,
  EditContactInfo,
  EditCustomer,
} from 'src/api';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent implements OnInit {
  form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', [Validators.required, this.dateValidator.bind(this)]),
    country: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    street: new FormControl('', Validators.required),
    streetNumber: new FormControl('', Validators.required),
    postCode: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', Validators.required),
  });

  customer: Observable<CustomerDto> | null = null;
  address: Observable<AddressDto> | null = null;
  contactInfo: Observable<ContactInfoDto> | null = null;
  customerId: string = '';
  private addressId: string | null = null;
  private contactInfoId: string | null = null;
  minDate : number = new Date().getFullYear() - 18;
  submitted : boolean = false;
  isSaving: boolean = false;
  saveStatus: 'idle' | 'saved' | 'error' = 'idle';

  constructor(
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
    private readonly contactInfoService: ContactInfoService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly uiFeedback: UiFeedbackService
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('customerId')?.toString() ?? '';
    this.fetchCustomer();
  }

  submit(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }

    this.isSaving = true;
    this.saveStatus = 'idle';

    const editCustomer: EditCustomer = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      dateOfBirth: this.form.value.dateOfBirth ?? undefined,
    };

    const editAddress: EditAddress = {
      id: this.addressId ?? undefined,
      country: this.form.value.country,
      city: this.form.value.city,
      street: this.form.value.street,
      streetNumber: this.form.value.streetNumber,
      postCode: this.form.value.postCode,
    };

    const editContactInfo: EditContactInfo = {
      contactInfoId: this.contactInfoId ?? undefined,
      email: this.form.value.email,
      phoneNumber: this.form.value.phoneNumber,
    };

    const addressRequest = this.addressId
      ? this.addressService.apiAddressEditAddressIdPut(this.addressId, editAddress)
      : of('');
    const contactRequest = this.contactInfoId
      ? this.contactInfoService.apiContactInfoEditContactInfoIdPut(
          this.contactInfoId,
          editContactInfo
        )
      : of('');

    forkJoin([
      this.customerService.apiCustomerEditCustomerIdPut(this.customerId, editCustomer),
      addressRequest,
      contactRequest,
    ]).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveStatus = 'saved';
        this.uiFeedback.success('Customer updated successfully.');
        setTimeout(() => this.router.navigate(['/', 'customers']), 700);
      },
      error: () => {
        this.isSaving = false;
        this.saveStatus = 'error';
        this.uiFeedback.error('Could not update customer.');
      },
    });
  }

  private fetchCustomer(): void {
    this.customer = this.customerService.apiCustomerGetCustomerByIdIdGet(this.customerId);

    this.customer.subscribe({
      next: (res) => {
        this.form.patchValue({ firstName: res.firstName });
        this.form.patchValue({ lastName: res.lastName });
        this.form.patchValue({
          dateOfBirth: formatDate(<string>res.dateOfBirth, 'yyyy-MM-dd', 'en-US'),
        });

        this.addressId = res.addresses?.[0]?.id?.toString() ?? null;
        this.contactInfoId = res.contactInfos?.[0]?.id?.toString() ?? null;

        if (this.addressId) {
          this.address = this.addressService.apiAddressGetAddressByIdIdGet(this.addressId);
          this.address.subscribe((addressRes) => {
            this.form.patchValue({ country: addressRes.country });
            this.form.patchValue({ city: addressRes.city });
            this.form.patchValue({ street: addressRes.street });
            this.form.patchValue({ streetNumber: addressRes.streetNumber });
            this.form.patchValue({ postCode: addressRes.postCode });
          });
        }

        if (this.contactInfoId) {
          this.contactInfo = this.contactInfoService.apiContactInfoGetContactInfoByIdIdGet(
            this.contactInfoId
          );

          this.contactInfo.subscribe((contactInfoRes) => {
            this.form.patchValue({ email: contactInfoRes.email });
            this.form.patchValue({ phoneNumber: contactInfoRes.phoneNumber });
          });
        }
      },
      error: () => this.uiFeedback.error('Could not load customer for editing.'),
    });
  }

  get f(): { [key: string]: AbstractControl; }
  {
    return this.form.controls;
  }

  dateValidator(control: FormControl): { [s: string]: boolean } | null {
    if (control.value) {
      const date = new Date(this.form.controls['dateOfBirth'].value);
      const dateYr = date.getFullYear();
      const minDate = this.minDate;

      if (minDate<=dateYr) {
        return { 'invalidDate': true }
      }
    }
    return null;
  }
}

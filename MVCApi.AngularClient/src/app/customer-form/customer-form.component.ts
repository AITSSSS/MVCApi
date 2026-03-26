import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateCustomer, CustomerService } from 'src/api';
import { isEmpty } from 'src/util';
import { AuthService } from '../auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
})
export class CustomerFormComponent implements OnInit {
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

  minDate : number = new Date().getFullYear() - 18;
  submitted : boolean = false;
  isSaving: boolean = false;
  saveStatus: 'idle' | 'saved' | 'error' = 'idle';

  constructor(
    private readonly customerService: CustomerService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  submit(): void {
    this.submitted = true;
    var createCustomer: CreateCustomer = this.form.value;
    if (this.form.valid) {
      this.isSaving = true;
      this.saveStatus = 'idle';

      this.customerService
        .apiCustomerCreateCustomerPost(createCustomer)
        .subscribe({
          next: (res) => {
            this.authService.currentUser.pipe(take(1)).subscribe({
              next: (user) => {
                if (isEmpty(user.domainUserId)) {
                  this.authService.linkCustomer(res);
                }
                this.isSaving = false;
                this.saveStatus = 'saved';
                void this.router.navigate(['/customers']);
              },
              error: () => {
                this.isSaving = false;
                this.saveStatus = 'error';
              },
            });
          },
          error: () => {
            this.isSaving = false;
            this.saveStatus = 'error';
          },
        });
    }
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

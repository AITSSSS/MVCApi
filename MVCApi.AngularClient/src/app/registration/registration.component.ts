import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService, emailRegex } from 'src/api';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  message: string | null = null;
  successfulRegistration: boolean = false;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {}

  submit() {
    this.message = '';
    if (this.form.valid) {
      this.userService.apiUserCreateUserPost(this.form.value).subscribe({
        next: () => {
          this.message = 'Successfully created user account';
          this.successfulRegistration = true;
        },
        error: (e) => {
          console.log(e);
          this.message = 'Failed to create user account';
        },
      });
    } else {
      if (!this.form.value.userName) {
        this.message = 'No username';
      }
      else if(!emailRegex.test(this.form.value.email)) {
        this.message = 'Bad email';
      }
      else if(!this.form.value.password) {
        this.message = 'No password';
      }
    }
  }
}

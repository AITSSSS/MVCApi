import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { emailRegex } from 'src/api';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  message: string = '';
  public isLoggedIn: boolean = false;

  private returnUrl: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.authService.isAuthenticated.subscribe(
      (val) => (this.isLoggedIn = val)
    );
    var extra = this.router.getCurrentNavigation()?.extras.state as {
      data: string;
    };
    if (extra) {
      this.message = extra.data;
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/';
    });
  }

  submit() {
    this.message = '';
    const email = this.form.value.email.trim();
    if (this.form.valid) {
      this.authService.login(
        email,
        this.form.value.password,
        this.form.value.rememberMe
      );

      this.authService.isAuthenticated.subscribe({
        next: (res) => {
          if (res) {
            this.router.navigate([this.returnUrl]);
          }
        },
      });

      this.authService.error.subscribe({
        next: (err) => {
          if (err) {
            this.message = err;
          }
        }
      });
    } else {
      if(!emailRegex.test(email)) {
        this.message = 'Bad email';
      }
      else if(!this.form.value.password) {
        this.message = 'No password';
      }
    }
  }
}

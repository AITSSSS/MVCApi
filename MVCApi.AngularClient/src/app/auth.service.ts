import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  ReplaySubject,
  throwError,
} from 'rxjs';
import { ApplicationUserDto, UserService } from 'src/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<ApplicationUserDto>({});
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private currentUserTokenSubject = new BehaviorSubject<string>('');
  public currentUserToken = this.currentUserTokenSubject.asObservable();

  private hasErrorSubject = new BehaviorSubject<string | null>(null);
  public error = this.hasErrorSubject.asObservable();

  constructor(private readonly api: UserService) {
    var token = this.getToken();
    if (token) {
      this.currentUserTokenSubject.next(token);
      this.isAuthenticatedSubject.next(true);
      this.api.apiUserGetCurrentUserGet().subscribe({
        next: (response) => {
          this.currentUserSubject.next(response);
        },
        error: () => {
          this.currentUserTokenSubject.next('');
          this.isAuthenticatedSubject.next(false);
        },
      });
    }
  }

  login(email: string, password: string, rememberMe: boolean = false) {
    this.hasErrorSubject.next(null);
    return this.api
      .apiUserSignInPost({ email, password, rememberMe })
      .subscribe({
        next: (response) => {
          if (response.isAuthSuccessful) {
            this.isAuthenticatedSubject.next(true);
            this.currentUserTokenSubject.next(response.token!);
            sessionStorage.setItem('jwt_token', response.token!);
            if (rememberMe) localStorage.setItem('jwt_token', response.token!);
            this.api.apiUserGetCurrentUserGet().subscribe((realUser) => {
              this.currentUserSubject.next(realUser);
            });
          }
          else {
            this.isAuthenticatedSubject.next(false);
            this.hasErrorSubject.next('Cannot authenticate user.');
          }
        },
        error: (err) => {
          console.log(err);
          let msg = 'Something went wrong';
          if(err?.error.includes('User with identifier')) {
            msg = 'No user with such email in database.';
          } else if (err?.error?.message) {
            msg = err?.error?.message;
          } 
          this.hasErrorSubject.next(msg);
        }
      });
  }

  logout() {
    this.currentUserSubject.next({});
    this.currentUserTokenSubject.next('');
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  }

  linkCustomer(customerId: string) {
    this.currentUser.subscribe({
      next: (user) => {
        this.api
          .apiUserLinkCustomerPut({
            customerId: customerId,
            userId: user.id,
          })
          .subscribe({
            next: (res) => {
              this.currentUserSubject.next({
                domainUserId: customerId,
                id: res,
              });
            },
            error: (err) => console.log(err),
          });
      },
    });
  }

  getToken() {
    var token = sessionStorage.getItem('jwt_token');
    if (!token) {
      token = localStorage.getItem('jwt_token');
      if (token) sessionStorage.setItem('jwt_token', token);
    }

    return token;
  }
}

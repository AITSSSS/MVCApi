import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { SignInComponent } from './sign-in/sign-in.component';
import {
  AddressService,
  BASE_PATH,
  CartService,
  CategoryService,
  Configuration,
  ContactInfoService,
  CurrencyService,
  CustomerService,
  OrderService,
  ProductService,
  UserService,
} from 'src/api';
import { SignOutComponent } from './sign-out/sign-out.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { PaginationComponent } from './pagination/pagination.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AuthService } from './auth.service';
import { AuthInterceptor } from './auth.interceptor';
import { Router } from '@angular/router';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { OrdersInRangeComponent } from './orders-in-range/orders-in-range.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderComponent } from './order/order.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductsPdfComponent } from './products-pdf/products-pdf.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';

import(
  /* webpackExclude: /\.d\.ts$/ */
  /* webpackMode: "lazy-once" */
  /* webpackChunkName: "i18n-extra" */
  `@/../@angular/common/locales/${navigator.language}.mjs`
).then((locale) => {
  registerLocaleData(locale.default);
});

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CustomersComponent,
    CustomerFormComponent,
    CustomerEditComponent,
    CategoryTreeComponent,
    CategoriesComponent,
    ProductsComponent,
    ProductComponent,
    SignInComponent,
    SignOutComponent,
    ShoppingCartComponent,
    PaginationComponent,
    CheckoutComponent,
    ProductFormComponent,
    ProductEditComponent,
    CategoryFormComponent,
    OrdersInRangeComponent,
    OrderComponent,
    ProductDetailsComponent,
    ProductsPdfComponent,
    RegistrationComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxChartsModule,
  ],
  providers: [
    { provide: BASE_PATH, useValue: 'http://localhost:5000' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: UserService,
      useFactory: (httpClient: HttpClient) =>
        new UserService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: CustomerService,
      useFactory: (httpClient: HttpClient) =>
        new CustomerService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: AddressService,
      useFactory: (httpClient: HttpClient) =>
        new AddressService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: CartService,
      useFactory: (httpClient: HttpClient) =>
        new CartService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: CategoryService,
      useFactory: (httpClient: HttpClient) =>
        new CategoryService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: ContactInfoService,
      useFactory: (httpClient: HttpClient) =>
        new ContactInfoService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: CurrencyService,
      useFactory: (httpClient: HttpClient) =>
        new CurrencyService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: OrderService,
      useFactory: (httpClient: HttpClient) =>
        new OrderService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
    {
      provide: ProductService,
      useFactory: (httpClient: HttpClient) =>
        new ProductService(
          httpClient,
          'http://localhost:5000',
          new Configuration({
            credentials: {
              Bearer: () =>
                sessionStorage.getItem('jwt_token') ??
                localStorage.getItem('jwt_token') ??
                '',
            },
          })
        ),
      deps: [HttpClient],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

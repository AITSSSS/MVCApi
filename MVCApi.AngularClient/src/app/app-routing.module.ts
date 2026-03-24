import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { CategoriesComponent } from './categories/categories.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CustomersComponent } from './customers/customers.component';
import { OrdersInRangeComponent } from './orders-in-range/orders-in-range.component';
import { ProductsComponent } from './products/products.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { OrderComponent } from './order/order.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { Observable } from 'rxjs';
import { ProductsPdfComponent } from './products-pdf/products-pdf.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customers/add', component: CustomerFormComponent },
  { path: 'customers/edit/:customerId', component: CustomerEditComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/add', component: CategoryFormComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/add', component: ProductFormComponent },
  { path: 'products/edit/:productId', component: ProductEditComponent },
  { path: 'products/details/:productId', component: ProductDetailsComponent },
  { path: 'products/pdf', component: ProductsPdfComponent },
  { path: 'login', component: SignInComponent },
  { path: 'signout', component: SignOutComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: ShoppingCartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'popularity', component: OrdersInRangeComponent },
  { path: 'order/:orderId', component: OrderComponent },
  { path: 'register', component: RegistrationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

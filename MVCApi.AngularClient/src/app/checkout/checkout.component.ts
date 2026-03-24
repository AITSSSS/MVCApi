import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationUserDto,
  CustomerDto,
  CustomerService,
  OrderService,
  ShoppingCartDto,
  ShoppingCartState,
} from 'src/api';
import { isEmpty } from 'src/util';
import { AuthService } from '../auth.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  user: ApplicationUserDto | null = null;
  hasCustomer: boolean = false;
  customer: CustomerDto | null = null;
  selectedAddressIdx: number = -1;
  selectedContactInfoIdx: number = -1;
  cart: ShoppingCartDto | null = null;
  totalPrice: number = 0;
  currency: string = getLocaleCurrencyCode(navigator.language) ?? 'PLN';

  // TODO: Display form for creating new addresses and contact infos
  constructor(
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly cartService: ShoppingCartService,
    private readonly orderService: OrderService,
    private readonly router: Router,
    private readonly uiFeedback: UiFeedbackService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        this.hasCustomer = !isEmpty(this.user.domainUserId);
        if (this.hasCustomer) {
          this.customerService
            .apiCustomerGetCustomerByIdIdGet(this.user.domainUserId!)
            .subscribe({
              next: (customer) => {
                this.customer = customer;
              },
              error: () =>
                this.uiFeedback.error('Could not load customer data for checkout.'),
            });
        }
      },
    });

    this.cartService.getOrCreateCart().then((cart) => {
      this.cart = cart;
      this.totalPrice = this.calculateTotal();
    });
  }

  onChangeAddressIdx(i: number) {
    this.selectedAddressIdx = i;
  }

  onChangeContactInfoIdx(i: number) {
    this.selectedContactInfoIdx = i;
  }

  submitOrder() {
    if (
      !(
        this.customer &&
        this.cart &&
        this.customer.addresses &&
        this.customer.contactInfos
      )
    )
      return;

    this.orderService
      .apiOrderCreateOrderPost({
        customerId: this.customer.id,
        cartId: this.cart.id,
        addressId: this.customer.addresses[this.selectedAddressIdx].id,
        contactInfoId:
          this.customer.contactInfos[this.selectedContactInfoIdx].id,
      })
      .subscribe({
        next: (orderId) => {
          this.storeOrderInHistory(orderId);
          this.cartService.clearCart();
          this.uiFeedback.success('Order has been created successfully.');
          this.router.navigate([`order/${orderId}`]);
        },
        error: () => this.uiFeedback.error('Could not submit order.'),
      });
  }

  private storeOrderInHistory(orderId: string): void {
    if (!orderId) {
      return;
    }

    const existingValue = localStorage.getItem('order_history');
    let orderIds: string[] = [];

    if (existingValue) {
      try {
        const parsed = JSON.parse(existingValue) as unknown;
        if (Array.isArray(parsed)) {
          orderIds = parsed.filter(
            (item): item is string => typeof item === 'string' && item.length > 0
          );
        }
      } catch {
        orderIds = [];
      }
    }

    if (!orderIds.includes(orderId)) {
      orderIds.push(orderId);
      localStorage.setItem('order_history', JSON.stringify(orderIds));
    }
  }

  private calculateTotal(): number {
    let lTotal = 0;
    this.cart?.products?.forEach((p) => {
      lTotal += p.count! * p.product?.price?.value!;
    });

    return lTotal;
  }
}

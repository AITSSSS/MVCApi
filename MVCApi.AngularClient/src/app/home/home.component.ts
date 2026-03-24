import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApplicationUserDto, OrderDto, OrderService, OrderState } from 'src/api';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user: ApplicationUserDto | null = null;
  orders: OrderDto[] = [];
  isLoading: boolean = false;

  private readonly currency: string = this.resolveCurrency();

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        this.loadOrders();
      },
    });
  }

  get hasOrders(): boolean {
    return this.orders.length > 0;
  }

  getStatusLabel(state?: OrderState): string {
    switch (state) {
      case OrderState.New:
        return 'New';
      case OrderState.InProgress:
        return 'In progress';
      case OrderState.Ended:
        return 'Ended';
      case OrderState.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  private loadOrders(): void {
    if (!this.user?.domainUserId) {
      this.orders = [];
      return;
    }

    const orderIds = this.getOrderHistoryIds();
    if (orderIds.length === 0) {
      this.orders = [];
      return;
    }

    this.isLoading = true;
    const requests = orderIds.map((id) =>
      this.orderService.apiOrderGetOrderByIdIdGet(id, this.currency)
    );

    forkJoin(requests).subscribe({
      next: (orders) => {
        this.orders = orders
          .filter((order) => order.customer?.id === this.user?.domainUserId)
          .sort((a, b) => {
            const bTime = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
            const aTime = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
            return bTime - aTime;
          });
        this.isLoading = false;
      },
      error: () => {
        this.orders = [];
        this.isLoading = false;
      },
    });
  }

  private resolveCurrency(): string {
    try {
      return getLocaleCurrencyCode(navigator.language) ?? 'PLN';
    } catch {
      return 'PLN';
    }
  }

  private getOrderHistoryIds(): string[] {
    const value = localStorage.getItem('order_history');
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .slice(-50)
        .reverse();
    } catch {
      return [];
    }
  }
}


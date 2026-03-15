import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderDto, OrderService, OrderState } from 'src/api';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  order: Observable<OrderDto> | null = null;
  currency: string = getLocaleCurrencyCode(navigator.language) ?? 'PLN';
  selectedIdx: number = 0;

  private orderId: string | null = null;

  constructor(
    private readonly orderService: OrderService,
    private readonly route: ActivatedRoute,
    private readonly uiFeedback: UiFeedbackService
  ) {
    var orderId = this.route.snapshot.paramMap.get('orderId')?.toString();
    if (orderId) {
      this.orderId = orderId;
      this.order = this.orderService.apiOrderGetOrderByIdIdGet(
        orderId,
        getLocaleCurrencyCode(navigator.language) ?? 'PLN'
      );
    }
  }

  ngOnInit(): void {}

  onChangeState(): void {
    if (!this.orderId) {
      return;
    }

    const applyStateChange = () => {
      this.orderService
        .apiOrderChangeStatePut({
          orderId: this.orderId!,
          state: this.selectedIdx as OrderState,
        })
        .subscribe({
          next: () => this.uiFeedback.success('Order state has been updated.'),
          error: () => this.uiFeedback.error('Could not update order state.'),
        });
    };

    if (this.selectedIdx === OrderState.Cancelled) {
      this.uiFeedback
        .confirmDestructive(
          'Canceling an order is destructive and may be irreversible. Continue?',
          'Cancel order'
        )
        .subscribe((confirmed) => {
          if (confirmed) {
            applyStateChange();
          }
        });
      return;
    }

    applyStateChange();
  }
}

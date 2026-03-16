import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { OrderDto, OrderService, ProductDto } from 'src/api';

interface ChartPoint {
  name: string;
  value: number;
}

interface ChartData {
  name: string;
  series: ChartPoint[];
}

@Component({
  selector: 'app-orders-in-range',
  templateUrl: './orders-in-range.component.html',
  styleUrls: ['./orders-in-range.component.css'],
})
export class OrdersInRangeComponent implements OnInit {
  startDateSubject: BehaviorSubject<Date> = new BehaviorSubject<Date>(
    new Date()
  );
  endDateSubject: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());

  orders: OrderDto[] | null = null;
  private orderMap: Map<Date, Map<ProductDto, number>> | null = null;

  chartData: ChartData[] | null = null;
  rangeAdjustedNotice: boolean = false;
  private noticeTimeoutId: number | null = null;

  constructor(private readonly orderService: OrderService) {
    combineLatest({
      startDate: this.startDateSubject,
      endDate: this.endDateSubject,
    }).subscribe((res) => {
      this.orderService
        .apiOrderGetOrdersInDateRangeGet(
          new Date(res.startDate).toISOString(),
          new Date(res.endDate).toISOString(),
          getLocaleCurrencyCode(navigator.language) ?? 'PLN'
        )
        .subscribe((orders) => {
          var map = new Map<Date, Map<ProductDto, number>>();
          this.orders = orders;
          orders.forEach((order) => {
            order.shoppingCart?.products?.forEach((product) => {
              var currentDate = new Date(
                new Date(order.dateCreated!).toDateString()
              );
              var currentDateValue = map.get(currentDate);
              if (!currentDateValue) {
                map.set(currentDate, new Map<ProductDto, number>());
                currentDateValue = map.get(currentDate);
              }

              if (!currentDateValue) throw new Error();

              var currentCount = currentDateValue.get(product.product!);
              if (!currentCount) {
                currentDateValue.set(product.product!, product.count!);
              } else {
                currentDateValue.set(
                  product.product!,
                  currentCount + product.count!
                );
              }
            });
          });
          this.orderMap = map;
          this.createChartData();
        });
    });
  }

  ngOnInit(): void {}

  get startDateInput(): string {
    return this.toInputDate(this.startDateSubject.value);
  }

  get endDateInput(): string {
    return this.toInputDate(this.endDateSubject.value);
  }

  get maxStartDateInput(): string {
    return this.endDateInput;
  }

  get minEndDateInput(): string {
    return this.startDateInput;
  }

  onStartDateChange(value: string): void {
    const nextStartDate = this.fromInputDate(value);
    if (!nextStartDate) return;

    const currentEndDate = this.endDateSubject.value;
    this.startDateSubject.next(nextStartDate);

    // Keep range valid when start moves past end.
    if (nextStartDate > currentEndDate) {
      this.endDateSubject.next(nextStartDate);
      this.showRangeAdjustedNotice();
    }
  }

  onEndDateChange(value: string): void {
    const nextEndDate = this.fromInputDate(value);
    if (!nextEndDate) return;

    const currentStartDate = this.startDateSubject.value;
    this.endDateSubject.next(nextEndDate);

    // Keep range valid when end moves before start.
    if (nextEndDate < currentStartDate) {
      this.startDateSubject.next(nextEndDate);
      this.showRangeAdjustedNotice();
    }
  }

  private toInputDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private fromInputDate(value: string): Date | null {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private showRangeAdjustedNotice(): void {
    this.rangeAdjustedNotice = true;

    if (this.noticeTimeoutId !== null) {
      window.clearTimeout(this.noticeTimeoutId);
    }

    this.noticeTimeoutId = window.setTimeout(() => {
      this.rangeAdjustedNotice = false;
      this.noticeTimeoutId = null;
    }, 2500);
  }

  private createChartData() {
    var chartData: ChartData[] = new Array<ChartData>();
    if (this.orderMap) {
      this.orderMap.forEach((dateMap, date) => {
        dateMap.forEach((count, product) => {
          var data = chartData.find((x) => x.name == product.name);
          if (!data) {
            chartData.push({
              name: product.name!,
              series: new Array<ChartPoint>(),
            });
            data = chartData.find((x) => x.name == product.name);
          }

          if (!data) throw new Error();

          data.series.push({ name: date.toDateString(), value: count });
        });
      });
    }

    this.chartData = chartData;
  }
}

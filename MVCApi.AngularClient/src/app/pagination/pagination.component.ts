import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit {
  @Input() pageIndex: number = 1;
  @Output() pageIndexChange = new EventEmitter<number>();

  @Input() totalPages: number = 1;
  @Output() totalPagesChange = new EventEmitter<number>();

  @Input() pageSize: number = 5;
  @Output() pageSizeChange = new EventEmitter<number>();

  @Input() hasPreviousPage: boolean = false;
  @Input() hasNextPage: boolean = false;

  allowedPageSizes: Array<number> = [5, 10, 25, 50, 100, 250];

  rangeWithDots: Array<string | number> = [];

  constructor() {}

  ngOnInit(): void {
    this.calculateRange();
  }

  ngOnChanges(changes: SimpleChange) {
    this.calculateRange();
  }

  onPageSizeChanged(event: Event | { value: number }) {
    if ((event as { value: number }).value !== undefined) {
      this.pageSize = Number((event as { value: number }).value);
      this.pageSizeChange.emit(this.pageSize);
      return;
    }

    let target = (event as Event).target as HTMLInputElement;
    if (!target) return;

    this.pageSize = parseInt(target.value);
    this.pageSizeChange.emit(this.pageSize);
  }

  onPreviousPage() {
    this.pageIndex--;
    this.pageIndexChange.emit(this.pageIndex);
  }

  onNextPage() {
    this.pageIndex++;
    this.pageIndexChange.emit(this.pageIndex);
  }

  onPageChange(pageIdx: number | string | null) {
    if (pageIdx === null || pageIdx === '...') return;

    if (typeof pageIdx === 'number') {
      this.pageIndex = pageIdx;
    } else {
      const parsed = parseInt(pageIdx, 10);
      if (Number.isNaN(parsed)) return;
      this.pageIndex = parsed;
    }

    this.pageIndexChange.emit(this.pageIndex)
  }

  private calculateRange() {
    var current = this.pageIndex,
      last = this.totalPages,
      delta = 2,
      left = current - delta,
      right = current + delta + 1,
      range = [],
      rangeWithDots = [],
      l;

    for (let i = 1; i <= last; i++) {
      if ((i === 1 || i === last || i >= left) && i < right) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    this.rangeWithDots = rangeWithDots;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @Input() data: ConfirmDialogData = {
    title: 'Please confirm',
    message: '',
  };

  @Output() readonly closed = new EventEmitter<boolean>();

  confirm(): void {
    this.closed.emit(true);
  }

  cancel(): void {
    this.closed.emit(false);
  }
}

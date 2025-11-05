import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface AppointmentDetails {
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  isOpen = input.required<boolean>();
  appointmentDetails = input<AppointmentDetails | null>();

  confirm = output<void>();
  close = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    this.close.emit();
  }
}
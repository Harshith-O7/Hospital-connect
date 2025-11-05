import { Component, ChangeDetectionStrategy, signal, inject, output, input } from '@angular/core';
import { AppointmentBookingService } from '../../services/appointment-booking.service';
import { AuthService } from '../../services/auth.service';
import { View } from '../../app.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private bookingService = inject(AppointmentBookingService);
  private authService = inject(AuthService);

  currentView = input.required<View>();
  navigate = output<View>();

  navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'patients', label: 'Patients' },
    { key: 'tools', label: 'AI Tools' },
    { key: 'feedback', label: 'Feedback' },
  ];

  remindersVisible = signal(false);
  bookedAppointments = this.bookingService.sortedAppointments;

  onNavigate(view: View) {
    this.navigate.emit(view);
  }

  toggleReminders() {
    this.remindersVisible.update(visible => !visible);
  }

  cancelAppointment(id: string) {
    this.bookingService.cancelAppointment(id);
  }

  formatAppointmentDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  logout() {
    this.authService.logout();
  }
}

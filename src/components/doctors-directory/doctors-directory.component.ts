import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { Doctor, PatientDataService } from '../../services/patient-data.service';
import { AppointmentBookingService } from '../../services/appointment-booking.service';
import { AuthService } from '../../services/auth.service';
import { AddDoctorModalComponent } from '../add-doctor-modal/add-doctor-modal.component';

@Component({
  selector: 'app-doctors-directory',
  templateUrl: './doctors-directory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AddDoctorModalComponent],
})
export class DoctorsDirectoryComponent {
  private patientService = inject(PatientDataService);
  private bookingService = inject(AppointmentBookingService);
  private authService = inject(AuthService);
  private allDoctors = this.patientService.doctors;

  searchTerm = signal('');
  scheduleForDoctor = output<string>();
  isAdmin = this.authService.isAdmin;
  isAddModalOpen = signal(false);

  filteredDoctors = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const doctors = this.allDoctors();
    if (!term) {
      return doctors;
    }
    return doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(term) ||
      doctor.specialization.toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onSchedule(doctorName: string) {
    this.bookingService.prefillScheduler.set(doctorName);
    this.scheduleForDoctor.emit(doctorName);
  }

  deleteDoctor(doctorId: string, event: MouseEvent) {
    event.stopPropagation();
    this.patientService.deleteDoctor(doctorId);
  }

  openAddDoctorModal() {
    this.isAddModalOpen.set(true);
  }

  closeAddDoctorModal() {
    this.isAddModalOpen.set(false);
  }

  handleAddDoctor(doctorData: Omit<Doctor, 'id'>) {
    this.patientService.addDoctor(doctorData);
    this.closeAddDoctorModal();
  }

  getDoctorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(1).join('');
  }
}
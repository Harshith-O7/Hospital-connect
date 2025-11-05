import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { Patient, Doctor, PatientDataService } from '../../services/patient-data.service';
import { PatientDetailsModalComponent } from '../patient-details-modal/patient-details-modal.component';

type DirectoryView = 'patients' | 'doctors';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PatientDetailsModalComponent],
})
export class DirectoryComponent {
  private patientService = inject(PatientDataService);
  // FIX: Corrected to use the 'patients' signal from the service instead of the non-existent 'getPatients' method.
  private allPatients = this.patientService.patients;
  // FIX: Corrected to use the 'doctors' signal from the service instead of the non-existent 'getDoctors' method.
  private allDoctors = this.patientService.doctors;
  
  scheduleForDoctor = output<string>();
  
  currentView = signal<DirectoryView>('patients');
  searchTerm = signal('');

  // Patient Logic
  isModalOpen = signal(false);
  selectedPatient = signal<Patient | null>(null);

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    // FIX: Since allPatients is a signal, its value must be read with `()`.
    if (!term) return this.allPatients();
    // FIX: Since allPatients is a signal, its value must be read with `()`.
    return this.allPatients().filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term));
  });

  openPatientDetails(patient: Patient) {
    this.selectedPatient.set(patient);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // Doctor Logic
  filteredDoctors = computed(() => {
    const term = this.searchTerm().toLowerCase();
    // FIX: Since allDoctors is a signal, its value must be read with `()`.
    if (!term) return this.allDoctors();
    // FIX: Since allDoctors is a signal, its value must be read with `()`.
    return this.allDoctors().filter(d => d.name.toLowerCase().includes(term) || d.specialization.toLowerCase().includes(term));
  });
  
  onSchedule(doctorName: string) {
    this.scheduleForDoctor.emit(doctorName);
  }

  getDoctorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(1).join('');
  }

  // Common Logic
  setView(view: DirectoryView) {
    this.currentView.set(view);
    this.searchTerm.set('');
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  getConditionClass(condition: Patient['condition']): string {
    switch (condition) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Stable': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Recovering': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Under Observation': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  }
}

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Patient, PatientDataService } from '../../services/patient-data.service';
import { PatientDetailsModalComponent } from '../patient-details-modal/patient-details-modal.component';
import { AuthService } from '../../services/auth.service';
import { AddPatientModalComponent } from '../add-patient-modal/add-patient-modal.component';

@Component({
  selector: 'app-patient-directory',
  templateUrl: './patient-directory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PatientDetailsModalComponent, AddPatientModalComponent],
})
export class PatientDirectoryComponent {
  private patientService = inject(PatientDataService);
  private authService = inject(AuthService);
  private allPatients = this.patientService.patients;

  isAdmin = this.authService.isAdmin;
  searchTerm = signal('');

  isDetailsModalOpen = signal(false);
  isAddModalOpen = signal(false);
  selectedPatient = signal<Patient | null>(null);

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const patients = this.allPatients();
    if (!term) {
      return patients;
    }
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(term) ||
      patient.id.toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
  
  openPatientDetails(patient: Patient) {
    this.selectedPatient.set(patient);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.isDetailsModalOpen.set(false);
  }

  openAddPatientModal() {
    this.isAddModalOpen.set(true);
  }

  closeAddPatientModal() {
    this.isAddModalOpen.set(false);
  }

  handleAddPatient(patientData: Omit<Patient, 'id'>) {
    this.patientService.addPatient(patientData);
    this.closeAddPatientModal();
  }

  deletePatient(patientId: string, event: MouseEvent) {
    event.stopPropagation();
    this.patientService.deletePatient(patientId);
  }

  getConditionClass(condition: Patient['condition']): string {
    switch (condition) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400';
      case 'Stable':
        return 'bg-green-500/20 text-green-400';
      case 'Recovering':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Under Observation':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  }
}
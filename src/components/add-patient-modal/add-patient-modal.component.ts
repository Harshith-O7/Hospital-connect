import { Component, ChangeDetectionStrategy, inject, signal, input, output, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Doctor, Patient, PatientDataService } from '../../services/patient-data.service';

declare var flatpickr: any;

@Component({
  selector: 'app-add-patient-modal',
  templateUrl: './add-patient-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPatientModalComponent implements AfterViewInit {
  isOpen = input.required<boolean>();
  close = output<void>();
  add = output<Omit<Patient, 'id'>>();

  private patientService = inject(PatientDataService);
  doctors = this.patientService.doctors;
  conditions: Patient['condition'][] = ['Stable', 'Critical', 'Recovering', 'Under Observation'];

  @ViewChild('datePicker') datePickerEl!: ElementRef;
  private fpInstance: any;

  name = signal('');
  age = signal<number | null>(null);
  room = signal('');
  condition = signal<Patient['condition']>('Stable');
  doctor = signal('');
  admissionDate = signal('');

  isFormValid = computed(() => {
    return this.name().trim() && this.age() !== null && this.age()! > 0 && this.room().trim() && this.doctor() && this.admissionDate();
  });

  ngAfterViewInit() {
    if (this.datePickerEl) {
      this.fpInstance = flatpickr(this.datePickerEl.nativeElement, {
        altInput: true,
        altFormat: 'F j, Y',
        dateFormat: 'Y-m-d',
        defaultDate: 'today',
        onChange: ([selectedDate]: Date[]) => {
          if (selectedDate) {
            this.admissionDate.set(selectedDate.toISOString().split('T')[0]);
          }
        },
      });
      // Set initial value
      this.admissionDate.set(new Date().toISOString().split('T')[0]);
    }
  }

  onNameInput(event: Event) { this.name.set((event.target as HTMLInputElement).value); }
  onAgeInput(event: Event) { this.age.set((event.target as HTMLInputElement).valueAsNumber || null); }
  onRoomInput(event: Event) { this.room.set((event.target as HTMLInputElement).value); }
  onConditionChange(event: Event) { this.condition.set((event.target as HTMLSelectElement).value as Patient['condition']); }
  onDoctorChange(event: Event) { this.doctor.set((event.target as HTMLSelectElement).value); }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (!this.isFormValid()) return;
    
    this.add.emit({
      name: this.name(),
      age: this.age()!,
      room: this.room(),
      condition: this.condition(),
      doctor: this.doctor(),
      admissionDate: this.admissionDate()
    });
    this.resetForm();
  }

  private resetForm() {
    this.name.set('');
    this.age.set(null);
    this.room.set('');
    this.condition.set('Stable');
    this.doctor.set('');
    this.admissionDate.set(new Date().toISOString().split('T')[0]);
    if (this.fpInstance) {
      this.fpInstance.setDate('today', true);
    }
  }
}
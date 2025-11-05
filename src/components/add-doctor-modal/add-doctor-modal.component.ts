import { Component, ChangeDetectionStrategy, signal, input, output, computed } from '@angular/core';
import { Doctor } from '../../services/patient-data.service';

@Component({
  selector: 'app-add-doctor-modal',
  templateUrl: './add-doctor-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDoctorModalComponent {
  isOpen = input.required<boolean>();
  close = output<void>();
  add = output<Omit<Doctor, 'id'>>();

  name = signal('');
  specialization = signal('');

  isFormValid = computed(() => this.name().trim() && this.specialization().trim());

  onNameInput(event: Event) { this.name.set((event.target as HTMLInputElement).value); }
  onSpecializationInput(event: Event) { this.specialization.set((event.target as HTMLInputElement).value); }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (!this.isFormValid()) return;
    
    this.add.emit({
      name: this.name(),
      specialization: this.specialization()
    });
    this.resetForm();
  }

  private resetForm() {
    this.name.set('');
    this.specialization.set('');
  }
}
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { Patient } from '../../services/patient-data.service';

@Component({
  selector: 'app-patient-details-modal',
  templateUrl: './patient-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetailsModalComponent {
  isOpen = input.required<boolean>();
  patient = input<Patient | null>();

  close = output<void>();

  contactEmail = computed(() => {
    const p = this.patient();
    if (!p) return '';
    return `${p.name.toLowerCase().replace(/\s/g, '.')}@medconnect.hosp`;
  });

  contactPhone = computed(() => {
    const p = this.patient();
    if (!p) return '';
    const idNum = p.id.replace('P', '');
    return `(555) ${idNum}-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  
  onClose() {
    this.close.emit();
  }

  getConditionClass(condition: Patient['condition'] | undefined): string {
    if (!condition) return 'bg-slate-500/20 text-slate-400';
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
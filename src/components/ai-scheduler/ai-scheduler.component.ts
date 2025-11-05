import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { PatientDataService, Doctor } from '../../services/patient-data.service';
import { AppointmentBookingService } from '../../services/appointment-booking.service';
import { ConfirmationModalComponent, AppointmentDetails } from '../confirmation-modal/confirmation-modal.component';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface AppointmentRequest {
  doctorName?: string;
  patientName?: string;
  appointmentType?: string;
  timePreference?: string;
  preferredDate?: string;
}

interface SuggestedSlot {
    doctor: Doctor;
    time: string;
    day: string;
    date: Date;
    id: string;
}

@Component({
  selector: 'app-ai-scheduler',
  templateUrl: './ai-scheduler.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmationModalComponent],
})
export class AiSchedulerComponent {
  private geminiService = inject(GeminiService);
  private patientService = inject(PatientDataService);
  private bookingService = inject(AppointmentBookingService);

  requestText = signal('');
  status = signal<Status>('idle');
  errorMessage = signal('');
  suggestedSlots = signal<SuggestedSlot[]>([]);
  
  private doctors = this.patientService.doctors;
  bookedAppointmentIds = computed(() => new Set(this.bookingService.bookedAppointments().map(a => a.id)));

  isModalOpen = signal(false);
  slotToConfirm = signal<SuggestedSlot | null>(null);

  modalDetails = computed<AppointmentDetails | null>(() => {
    const slot = this.slotToConfirm();
    if (!slot) return null;
    return {
      doctorName: slot.doctor.name,
      specialization: slot.doctor.specialization,
      date: slot.day,
      time: slot.time,
    };
  });

  constructor() {
    effect(() => {
      const doctorName = this.bookingService.prefillScheduler();
      if (doctorName) {
        this.requestText.set(`Book an appointment with ${doctorName} for `);
        this.bookingService.prefillScheduler.set(null); // Reset after use
      }
    });
  }

  async findAppointments() {
    if (!this.requestText().trim()) return;
    
    this.status.set('loading');
    this.suggestedSlots.set([]);
    this.errorMessage.set('');

    const fullRequest = this.requestText().trim();

    try {
      const parsedRequest: AppointmentRequest = await this.geminiService.scheduleAppointment(fullRequest);
      
      let relevantDoctors = this.doctors();
      if (parsedRequest.doctorName) {
        const lowerCaseDoctorName = parsedRequest.doctorName.toLowerCase().replace('dr. ', '');
        relevantDoctors = this.doctors().filter(d => d.name.toLowerCase().includes(lowerCaseDoctorName));
      }
      if (relevantDoctors.length === 0) {
        relevantDoctors = this.doctors();
      }

      const slots: SuggestedSlot[] = [];
      const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (parsedRequest.preferredDate) {
          const parts = parsedRequest.preferredDate.split('-').map(p => parseInt(p, 10));
          const selected = new Date(parts[0], parts[1] - 1, parts[2]);
          selected.setHours(0,0,0,0);
          
          const day = selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
          const usedTimes = new Set<string>();

          while(slots.length < 3 && usedTimes.size < times.length) {
            const doctor = relevantDoctors[Math.floor(Math.random() * relevantDoctors.length)];
            const time = times[Math.floor(Math.random() * times.length)];
            if (!usedTimes.has(time)) {
              const id = `${selected.toISOString()}-${time}-${doctor.name}`;
              slots.push({ doctor, day, time, date: selected, id });
              usedTimes.add(time);
            }
          }
      } else {
        for (let i = 0; i < 3; i++) {
          const appointmentDate = new Date(today);
          appointmentDate.setDate(today.getDate() + i + 1);

          const doctor = relevantDoctors[Math.floor(Math.random() * relevantDoctors.length)];
          const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(appointmentDate);
          const time = times[Math.floor(Math.random() * times.length)];
          const id = `${appointmentDate.toISOString()}-${time}-${doctor.name}`;
          slots.push({ doctor, day, time, date: appointmentDate, id });
        }
      }

      this.suggestedSlots.set(slots);
      this.status.set('success');

    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred while scheduling.';
      this.errorMessage.set(message);
      this.status.set('error');
    }
  }

  onInput(event: Event) {
    this.requestText.set((event.target as HTMLTextAreaElement).value);
  }

  getDoctorInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(n => n[0]).slice(1).join('');
  }

  initiateBooking(slot: SuggestedSlot) {
    this.slotToConfirm.set(slot);
    this.isModalOpen.set(true);
  }

  confirmBooking() {
    const slot = this.slotToConfirm();
    if (slot) {
      this.bookingService.bookAppointment({
        doctor: slot.doctor,
        date: slot.date,
        time: slot.time
      });
    }
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.slotToConfirm.set(null);
  }

  isSlotBooked(slotId: string): boolean {
    return this.bookedAppointmentIds().has(slotId);
  }
}
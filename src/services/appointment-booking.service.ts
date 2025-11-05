import { Injectable, signal, computed, effect } from '@angular/core';

export interface BookedAppointment {
  id: string; // Unique ID for the appointment
  doctorName: string;
  specialization: string;
  date: string; // ISO string date for storage
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentBookingService {
  private readonly storageKey = 'bookedAppointments';
  
  bookedAppointments = signal<BookedAppointment[]>([]);
  prefillScheduler = signal<string | null>(null);

  sortedAppointments = computed(() => 
    this.bookedAppointments().slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedAppointments = localStorage.getItem(this.storageKey);
      if (storedAppointments) {
        this.bookedAppointments.set(JSON.parse(storedAppointments));
      }
    }

    effect(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.bookedAppointments()));
      }
    });
  }

  bookAppointment(appointment: { doctor: { name: string; specialization: string; }; date: Date; time: string; }): void {
    const newAppointment: BookedAppointment = {
      id: `${appointment.date.toISOString()}-${appointment.time}-${appointment.doctor.name}`,
      doctorName: appointment.doctor.name,
      specialization: appointment.doctor.specialization,
      date: appointment.date.toISOString(),
      time: appointment.time
    };

    if (!this.bookedAppointments().some(a => a.id === newAppointment.id)) {
      this.bookedAppointments.update(appointments => [...appointments, newAppointment]);
    }
  }

  cancelAppointment(appointmentId: string): void {
    this.bookedAppointments.update(appointments => 
      appointments.filter(a => a.id !== appointmentId)
    );
  }

  isAppointmentBooked(appointmentId: string): boolean {
    return this.bookedAppointments().some(a => a.id === appointmentId);
  }
}

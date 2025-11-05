import { Injectable, signal } from '@angular/core';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
  condition: 'Stable' | 'Critical' | 'Recovering' | 'Under Observation';
  doctor: string;
  admissionDate: string; // YYYY-MM-DD
}

export interface Appointment {
  time: string; // e.g., '09:00 AM'
  patientName: string;
  doctorName: string;
  type: 'Consultation' | 'Check-up' | 'Follow-up' | 'Surgery' | 'Therapy';
}


@Injectable({
  providedIn: 'root'
})
export class PatientDataService {
  private doctorsSignal = signal<Doctor[]>([
    { id: 'D001', name: 'Dr. Emily Carter', specialization: 'Cardiology' },
    { id: 'D002', name: 'Dr. Ben Adams', specialization: 'Neurology' },
    { id: 'D003', name: 'Dr. Olivia Chen', specialization: 'Pediatrics' },
    { id: 'D004', name: 'Dr. Marcus Rodriguez', specialization: 'Orthopedics' },
    { id: 'D005', name: 'Dr. Sofia Garcia', specialization: 'Oncology' },
    { id: 'D006', name: 'Dr. Leo Maxwell', specialization: 'Dermatology' },
    { id: 'D007', name: 'Dr. Isabella Wright', specialization: 'Gastroenterology' },
    { id: 'D008', name: 'Dr. Jacob Lee', specialization: 'Urology' },
    { id: 'D009', name: 'Dr. Ava King', specialization: 'Endocrinology' },
    { id: 'D010', name: 'Dr. Noah Scott', specialization: 'Pulmonology' },
    { id: 'D011', name: 'Dr. Mia Green', specialization: 'Nephrology' },
    { id: 'D012', name: 'Dr. Liam Baker', specialization: 'Infectious Disease' },
    { id: 'D013', name: 'Dr. Harper Hill', specialization: 'Rheumatology' },
    { id: 'D014', name: 'Dr. Ethan Nelson', specialization: 'Psychiatry' },
    { id: 'D015', name: 'Dr. Chloe Campbell', specialization: 'General Surgery' },
  ]);

  private patientsSignal = signal<Patient[]>([
    { id: 'P001', name: 'John Smith', age: 45, room: '301A', condition: 'Stable', doctor: 'Dr. Emily Carter', admissionDate: this.getDate(-2) },
    { id: 'P002', name: 'Jane Doe', age: 32, room: '302B', condition: 'Critical', doctor: 'Dr. Ben Adams', admissionDate: this.getDate(0) },
    { id: 'P003', name: 'Peter Jones', age: 68, room: '410A', condition: 'Recovering', doctor: 'Dr. Emily Carter', admissionDate: this.getDate(-5) },
    { id: 'P004', name: 'Mary Johnson', age: 75, room: '412C', condition: 'Stable', doctor: 'Dr. Olivia Chen', admissionDate: this.getDate(-1) },
    { id: 'P005', name: 'David Williams', age: 51, room: '305A', condition: 'Under Observation', doctor: 'Dr. Ben Adams', admissionDate: this.getDate(-1) },
    { id: 'P006', name: 'Linda Brown', age: 28, room: '501B', condition: 'Stable', doctor: 'Dr. Olivia Chen', admissionDate: this.getDate(-3) },
    { id: 'P007', name: 'James Wilson', age: 63, room: '502D', condition: 'Recovering', doctor: 'Dr. Emily Carter', admissionDate: this.getDate(-6) },
    { id: 'P008', name: 'Patricia Miller', age: 58, room: '404E', condition: 'Critical', doctor: 'Dr. Sofia Garcia', admissionDate: this.getDate(0) },
    { id: 'P009', name: 'Robert Davis', age: 49, room: '308A', condition: 'Stable', doctor: 'Dr. Marcus Rodriguez', admissionDate: this.getDate(-4) },
    { id: 'P010', name: 'Jennifer Garcia', age: 35, room: '511C', condition: 'Under Observation', doctor: 'Dr. Leo Maxwell', admissionDate: this.getDate(-2) },
    { id: 'P011', name: 'Michael Rodriguez', age: 71, room: '415B', condition: 'Recovering', doctor: 'Dr. Isabella Wright', admissionDate: this.getDate(-7) },
    { id: 'P012', name: 'Elizabeth Martinez', age: 42, room: '309F', condition: 'Stable', doctor: 'Dr. Jacob Lee', admissionDate: this.getDate(-3) },
    { id: 'P013', name: 'William Hernandez', age: 80, room: '420A', condition: 'Critical', doctor: 'Dr. Ava King', admissionDate: this.getDate(-1) },
    { id: 'P014', name: 'Susan Lopez', age: 22, room: '515G', condition: 'Stable', doctor: 'Dr. Noah Scott', admissionDate: this.getDate(0) },
    { id: 'P015', name: 'Joseph Gonzalez', age: 55, room: '312D', condition: 'Under Observation', doctor: 'Dr. Mia Green', admissionDate: this.getDate(-4) },
    { id: 'P016', name: 'Jessica Perez', age: 66, room: '422E', condition: 'Recovering', doctor: 'Dr. Liam Baker', admissionDate: this.getDate(-6) },
    { id: 'P017', name: 'Thomas Sanchez', age: 39, room: '518H', condition: 'Stable', doctor: 'Dr. Harper Hill', admissionDate: this.getDate(-2) },
    { id: 'P018', name: 'Karen Ramirez', age: 60, room: '425F', condition: 'Stable', doctor: 'Dr. Ethan Nelson', admissionDate: this.getDate(-5) },
    { id: 'P019', name: 'Daniel Clark', age: 48, room: '315C', condition: 'Critical', doctor: 'Dr. Chloe Campbell', admissionDate: this.getDate(-1) },
    { id: 'P020', name: 'Nancy Lewis', age: 53, room: '520I', condition: 'Under Observation', doctor: 'Dr. Emily Carter', admissionDate: this.getDate(0) },
  ]);

  private readonly appointments: Appointment[] = [
    { time: '08:30 AM', patientName: 'John Smith', doctorName: 'Dr. Emily Carter', type: 'Follow-up' },
    { time: '09:00 AM', patientName: 'Jane Doe', doctorName: 'Dr. Ben Adams', type: 'Consultation' },
    { time: '09:15 AM', patientName: 'Daniel Clark', doctorName: 'Dr. Chloe Campbell', type: 'Surgery' },
    { time: '09:45 AM', patientName: 'Patricia Miller', doctorName: 'Dr. Sofia Garcia', type: 'Consultation' },
    { time: '10:00 AM', patientName: 'Mary Johnson', doctorName: 'Dr. Olivia Chen', type: 'Check-up' },
    { time: '10:30 AM', patientName: 'David Williams', doctorName: 'Dr. Ben Adams', type: 'Follow-up' },
    { time: '11:00 AM', patientName: 'Robert Davis', doctorName: 'Dr. Marcus Rodriguez', type: 'Therapy' },
    { time: '11:30 AM', patientName: 'Linda Brown', doctorName: 'Dr. Olivia Chen', type: 'Check-up' },
    { time: '01:00 PM', patientName: 'William Hernandez', doctorName: 'Dr. Ava King', type: 'Consultation' },
    { time: '01:45 PM', patientName: 'Jennifer Garcia', doctorName: 'Dr. Leo Maxwell', type: 'Follow-up' },
    { time: '02:15 PM', patientName: 'Nancy Lewis', doctorName: 'Dr. Emily Carter', type: 'Check-up' },
    { time: '03:00 PM', patientName: 'James Wilson', doctorName: 'Dr. Emily Carter', type: 'Therapy' },
    { time: '03:30 PM', patientName: 'Susan Lopez', doctorName: 'Dr. Noah Scott', type: 'Consultation' },
  ];

  doctors = this.doctorsSignal.asReadonly();
  patients = this.patientsSignal.asReadonly();

  private getDate(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }

  getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  deletePatient(patientId: string): void {
    this.patientsSignal.update(patients => patients.filter(p => p.id !== patientId));
  }

  addPatient(patientData: Omit<Patient, 'id'>): void {
    const existingIds = this.patientsSignal().map(p => parseInt(p.id.substring(1), 10));
    const newIdNumber = Math.max(0, ...existingIds) + 1;
    const newPatient: Patient = {
      ...patientData,
      id: `P${newIdNumber.toString().padStart(3, '0')}`,
    };
    this.patientsSignal.update(patients => [...patients, newPatient]);
  }

  deleteDoctor(doctorId: string): void {
    this.doctorsSignal.update(doctors => doctors.filter(d => d.id !== doctorId));
  }

  addDoctor(doctorData: Omit<Doctor, 'id'>): void {
    const existingIds = this.doctorsSignal().map(d => parseInt(d.id.substring(1), 10));
    const newIdNumber = Math.max(0, ...existingIds) + 1;
    const newDoctor: Doctor = {
      ...doctorData,
      id: `D${newIdNumber.toString().padStart(3, '0')}`,
    };
    this.doctorsSignal.update(doctors => [...doctors, newDoctor]);
  }
}
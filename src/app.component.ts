import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientDirectoryComponent } from './components/patient-directory/patient-directory.component';
import { DoctorsDirectoryComponent } from './components/doctors-directory/doctors-directory.component';
import { AiSchedulerComponent } from './components/ai-scheduler/ai-scheduler.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { SymptomCheckerComponent } from './components/symptom-checker/symptom-checker.component';

export type View = 'dashboard' | 'doctors' | 'patients' | 'appointments' | 'tools' | 'feedback';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    PatientDirectoryComponent,
    DoctorsDirectoryComponent,
    AiSchedulerComponent,
    FeedbackComponent,
    SymptomCheckerComponent,
  ],
})
export class AppComponent {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;

  currentView = signal<View>('dashboard');

  handleNavigation(view: View) {
    this.currentView.set(view);
  }
  
  handleScheduleForDoctor(doctorName: string) {
    this.currentView.set('appointments');
  }
}
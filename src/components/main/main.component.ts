import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { AiSchedulerComponent } from '../ai-scheduler/ai-scheduler.component';
import { DirectoryComponent } from '../directory/directory.component';
import { SymptomCheckerComponent } from '../symptom-checker/symptom-checker.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AiSchedulerComponent,
    DirectoryComponent,
    SymptomCheckerComponent,
    FeedbackComponent,
    DashboardComponent,
  ],
})
export class MainComponent {
  @ViewChild(AiSchedulerComponent) aiScheduler!: AiSchedulerComponent;

  handleScheduleForDoctor(doctorName: string) {
    const text = `Book an appointment with ${doctorName} for `;
    this.aiScheduler.requestText.set(text);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
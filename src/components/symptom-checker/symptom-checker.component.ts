import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';

type Status = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-symptom-checker',
  templateUrl: './symptom-checker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymptomCheckerComponent {
  private geminiService = inject(GeminiService);

  symptoms = signal('');
  response = signal('');
  status = signal<Status>('idle');
  parsedResponse = signal({ disclaimer: '', content: '' });

  async checkSymptoms() {
    if (!this.symptoms().trim()) return;
    
    this.status.set('loading');
    this.response.set('');
    this.parsedResponse.set({ disclaimer: '', content: '' });

    try {
      const result = await this.geminiService.checkSymptoms(this.symptoms());
      this.response.set(result);
      this.parseGeminiResponse(result);
      this.status.set('success');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.response.set(`Error: ${errorMessage}`);
      this.parsedResponse.set({ disclaimer: '', content: `Error: ${errorMessage}` });
      this.status.set('error');
    }
  }

  private parseGeminiResponse(text: string) {
    const disclaimerRegex = /^(DISCLAIMER:.*?)(?:\n\n|\r\n\r\n)/is;
    const match = text.match(disclaimerRegex);
    
    if (match) {
        const disclaimer = match[1].trim();
        const content = text.substring(match[0].length).trim().replace(/\n/g, '<br>');
        this.parsedResponse.set({ disclaimer, content });
    } else {
        this.parsedResponse.set({ disclaimer: '', content: text.replace(/\n/g, '<br>') });
    }
  }

  onSymptomsInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.symptoms.set(textarea.value);
  }
}

import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

type Status = 'idle' | 'submitting' | 'submitted';
type Category = 'General' | 'Doctor Experience' | 'Facility' | 'AI Tools';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackComponent {
  rating = signal(0);
  hoverRating = signal(0);
  comment = signal('');
  category = signal<Category>('General');
  status = signal<Status>('idle');

  isFormValid = () => this.rating() > 0 && this.comment().trim().length > 0;

  setRating(newRating: number) {
    this.rating.set(newRating);
  }

  setHoverRating(newHoverRating: number) {
    this.hoverRating.set(newHoverRating);
  }

  onCommentInput(event: Event) {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  onCategoryChange(event: Event) {
    this.category.set((event.target as HTMLSelectElement).value as Category);
  }

  async submitFeedback() {
    if (!this.isFormValid()) return;

    this.status.set('submitting');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Feedback Submitted:', {
      rating: this.rating(),
      comment: this.comment(),
      category: this.category(),
    });

    this.status.set('submitted');

    // Reset form after a delay to show the success message
    setTimeout(() => {
      this.rating.set(0);
      this.hoverRating.set(0);
      this.comment.set('');
      this.category.set('General');
      this.status.set('idle');
    }, 3000);
  }
}

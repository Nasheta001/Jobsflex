import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>AI Reply Generator</h1>
      </div>
      <p class="subtitle">Paste a message from a client, editor, or recruiter. The AI writes a professional reply in your voice.</p>

      <div class="card">
        <div class="form-group">
          <label>Their Message</label>
          <textarea [(ngModel)]="original" rows="8" placeholder="Paste the message you received here — email, LinkedIn DM, Upwork message, etc."></textarea>
        </div>
        <div class="form-group">
          <label>Context (optional)</label>
          <input [(ngModel)]="context" placeholder="e.g. 'Salary negotiation', 'Asking for test task rate', 'Declining a job'">
        </div>
        <button class="btn-primary" (click)="generate()" [disabled]="!original || generating">
          {{ generating ? 'Writing reply...' : 'Generate Reply' }}
        </button>
      </div>

      <div class="card result-card" *ngIf="reply">
        <div class="result-header">
          <h2>Your Reply</h2>
          <button class="btn-copy" (click)="copy()">
            <i class="ti ti-copy"></i> {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="reply-box">{{ reply }}</div>
        <div class="regen-row">
          <button class="btn-ghost" (click)="generate()"><i class="ti ti-refresh"></i> Try again</button>
        </div>
      </div>

      <div class="error-box" *ngIf="error">❌ {{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 720px; }
    .page-header { margin-bottom: 8px; }
    h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
    h2 { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    label { font-size: 12px; font-weight: 500; color: #374151; }
    textarea, input { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #0f172a; font-family: inherit; outline: none; }
    textarea { resize: vertical; line-height: 1.6; }
    textarea:focus, input:focus { border-color: #6366f1; }
    .btn-primary { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .btn-copy { background: transparent; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #475569; }
    .reply-box { font-size: 13px; line-height: 1.8; color: #0f172a; white-space: pre-wrap; background: #f8f9fb; border-radius: 8px; padding: 16px; }
    .regen-row { margin-top: 14px; display: flex; gap: 10px; }
    .btn-ghost { background: transparent; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 5px; }
    .error-box { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 12px 16px; font-size: 13px; }
  `]
})
export class ReplyComponent {
  original = '';
  context = '';
  reply = '';
  error = '';
  generating = false;
  copied = false;

  constructor(private api: ApiService) {}

  generate() {
    this.generating = true;
    this.error = '';
    this.api.generateReply({ original_message: this.original, context: this.context || 'Job enquiry reply' }).subscribe({
      next: (r: any) => { this.generating = false; this.reply = r.reply; },
      error: (e: any) => { this.generating = false; this.error = e.error?.error || 'Generation failed. Check AI settings.'; }
    });
  }

  copy() {
    navigator.clipboard.writeText(this.reply);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}

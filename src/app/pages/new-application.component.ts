import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-new-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>New Application</h1>
        <span class="step-text">Step {{ step }} of 3</span>
      </div>

      <div class="steps-bar">
        <div class="step-track">
          <div class="step-fill" [style.width.%]="(step / 3) * 100"></div>
        </div>
      </div>

      <!-- Step 1: Job Details -->
      <div class="card" *ngIf="step === 1">
        <h2>Job Details</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Company / Client *</label>
            <input [(ngModel)]="form.company" placeholder="e.g. Catena Media, Oddschecker...">
          </div>
          <div class="form-group">
            <label>Role Title *</label>
            <input [(ngModel)]="form.role" placeholder="e.g. iGaming Content Writer">
          </div>
          <div class="form-group">
            <label>How to Apply</label>
            <select [(ngModel)]="form.method">
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn Message</option>
              <option value="upwork">Upwork Proposal</option>
              <option value="form">Online Form</option>
              <option value="twitter">Twitter/X</option>
              <option value="direct">Direct Message</option>
            </select>
          </div>
          <div class="form-group" *ngIf="form.method === 'email'">
            <label>Contact Email</label>
            <input [(ngModel)]="form.contact_email" placeholder="editor@company.com" type="email">
          </div>
          <div class="form-group" *ngIf="form.method !== 'email'">
            <label>Contact Username</label>
            <input [(ngModel)]="form.contact_username" placeholder="@username">
          </div>
          <div class="form-group">
            <label>Contact Name (optional)</label>
            <input [(ngModel)]="form.contact_name" placeholder="e.g. Sarah, Editor">
          </div>
        </div>
        <div class="form-group full">
          <label>Job Description * <span class="hint">Paste the full JD — AI tailors everything to this</span></label>
          <textarea [(ngModel)]="form.job_description" rows="10" placeholder="Paste the complete job description here..."></textarea>
        </div>
        <div class="form-group full">
          <label>Notes (optional)</label>
          <textarea [(ngModel)]="form.notes" rows="2" placeholder="Any personal notes about this role..."></textarea>
        </div>
        <div class="form-footer">
          <button class="btn-primary" (click)="goStep2()" [disabled]="!form.company || !form.role || !form.job_description">
            Generate AI Content →
          </button>
        </div>
      </div>

      <!-- Step 2: AI Content -->
      <div class="card" *ngIf="step === 2">
        <div class="generating" *ngIf="generating">
          <div class="spinner"></div>
          <div>
            <div class="gen-title">AI is writing your cover letter...</div>
            <div class="gen-sub">Using {{ providerName }} to tailor it to this specific role</div>
          </div>
        </div>

        <div *ngIf="!generating && aiResult">
          <div class="tabs">
            <button [class.active]="activeTab === 'cover'" (click)="activeTab = 'cover'">Cover Letter</button>
            <button [class.active]="activeTab === 'cv'" (click)="activeTab = 'cv'">CV Pitch Points</button>
            <button [class.active]="activeTab === 'linkedin'" (click)="activeTab = 'linkedin'">LinkedIn Message</button>
          </div>

          <div class="ai-box" *ngIf="activeTab === 'cover'">
            <textarea [(ngModel)]="aiResult.cover_letter" rows="14"></textarea>
          </div>
          <div class="ai-box" *ngIf="activeTab === 'cv'">
            <textarea [(ngModel)]="aiResult.cv_pitch" rows="14"></textarea>
          </div>
          <div class="ai-box" *ngIf="activeTab === 'linkedin'">
            <textarea [(ngModel)]="aiResult.linkedin_message" rows="6"></textarea>
            <button class="btn-copy" (click)="copy(aiResult.linkedin_message)">
              <i class="ti ti-copy"></i> Copy message
            </button>
          </div>
        </div>

        <div class="ai-error" *ngIf="aiError">
          <i class="ti ti-alert-circle"></i> {{ aiError }}
        </div>

        <div class="form-footer" *ngIf="!generating">
          <button class="btn-ghost" (click)="step = 1">← Back</button>
          <button class="btn-ghost" (click)="regenerate()"><i class="ti ti-refresh"></i> Regenerate</button>
          <button class="btn-primary" (click)="submit()" [disabled]="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Application →' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div class="card confirm-card" *ngIf="step === 3">
        <div class="confirm-icon">✅</div>
        <h2>Application Recorded!</h2>
        <p class="confirm-company"><strong>{{ savedApp?.company }}</strong> — {{ savedApp?.role }}</p>
        <div class="confirm-details">
          <div class="confirm-row">
            <span>Method</span><span>{{ savedApp?.method }}</span>
          </div>
          <div class="confirm-row">
            <span>Applied</span><span>{{ savedApp?.applied_date | date:'d MMMM yyyy' }}</span>
          </div>
          <div class="confirm-row">
            <span>Follow-up due</span><span>{{ savedApp?.followup_date | date:'d MMMM yyyy' }}</span>
          </div>
          <div class="confirm-row">
            <span>Telegram sent</span>
            <span [class.green]="savedApp?.tg_notified" [class.red]="!savedApp?.tg_notified">
              {{ savedApp?.tg_notified ? '✓ Sent to @nashetajohn' : '✗ Not sent (check bot token)' }}
            </span>
          </div>
        </div>
        <div class="confirm-actions">
          <button class="btn-primary" (click)="newAnother()">Apply to Another Job</button>
          <button class="btn-ghost" (click)="goToDashboard()">Back to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 780px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
    .step-text { font-size: 12px; color: #64748b; }
    .steps-bar { margin-bottom: 28px; }
    .step-track { height: 3px; background: #e2e8f0; border-radius: 2px; }
    .step-fill { height: 100%; background: #6366f1; border-radius: 2px; transition: width 0.4s ease; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 28px; }
    h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 12px; font-weight: 500; color: #374151; }
    .hint { font-weight: 400; color: #94a3b8; margin-left: 6px; }
    input, select, textarea { border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; font-size: 13px; color: #0f172a; background: #fff; font-family: inherit; outline: none; transition: border-color 0.15s; }
    input:focus, select:focus, textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    textarea { resize: vertical; line-height: 1.6; }
    .form-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .btn-primary { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 6px; }
    .generating { display: flex; align-items: center; gap: 16px; padding: 24px 0; }
    .spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .gen-title { font-size: 14px; font-weight: 500; color: #0f172a; }
    .gen-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px; }
    .tabs button { padding: 9px 16px; font-size: 13px; border: none; background: transparent; cursor: pointer; color: #64748b; border-bottom: 2px solid transparent; }
    .tabs button.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: 500; }
    .ai-box textarea { width: 100%; box-sizing: border-box; font-family: inherit; line-height: 1.7; }
    .btn-copy { margin-top: 8px; background: transparent; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #475569; }
    .ai-error { padding: 12px 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; font-size: 13px; display: flex; align-items: center; gap: 8px; margin-top: 16px; }
    .confirm-card { text-align: center; padding: 40px; }
    .confirm-icon { font-size: 40px; margin-bottom: 12px; }
    .confirm-company { font-size: 15px; color: #475569; margin: 8px 0 24px; }
    .confirm-details { background: #f8f9fb; border-radius: 10px; padding: 16px; margin-bottom: 28px; text-align: left; }
    .confirm-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .confirm-row:last-child { border-bottom: none; }
    .confirm-row span:first-child { color: #64748b; }
    .confirm-row span:last-child { color: #0f172a; font-weight: 500; }
    .green { color: #16a34a !important; }
    .red { color: #dc2626 !important; }
    .confirm-actions { display: flex; gap: 12px; justify-content: center; }
  `]
})
export class NewApplicationComponent implements OnInit {
  step = 1;
  form: any = { method: 'email' };
  aiResult: any = null;
  aiError = '';
  generating = false;
  submitting = false;
  savedApp: any = null;
  activeTab = 'cover';
  providerName = 'Claude';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getAISettings().subscribe((s: any) => {
      const map: any = { claude: 'Claude (Anthropic)', openai: 'ChatGPT (OpenAI)', gemini: 'Gemini' };
      this.providerName = map[s.provider] || 'AI';
    });
  }

  goStep2() {
    if (!this.form.company || !this.form.role || !this.form.job_description) return;
    this.step = 2;
    this.generating = true;
    this.aiError = '';

    // Submit to backend — AI generation happens server-side
    this.api.createApplication(this.form).subscribe({
      next: (app: any) => {
        this.generating = false;
        this.savedApp = app;
        this.aiResult = {
          cover_letter: app.cover_letter || '',
          cv_pitch: app.cv_pitch || '',
          linkedin_message: app.linkedin_message || '',
        };
      },
      error: (e: any) => {
        this.generating = false;
        this.aiError = e.error?.error || 'Generation failed. Check your API key in Settings.';
      }
    });
  }

  regenerate() {
    if (!this.savedApp) return;
    this.generating = true;
    this.aiError = '';
    this.api.regenerateAI(this.savedApp.id).subscribe({
      next: (app: any) => {
        this.generating = false;
        this.aiResult = { cover_letter: app.cover_letter, cv_pitch: app.cv_pitch, linkedin_message: app.linkedin_message };
      },
      error: (e: any) => { this.generating = false; this.aiError = e.error?.error || 'Regeneration failed.'; }
    });
  }

  submit() {
    this.step = 3;
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  newAnother() {
    this.step = 1;
    this.form = { method: 'email' };
    this.aiResult = null;
    this.savedApp = null;
  }

  goToDashboard() { this.router.navigate(['/dashboard']); }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-grid">

        <!-- AI Provider -->
        <div class="card">
          <h2><i class="ti ti-robot"></i> AI Provider</h2>
          <p class="desc">Choose which AI generates your cover letters, CV pitches, and replies. You can switch at any time.</p>

          <div class="provider-cards">
            <div class="provider-card" *ngFor="let p of providers"
                [class.selected]="settings.provider === p.value"
                (click)="settings.provider = p.value">
              <div class="p-icon" [ngStyle]="{'background': p.color}">{{ p.icon }}</div>
              <div>
                <div class="p-name">{{ p.name }}</div>
                <div class="p-desc">{{ p.desc }}</div>
              </div>
              <div class="p-check" *ngIf="settings.provider === p.value">✓</div>
            </div>
          </div>

          <div class="form-group" style="margin-top:20px">
            <label>API Key Override (optional)</label>
            <input [(ngModel)]="settings.api_key_override" type="password"
                  placeholder="Leave blank to use .env key">
            <span class="hint">If set, this overrides the key in your .env file.</span>
          </div>

          <button class="btn-primary" (click)="saveSettings()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
          <span class="save-msg" *ngIf="saveMsg">{{ saveMsg }}</span>
        </div>

        <!-- Telegram -->
        <div class="card">
          <h2><i class="ti ti-brand-telegram"></i> Telegram Notifications</h2>
          <p class="desc">JobFlow sends you a Telegram message every time you apply for a job, and reminds you to follow up.</p>

          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">Bot username</span>
              <span>&#64;Nasheta_bot</span>
            </div>
            <div class="info-row">
              <span class="info-label">Your handle</span>
              <span>&#64;nashetajohn</span>
            </div>
            <div class="info-row">
              <span class="info-label">Configured in</span>
              <span class="code">.env → TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID</span>
            </div>
          </div>

          <div class="setup-steps">
            <h3>Setup steps (one time)</h3>
            <ol>
              <li>Message <strong>&#64;BotFather</strong> on Telegram → <code>/newbot</code></li>
              <li>Copy the token → paste into <code>TELEGRAM_BOT_TOKEN</code> in .env</li>
              <li>Message your new bot once</li>
              <li>Visit: <code>api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
              <li>Copy the <code>chat.id</code> value → paste into <code>TELEGRAM_CHAT_ID</code></li>
            </ol>
          </div>

          <button class="btn-outline" (click)="testTelegram()" [disabled]="testingTg">
            <i class="ti ti-send"></i> {{ testingTg ? 'Sending...' : 'Send Test Message' }}
          </button>
          <div class="tg-result success" *ngIf="tgResult === 'ok'">✅ Test sent — check Telegram!</div>
          <div class="tg-result error" *ngIf="tgResult === 'fail'">❌ Failed — check your bot token and chat ID in .env</div>
        </div>

        <!-- Gmail -->
        <div class="card">
          <h2><i class="ti ti-mail"></i> Email (Gmail)</h2>
          <p class="desc">When you apply via email, JobFlow sends the application + cover letter attachment directly from your Gmail.</p>

          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">From</span>
              <span>nashetajohn&#64;gmail.com</span>
            </div>
          </div>

          <div class="setup-steps">
            <h3>Setup</h3>
            <ol>
              <li>Go to Google → Manage Account → Security → 2-Step Verification (enable it)</li>
              <li>Search "App passwords" → create one for "Mail"</li>
              <li>Paste the 16-char password into <code>GMAIL_APP_PASSWORD</code> in .env</li>
            </ol>
          </div>
        </div>

        <!-- Notification log -->
        <div class="card">
          <h2><i class="ti ti-bell"></i> Recent Notifications</h2>
          <div *ngFor="let n of notifications" class="notif-row">
            <span class="notif-type" [ngClass]="n.type">{{ n.type }}</span>
            <span class="notif-app">{{ n.application }}</span>
            <span class="notif-date">{{ n.sent_at | date:'d MMM HH:mm' }}</span>
            <span class="notif-status" [class.ok]="n.success" [class.fail]="!n.success">{{ n.success ? '✓' : '✗' }}</span>
          </div>
          <div *ngIf="notifications.length === 0" class="empty">No notifications sent yet.</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; }
    .page-header { margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; }
    h2 { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 6px; display: flex; align-items: center; gap: 8px; }
    h2 i { font-size: 16px; color: #6366f1; }
    h3 { font-size: 12px; font-weight: 600; color: #374151; margin: 16px 0 8px; }
    .desc { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }
    .provider-cards { display: flex; flex-direction: column; gap: 10px; }
    .provider-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.15s; position: relative; }
    .provider-card:hover { border-color: #6366f1; background: #fafafa; }
    .provider-card.selected { border-color: #6366f1; background: #f5f3ff; }
    .p-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .p-name { font-size: 13px; font-weight: 500; color: #0f172a; }
    .p-desc { font-size: 11px; color: #64748b; }
    .p-check { margin-left: auto; color: #6366f1; font-weight: 700; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
    label { font-size: 12px; font-weight: 500; color: #374151; }
    .hint { font-size: 11px; color: #94a3b8; }
    input { border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; font-size: 13px; color: #0f172a; outline: none; }
    input:focus { border-color: #6366f1; }
    .btn-primary { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; }
    .btn-outline { background: transparent; border: 1px solid #6366f1; color: #6366f1; padding: 9px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .save-msg { font-size: 12px; color: #16a34a; margin-left: 10px; }
    .info-rows { background: #f8f9fb; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
    .info-row { display: flex; gap: 16px; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; min-width: 100px; }
    .code { font-family: monospace; font-size: 11px; color: #6366f1; background: #ede9fe; padding: 2px 6px; border-radius: 4px; }
    .setup-steps ol { padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.8; }
    .setup-steps code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
    .tg-result { margin-top: 10px; font-size: 13px; padding: 8px 12px; border-radius: 8px; }
    .tg-result.success { background: #dcfce7; color: #166534; }
    .tg-result.error { background: #fee2e2; color: #991b1b; }
    .notif-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .notif-row:last-child { border-bottom: none; }
    .notif-type { padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 500; background: #dbeafe; color: #1e40af; }
    .notif-type.reminder { background: #fef3c7; color: #92400e; }
    .notif-app { flex: 1; color: #475569; }
    .notif-date { color: #94a3b8; }
    .notif-status.ok { color: #16a34a; }
    .notif-status.fail { color: #dc2626; }
    .empty { font-size: 13px; color: #94a3b8; padding: 12px 0; }
  `]
})
export class SettingsComponent implements OnInit {
  settings: any = { provider: 'claude', api_key_override: '' };
  providers = [
    { value: 'claude', name: 'Claude (Anthropic)', desc: 'Best for editorial writing', icon: '◆', color: '#e8d5b7' },
    { value: 'openai', name: 'ChatGPT (OpenAI)', desc: 'GPT-4o, very capable', icon: '⬡', color: '#d4edda' },
    { value: 'gemini', name: 'Gemini (Google)', desc: 'Fast, good for outlines', icon: '✦', color: '#d1e7ff' },
  ];
  notifications: any[] = [];
  saving = false;
  saveMsg = '';
  testingTg = false;
  tgResult = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAISettings().subscribe(s => this.settings = s);
    this.api.getNotifications().subscribe((r: any) => this.notifications = (r.results || r).slice(0, 10));
  }

  saveSettings() {
    this.saving = true;
    this.api.updateAISettings(this.settings).subscribe({
      next: () => { this.saving = false; this.saveMsg = '✓ Saved'; setTimeout(() => this.saveMsg = '', 3000); },
      error: () => { this.saving = false; this.saveMsg = 'Error saving'; }
    });
  }

  testTelegram() {
    this.testingTg = true;
    this.tgResult = '';
    this.api.testTelegram().subscribe({
      next: (r: any) => { this.testingTg = false; this.tgResult = r.success ? 'ok' : 'fail'; },
      error: () => { this.testingTg = false; this.tgResult = 'fail'; }
    });
  }
}
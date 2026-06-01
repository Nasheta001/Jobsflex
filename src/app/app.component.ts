import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <nav class="sidebar">
        <div class="logo">
          <div class="logo-icon">JF</div>
          <div>
            <div class="logo-name">JobFlow</div>
            <div class="logo-sub">Nasheta John</div>
          </div>
        </div>

        <div class="ai-badge" *ngIf="stats">
          <span class="ai-dot"></span>
          AI: {{ stats.active_provider | titlecase }}
        </div>

        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">
            <i class="ti ti-layout-dashboard"></i> Dashboard
          </a>
          <a routerLink="/applications" routerLinkActive="active">
            <i class="ti ti-briefcase"></i> Applications
            <span class="badge" *ngIf="stats?.followup_due">{{ stats.followup_due }}</span>
          </a>
          <a routerLink="/new" routerLinkActive="active">
            <i class="ti ti-plus"></i> New Application
          </a>
          <a routerLink="/reply" routerLinkActive="active">
            <i class="ti ti-message-reply"></i> AI Reply
          </a>
          <a routerLink="/settings" routerLinkActive="active">
            <i class="ti ti-settings"></i> Settings
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="me-card">
            <div class="me-avatar">NJ</div>
            <div>
              <div class="me-name">Nasheta John</div>
              <div class="me-email">nashetajohn&#64;gmail.com</div>
            </div>
          </div>
        </div>
      </nav>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css');

    :host { display: block; height: 100vh; }

    .shell { display: flex; height: 100vh; background: #f8f9fb; font-family: 'Inter', -apple-system, sans-serif; }

    .sidebar { width: 220px; min-width: 220px; background: #0f172a; display: flex; flex-direction: column; padding: 20px 0; }

    .logo { display: flex; align-items: center; gap: 10px; padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px; }
    .logo-icon { width: 36px; height: 36px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0; }
    .logo-name { font-size: 14px; font-weight: 600; color: #f1f5f9; }
    .logo-sub { font-size: 11px; color: #64748b; }

    .ai-badge { margin: 0 16px 16px; padding: 6px 10px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 6px; font-size: 11px; color: #a5b4fc; display: flex; align-items: center; gap: 6px; }
    .ai-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }

    .nav-links { flex: 1; padding: 0 8px; display: flex; flex-direction: column; gap: 2px; }
    .nav-links a { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; color: #94a3b8; text-decoration: none; transition: all 0.15s; position: relative; }
    .nav-links a:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-links a.active { background: rgba(99,102,241,0.2); color: #a5b4fc; }
    .nav-links a i { font-size: 16px; width: 18px; }
    .nav-links a .badge { margin-left: auto; background: #ef4444; color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }

    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 16px; }
    .me-card { display: flex; align-items: center; gap: 10px; }
    .me-avatar { width: 32px; height: 32px; background: #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .me-name { font-size: 12px; font-weight: 500; color: #e2e8f0; }
    .me-email { font-size: 10px; color: #64748b; }

    .content { flex: 1; overflow-y: auto; }
  `]
})
export class AppComponent implements OnInit {
  stats: any = null;
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getStats().subscribe(s => this.stats = s); }
}

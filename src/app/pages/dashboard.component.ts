import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <a routerLink="/new" class="btn-primary"><i class="ti ti-plus"></i> New Application</a>
      </div>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-num">{{ stats.total }}</div>
          <div class="stat-label">Total Applied</div>
        </div>
        <div class="stat-card success">
          <div class="stat-num">{{ stats.responded }}</div>
          <div class="stat-label">Responded</div>
        </div>
        <div class="stat-card warning" [class.pulse]="stats.followup_due > 0">
          <div class="stat-num">{{ stats.followup_due }}</div>
          <div class="stat-label">Follow-ups Due</div>
        </div>
        <div class="stat-card info">
          <div class="stat-num">{{ stats.response_rate }}%</div>
          <div class="stat-label">Response Rate</div>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h2>Recent Applications</h2>
            <a routerLink="/applications" class="link-sm">View all →</a>
          </div>
          <div class="app-list" *ngFor="let app of recentApps">
            <div class="app-row" [routerLink]="['/applications', app.id]">
              <div class="app-info">
                <div class="app-company">{{ app.company }}</div>
                <div class="app-role">{{ app.role }}</div>
              </div>
              <div class="app-right">
                <span class="badge-status" [ngClass]="app.status">{{ app.status }}</span>
                <div class="app-date">{{ app.applied_date | date:'d MMM' }}</div>
              </div>
            </div>
          </div>
          <div *ngIf="recentApps.length === 0" class="empty">No applications yet.</div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Follow-ups Due</h2>
          </div>
          <div *ngFor="let app of followupsDue" class="followup-row">
            <div>
              <div class="app-company">{{ app.company }}</div>
              <div class="app-role">{{ app.role }} · Applied {{ app.applied_date | date:'d MMM' }}</div>
            </div>
            <button class="btn-sm" (click)="sendFollowup(app)">
              <i class="ti ti-send"></i> Send TG
            </button>
          </div>
          <div *ngIf="followupsDue.length === 0" class="empty">No follow-ups due right now.</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
    .btn-primary { background: #6366f1; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; text-decoration: none; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
    .stat-card.success { border-left: 3px solid #22c55e; }
    .stat-card.warning { border-left: 3px solid #f59e0b; }
    .stat-card.info { border-left: 3px solid #6366f1; }
    .stat-num { font-size: 28px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    h2 { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; }
    .link-sm { font-size: 12px; color: #6366f1; text-decoration: none; }
    .app-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
    .app-row:last-child { border-bottom: none; }
    .app-row:hover { background: #f8f9fb; margin: 0 -8px; padding: 10px 8px; border-radius: 6px; }
    .app-company { font-size: 13px; font-weight: 500; color: #0f172a; }
    .app-role { font-size: 11px; color: #64748b; }
    .app-right { text-align: right; }
    .app-date { font-size: 11px; color: #94a3b8; margin-top: 3px; }
    .badge-status { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 500; text-transform: capitalize; }
    .badge-status.applied { background: #dbeafe; color: #1e40af; }
    .badge-status.responded { background: #dcfce7; color: #166534; }
    .badge-status.interview { background: #fef9c3; color: #854d0e; }
    .badge-status.rejected { background: #fee2e2; color: #991b1b; }
    .badge-status.followup { background: #fef3c7; color: #92400e; }
    .badge-status.closed { background: #f1f5f9; color: #475569; }
    .followup-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .followup-row:last-child { border-bottom: none; }
    .btn-sm { background: transparent; border: 1px solid #e2e8f0; padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #475569; }
    .btn-sm:hover { background: #f8f9fb; }
    .empty { font-size: 13px; color: #94a3b8; padding: 12px 0; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    .pulse { animation: pulse 2s infinite; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentApps: any[] = [];
  followupsDue: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getStats().subscribe(s => this.stats = s);
    this.api.getApplications().subscribe((r: any) => {
      const apps = r.results || r;
      this.recentApps = apps.slice(0, 6);
      const today = new Date().toISOString().split('T')[0];
      this.followupsDue = apps.filter((a: any) => a.followup_date <= today && a.status === 'applied');
    });
  }

  sendFollowup(app: any) {
    this.api.sendFollowUpNow(app.id).subscribe(() => {
      app.status = 'followup';
      this.followupsDue = this.followupsDue.filter(a => a.id !== app.id);
    });
  }
}

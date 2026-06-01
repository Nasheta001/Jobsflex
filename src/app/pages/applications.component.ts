import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>All Applications</h1>
        <a routerLink="/new" class="btn-primary"><i class="ti ti-plus"></i> New</a>
      </div>

      <div class="filters">
        <button *ngFor="let f of filters" [class.active]="activeFilter === f.value" (click)="setFilter(f.value)">
          {{ f.label }}
          <span *ngIf="f.count > 0" class="fc">{{ f.count }}</span>
        </button>
        <input class="search" [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" placeholder="Search company or role...">
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Method</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th>TG</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filtered" [routerLink]="['/applications', app.id]" class="clickable">
              <td>
                <div class="td-main">{{ app.company }}</div>
                <div class="td-sub" *ngIf="app.contact_email || app.contact_username">{{ app.contact_email || app.contact_username }}</div>
              </td>
              <td>{{ app.role }}</td>
              <td><span class="method-badge">{{ app.method }}</span></td>
              <td class="date-cell">{{ app.applied_date | date:'d MMM yyyy' }}</td>
              <td><span class="badge-status" [ngClass]="app.status">{{ app.status }}</span></td>
              <td>
                <span *ngIf="app.followup_date" [class.overdue]="isOverdue(app.followup_date) && app.status === 'applied'">
                  {{ app.followup_date | date:'d MMM' }}
                  <span *ngIf="isOverdue(app.followup_date) && app.status === 'applied'" class="overdue-tag">!</span>
                </span>
              </td>
              <td>
                <span class="tg-dot" [class.sent]="app.tg_notified" [title]="app.tg_notified ? 'TG sent' : 'TG not sent'"></span>
              </td>
              <td (click)="$event.stopPropagation()">
                <div class="row-actions">
                  <button class="act-btn" (click)="markResponded(app)" title="Mark responded" *ngIf="app.status === 'applied'">✓</button>
                  <button class="act-btn" (click)="sendFollowup(app)" title="Send follow-up TG">↗</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="8" class="empty-cell">No applications found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
    .btn-primary { background: #6366f1; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; text-decoration: none; }
    .filters { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters button { padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 12px; background: transparent; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 5px; }
    .filters button.active { background: #6366f1; color: #fff; border-color: #6366f1; }
    .fc { background: rgba(255,255,255,0.25); border-radius: 10px; padding: 0 5px; font-size: 10px; }
    .search { margin-left: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; font-size: 13px; width: 200px; outline: none; }
    .search:focus { border-color: #6366f1; }
    .table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; }
    tr.clickable { cursor: pointer; }
    tr.clickable:hover td { background: #f8f9fb; }
    tr:last-child td { border-bottom: none; }
    .td-main { font-weight: 500; }
    .td-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .date-cell { color: #64748b; }
    .badge-status { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; text-transform: capitalize; }
    .badge-status.applied { background: #dbeafe; color: #1e40af; }
    .badge-status.responded { background: #dcfce7; color: #166534; }
    .badge-status.interview { background: #fef9c3; color: #854d0e; }
    .badge-status.rejected { background: #fee2e2; color: #991b1b; }
    .badge-status.followup { background: #fef3c7; color: #92400e; }
    .badge-status.closed { background: #f1f5f9; color: #475569; }
    .method-badge { font-size: 11px; color: #64748b; }
    .overdue { color: #dc2626; font-weight: 500; }
    .overdue-tag { background: #ef4444; color: #fff; border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; margin-left: 3px; }
    .tg-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; display: inline-block; }
    .tg-dot.sent { background: #22c55e; }
    .row-actions { display: flex; gap: 4px; }
    .act-btn { padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: transparent; cursor: pointer; font-size: 12px; color: #475569; }
    .act-btn:hover { background: #f1f5f9; }
    .empty-cell { text-align: center; padding: 32px; color: #94a3b8; }
  `]
})
export class ApplicationsComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  activeFilter = 'all';
  searchTerm = '';
  filters: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getApplications().subscribe((r: any) => {
      this.all = r.results || r;
      this.buildFilters();
      this.applyFilter();
    });
  }

  buildFilters() {
    const statuses = ['applied', 'responded', 'interview', 'followup', 'rejected'];
    this.filters = [
      { label: 'All', value: 'all', count: this.all.length },
      ...statuses.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s, count: this.all.filter(a => a.status === s).length }))
    ];
  }

  setFilter(f: string) { this.activeFilter = f; this.applyFilter(); }

  applyFilter() {
    let list = this.all;
    if (this.activeFilter !== 'all') list = list.filter(a => a.status === this.activeFilter);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(a => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
    }
    this.filtered = list;
  }

  isOverdue(date: string): boolean { return date < new Date().toISOString().split('T')[0]; }

  markResponded(app: any) {
    this.api.markResponded(app.id).subscribe(() => { app.status = 'responded'; this.buildFilters(); });
  }

  sendFollowup(app: any) {
    this.api.sendFollowUpNow(app.id).subscribe(() => { app.status = 'followup'; this.buildFilters(); });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_BASE = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Applications
  getApplications(params?: any): Observable<any> {
    return this.http.get(`${API_BASE}/applications/`, { params });
  }
  getApplication(id: number): Observable<any> {
    return this.http.get(`${API_BASE}/applications/${id}/`);
  }
  createApplication(data: any): Observable<any> {
    return this.http.post(`${API_BASE}/applications/`, data);
  }
  updateApplication(id: number, data: any): Observable<any> {
    return this.http.patch(`${API_BASE}/applications/${id}/`, data);
  }
  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/applications/${id}/`);
  }
  markResponded(id: number): Observable<any> {
    return this.http.post(`${API_BASE}/applications/${id}/mark_responded/`, {});
  }
  sendFollowUpNow(id: number): Observable<any> {
    return this.http.post(`${API_BASE}/applications/${id}/send_followup_now/`, {});
  }
  regenerateAI(id: number): Observable<any> {
    return this.http.post(`${API_BASE}/applications/${id}/regenerate_ai/`, {});
  }
  sendEmail(id: number): Observable<any> {
    return this.http.post(`${API_BASE}/applications/${id}/send_email/`, {});
  }

  // Stats
  getStats(): Observable<any> {
    return this.http.get(`${API_BASE}/stats/`);
  }

  // AI Reply
  generateReply(data: { original_message: string; context: string }): Observable<any> {
    return this.http.post(`${API_BASE}/generate-reply/`, data);
  }

  // Settings
  getAISettings(): Observable<any> {
    return this.http.get(`${API_BASE}/ai-settings/`);
  }
  updateAISettings(data: any): Observable<any> {
    return this.http.put(`${API_BASE}/ai-settings/1/`, data);
  }
  testTelegram(): Observable<any> {
    return this.http.post(`${API_BASE}/test-telegram/`, {});
  }

  // Notification log
  getNotifications(): Observable<any> {
    return this.http.get(`${API_BASE}/notifications/`);
  }
}

import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { ApplicationsComponent } from './pages/applications.component';
import { NewApplicationComponent } from './pages/new-application.component';
import { SettingsComponent } from './pages/settings.component';
import { ReplyComponent } from './pages/reply.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'applications', component: ApplicationsComponent },
  { path: 'new', component: NewApplicationComponent },
  { path: 'reply', component: ReplyComponent },
  { path: 'settings', component: SettingsComponent },
];

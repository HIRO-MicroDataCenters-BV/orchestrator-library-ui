import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardCardModel } from '../../shared/models/dashboard-card.model';
import { AppTableComponent } from '../app-table/app-table.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AppTableComponent],
  templateUrl: './app-dashboard-card.component.html',
  styleUrl: './app-dashboard-card.component.css',
})
export class AppDashboardCardComponent {
  @Input() data!: DashboardCardModel;

  constructor() {
    console.log('AppDashboardCardComponent initialized', this.data);
    // Initialize any necessary properties or services here
  }

  getTableColumns(): string[] {
    return ['dashboard_status', 'dashboard_info', 'dashboard_date'];
  }

  getTableActions(): string[] {
    return [];
  }

  getTableTabs(): string[] {
    return [];
  }

  getDataSource(): Observable<unknown[]> | null {
    return this.data.dataSource as Observable<unknown[]> | null;
  }
}

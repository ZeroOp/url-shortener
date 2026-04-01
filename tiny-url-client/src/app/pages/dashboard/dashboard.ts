import { Component, signal } from '@angular/core'; // Fixed: changed from @angular/common
import { CommonModule } from '@angular/common';

// Material Imports for Tabs
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

// Tab Components
import { AnalyticsTab } from '../../components/analytics-tab/analytics-tab';
import { CreateLinkTab } from '../../components/create-link-tab/create-link-tab';
import { AllLinksTab } from '../../components/all-links-tab/all-links-tab';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AnalyticsTab,
    CreateLinkTab,
    AllLinksTab
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  /**
   * Using a Signal to track which tab is currently active.
   * Options: 'analytics' | 'create' | 'links' | 'settings'
   */
  activeTab = signal<string>('analytics');

  /**
   * Updates the active tab signal when a user clicks a tab header.
   * @param index The index of the selected tab from MatTabGroup
   */
  onTabChange(index: number) {
    const tabs = ['analytics', 'create', 'links', 'settings'];
    this.activeTab.set(tabs[index]);
  }
}
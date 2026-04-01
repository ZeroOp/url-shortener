import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.scss'
})
export class StatsComponent {
  stats = [
    { value: '1.2M+', label: 'Total Redirects' },
    { value: '45ms', label: 'Avg. Latency' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Monitoring' }
  ];
}
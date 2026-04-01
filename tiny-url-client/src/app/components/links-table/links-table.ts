import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface LinkRow {
  shortUrl: string;
  clicks: number;
}

@Component({
  selector: 'app-links-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './links-table.html',
  styleUrls: ['./links-table.scss']
})
export class LinksTableComponent {
  @Input() dataSource: LinkRow[] = [];
  displayedColumns: string[] = ['shortUrl', 'clicks', 'actions'];
}
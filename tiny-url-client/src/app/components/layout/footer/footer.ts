import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Import the Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  // 2. Add them here
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {}
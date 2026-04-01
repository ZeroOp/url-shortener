import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss'
})
export class AuthLayoutComponent {
  // This component is a "Pure UI Shell"
  // It doesn't need logic because it just provides the 
  // CSS Grid/Flexbox structure and the blue brand section.
}
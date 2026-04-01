import { Component, signal } from '@angular/core';
import { HeaderComponent } from './components/layout/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tiny-url-client');
}

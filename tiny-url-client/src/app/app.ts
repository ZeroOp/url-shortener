import { Component, signal } from '@angular/core';
import { HeaderComponent } from './components/layout/header/header';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tiny-url-client');
}

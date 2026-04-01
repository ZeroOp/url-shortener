import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 // A private signal that holds the pending message
 private messageSource = signal<string | null>(null);
  
 // Publicly expose the message
 message = this.messageSource.asReadonly();

 setMessage(msg: string) {
   this.messageSource.set(msg);
 }

 clearMessage() {
   this.messageSource.set(null);
 }
}
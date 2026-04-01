import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth'; 
import { HttpClient } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthLayoutComponent } from "../../core/layouts/auth-layout/auth-layout";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    AuthLayoutComponent,
    MatSnackBarModule
],
  templateUrl: './signin.html',
  styleUrl: './signin.scss'
})
export class SigninComponent implements OnInit{
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  
  constructor(
    private authService: AuthService,
    private notifyService: NotificationService
  ) {

  }

  ngOnInit() {
    const pendingMessage = this.notifyService.message();

    if (pendingMessage) {
      this.snackBar.open(pendingMessage, 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });

      // Crucial: Clear the message so it doesn't show up again
      this.notifyService.clearMessage();
    }
  }

  isLoading = signal(false);
  hidePassword = signal(true); // Toggle password visibility

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
  
      this.authService.signin(this.loginForm.getRawValue()).subscribe({
        next: () => {
          this.snackBar.open(`Welcome back! Redirecting to dashboard...`, 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'] // We will define this in global CSS
          });

          // 2. Navigate to dashboard after a tiny delay so they see the message
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500)
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
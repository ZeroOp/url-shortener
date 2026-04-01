import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthLayoutComponent } from '../../core/layouts/auth-layout/auth-layout';
import { NotificationService } from '../../core/services/notification';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor(private snackBar: MatSnackBar) {

  }
  

  isLoading = signal(false);
  hidePassword = signal(true);

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading.set(true);
      // Destructure to remove confirmPassword before sending to backend
      const { email, password } = this.signupForm.value;
      
      this.http.post('/api/users/signup', { email, password }).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMessage = err.error.errors[0]?.message || 'Regisration failed. Please try again.';
          console.log(err.error);
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar', 'top-margin-snackbar'],
            verticalPosition: 'bottom'
          });
        }
      });
    } else {
      let errorMessage = 'Please correct the errors in the form.';

      if (this.signupForm.hasError('passwordMismatch')) {
        errorMessage = 'Passwords do not match!';
      } else if (this.signupForm.get('email')?.hasError('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (this.signupForm.get('password')?.hasError('minlength')) {
        errorMessage = 'Password must be at least 4 characters.';
      }

      this.showError(errorMessage);
    }
  }
  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar', 'top-margin-snackbar'],
      verticalPosition: 'bottom'
    });
  }
}
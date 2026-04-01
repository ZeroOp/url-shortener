import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-wrapper">
      <h2 class="title">Delete Link?</h2>
      <div class="content">
        This action is permanent. The short link will stop working immediately.
      </div>
      <div class="actions">
        <button class="btn-cancel" (click)="onCancel()">Cancel</button>
        <button class="btn-delete" (click)="onConfirm()">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-wrapper {
      padding: 20px;
      background: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
    .content { font-size: 14px; color: #64748b; line-height: 1.5; }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      &:hover {
        background-color: #eff6ff; /* Very light blue */
        color: #2563eb;           /* Blue text */
        border-color: #2563eb;
      }
    }

    .btn-delete {
      background: #ef4444; /* Red */
      color: white;
      &:hover { background: #dc2626; }
    }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>) {}
  onCancel(): void { this.dialogRef.close(false); }
  onConfirm(): void { this.dialogRef.close(true); }
}
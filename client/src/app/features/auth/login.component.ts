import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { httpErrorMessage } from '../../core/load-state';
import { ROLES, Role } from '../../core/models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected roles = ROLES;
  protected busy = signal(false);
  protected error = signal('');

  // A reactive form is defined in code. Each control has a start value and validators.
  protected form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    password: ['', Validators.required],
    role: ['General User' as Role, Validators.required],
  });

  /** Demo accounts created by the server's seed script. */
  protected fill(userId: string, password: string, role: Role) {
    this.form.setValue({ userId, password, role });
    this.error.set('');
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { userId, password, role } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set('');

    this.auth.login(userId, password, role).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(httpErrorMessage(err));
        this.busy.set(false);
      },
    });
  }
}

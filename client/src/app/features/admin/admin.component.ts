import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { LATENCY_OPTIONS, LatencyService } from '../../core/latency.service';
import { httpErrorMessage, toLoadState } from '../../core/load-state';
import { LoadState, ROLES, Role, User } from '../../core/models';
import { UserService } from '../../core/user.service';
import { RoleBadgeComponent } from '../../shared/role-badge.component';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, ReactiveFormsModule, RoleBadgeComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  private fb = inject(FormBuilder);
  private api = inject(UserService);
  protected auth = inject(AuthService);
  protected latency = inject(LatencyService);

  protected roles = ROLES;
  protected latencyOptions = LATENCY_OPTIONS;
  protected skeletonRows = [0, 1, 2];

  protected list = signal<LoadState<User[]>>({ status: 'loading' });
  protected admins = computed(() => {
    const s = this.list();
    return s.status === 'ready' ? s.data.filter((u) => u.role === 'Admin').length : 0;
  });

  /** null = panel closed, 'new' = adding, a User = editing that user */
  protected editing = signal<User | 'new' | null>(null);
  protected saving = signal(false);
  protected formError = signal('');
  protected confirmingId = signal<string | null>(null);
  protected notice = signal('');
  private noticeTimer?: ReturnType<typeof setTimeout>;

  protected form = this.fb.nonNullable.group({
    userId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    department: [''],
    role: ['General User' as Role],
    password: [''],
  });

  // silent = refresh the list without flashing the loading skeleton
  private load$ = new Subject<{ silent: boolean }>();

  constructor() {
    this.load$
      .pipe(
        tap(({ silent }) => !silent && this.list.set({ status: 'loading' })),
        switchMap(() => this.api.list().pipe(toLoadState())),
        takeUntilDestroyed()
      )
      .subscribe((state) => this.list.set(state));
    this.load$.next({ silent: false });
  }

  protected reload() {
    this.load$.next({ silent: false });
  }

  protected setLatency(ms: number) {
    this.latency.set(ms);
    this.reload();
  }

  // ---- Add / edit panel ----
  protected openNew() {
    this.form.reset({ role: 'General User' });
    this.form.controls.userId.enable();
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.formError.set('');
    this.editing.set('new');
  }

  protected openEdit(user: User) {
    this.form.reset({ ...user, password: '' });
    this.form.controls.userId.disable(); // the login ID cannot be changed
    this.form.controls.password.setValidators([Validators.minLength(6)]); // optional when editing
    this.form.controls.password.updateValueAndValidity();
    this.formError.set('');
    this.editing.set(user);
  }

  protected closePanel() {
    this.editing.set(null);
  }

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const target = this.editing();
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set('');

    const request =
      target === 'new'
        ? this.api.create({ ...v, password: v.password })
        : this.api.update((target as User).id, {
            name: v.name,
            email: v.email,
            department: v.department,
            role: v.role,
            password: v.password || undefined, // blank = keep the current password
          });

    request.subscribe({
      next: (user) => {
        this.saving.set(false);
        this.closePanel();
        this.showNotice(target === 'new' ? `Added ${user.name}.` : `Saved changes to ${user.name}.`);
        this.load$.next({ silent: true });
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(httpErrorMessage(err));
      },
    });
  }

  // ---- Delete with inline confirmation ----
  protected askDelete(id: string) {
    this.confirmingId.set(id);
  }

  protected confirmDelete(user: User) {
    this.api.remove(user.id).subscribe({
      next: () => {
        this.confirmingId.set(null);
        this.showNotice(`Deleted ${user.name}.`);
        this.load$.next({ silent: true });
      },
      error: (err) => {
        this.confirmingId.set(null);
        this.showNotice(httpErrorMessage(err));
      },
    });
  }

  private showNotice(text: string) {
    this.notice.set(text);
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(''), 4000);
  }

  protected isInvalid(name: 'userId' | 'name' | 'email' | 'password') {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }
}

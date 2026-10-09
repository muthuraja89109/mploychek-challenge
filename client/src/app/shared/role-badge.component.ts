import { Component, input } from '@angular/core';
import { Role } from '../core/models';

/** Small reusable badge: <app-role-badge [role]="user.role" /> */
@Component({
  selector: 'app-role-badge',
  template: `<span class="badge" [class.admin]="role() === 'Admin'">{{ role() }}</span>`,
  styles: `
    .badge {
      display: inline-block; padding: 2px 10px; border-radius: 6px;
      font-size: 13px; font-weight: 600;
      border: 1px solid var(--line); color: var(--muted); background: var(--surface-2);
    }
    .badge.admin { border-color: var(--primary); color: var(--primary); background: transparent; }
  `,
})
export class RoleBadgeComponent {
  // Signal-based input (Angular 17+): read it by calling role()
  role = input.required<Role>();
}

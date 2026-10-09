import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { RoleBadgeComponent } from '../shared/role-badge.component';

/** The frame around every signed-in page: header, navigation, and the page itself. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RoleBadgeComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);
}

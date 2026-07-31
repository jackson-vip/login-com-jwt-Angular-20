import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

import { AppSidebarComponent } from '../../shared/ui/sidebar/sidebar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, AppSidebarComponent],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.scss',
})
export class PrivateLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = computed(() => this.authService.getUser());
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((currentState) => !currentState);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeSidebar();
      void this.router.navigateByUrl('/login');
    });
  }
}

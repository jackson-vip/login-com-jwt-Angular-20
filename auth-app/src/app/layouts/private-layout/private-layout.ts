import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
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
  private static readonly SIDEBAR_PREFERENCE_KEY = 'private-layout.sidebar-collapsed';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly user = computed(() => this.authService.getUser());
  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(this.getInitialSidebarCollapsedState());

  toggleSidebar(): void {
    this.sidebarOpen.update((currentState) => !currentState);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed.update((currentState) => {
      const nextState = !currentState;

      if (this.isBrowser) {
        localStorage.setItem(PrivateLayout.SIDEBAR_PREFERENCE_KEY, String(nextState));
      }

      return nextState;
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeSidebar();
      void this.router.navigateByUrl('/login');
    });
  }

  private getInitialSidebarCollapsedState(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    return localStorage.getItem(PrivateLayout.SIDEBAR_PREFERENCE_KEY) === 'true';
  }
}

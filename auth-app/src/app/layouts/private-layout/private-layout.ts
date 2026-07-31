import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.scss',
})
export class PrivateLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = computed(() => this.authService.getUser());
  readonly sidebarOpen = signal(false);
  readonly items: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'Clientes', path: '/clientes', icon: 'fa-solid fa-users' },
  ];

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

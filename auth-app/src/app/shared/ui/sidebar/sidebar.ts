import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class AppSidebarComponent {
  @Input() open = false;
  @Output() navigate = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();

  readonly items: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'Clientes', path: '/clientes', icon: 'fa-solid fa-users' },
  ];

  handleNavigate(): void {
    this.navigate.emit();
  }

  handleCloseMenu(): void {
    this.closeMenu.emit();
  }
}

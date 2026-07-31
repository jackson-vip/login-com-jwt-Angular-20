import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

type NavSection = {
  title: string;
  icon: string;
  collapsible: boolean;
  expanded: boolean;
  items: NavItem[];
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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sections: NavSection[] = [
    {
      title: 'Visão Geral',
      icon: 'fa-solid fa-chart-line',
      collapsible: false,
      expanded: true,
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-line' },
      ],
    },
    {
      title: 'Gestão',
      icon: 'fa-solid fa-user-gear',
      collapsible: true,
      expanded: true,
      items: [
        { label: 'Clientes', path: '/clientes', icon: 'fa-solid fa-users' },
        { label: 'Fornecedores', path: '/fornecedores', icon: 'fa-solid fa-truck' },
        { label: 'Produtos', path: '/produtos', icon: 'fa-solid fa-box' },
      ],
    },
    {
      title: 'Operações',
      icon: 'fa-solid fa-exchange',
      collapsible: true,
      expanded: true,
      items: [
        { label: 'Entradas', path: '/entradas', icon: 'fa-solid fa-arrow-down' },
        { label: 'Saídas', path: '/saidas', icon: 'fa-solid fa-arrow-up' },
      ],
    },
    {
      title: 'Relatórios',
      icon: 'fa-solid fa-folder-tree',
      collapsible: true,
      expanded: false,
      items: [
        { label: 'Vendas', path: '/relatorios/vendas', icon: 'fa-solid fa-chart-bar' },
        { label: 'Inventário', path: '/relatorios/inventario', icon: 'fa-solid fa-boxes' },
        { label: 'Financeiro', path: '/relatorios/financeiro', icon: 'fa-solid fa-dollar-sign' },
      ],
    },
  ];

  get currentUser() {
    return this.authService.getUser();
  }

  toggleSection(section: NavSection): void {
    if (section.collapsible) {
      section.expanded = !section.expanded;
    }
  }

  handleNavigate(): void {
    this.navigate.emit();
  }

  handleCloseMenu(): void {
    this.closeMenu.emit();
  }

  handleLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

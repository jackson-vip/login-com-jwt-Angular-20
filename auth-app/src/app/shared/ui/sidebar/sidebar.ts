import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Input, Output, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  private static readonly SECTIONS_PREFERENCE_KEY = 'app-sidebar.sections-expanded';

  @Input() open = false;
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

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

  constructor() {
    this.restoreSectionPreferences();
    this.syncSectionsWithRoute(this.router.url);

    this.router.events
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.syncSectionsWithRoute(event.urlAfterRedirects);
        }
      });
  }

  get currentUser() {
    return this.authService.getUser();
  }

  isSectionActive(section: NavSection): boolean {
    return section.items.some((item) => this.isRouteActive(item.path));
  }

  isRouteActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  getTooltip(label: string): string | null {
    return this.collapsed ? label : null;
  }

  toggleSection(section: NavSection): void {
    if (section.collapsible) {
      section.expanded = !section.expanded;
      this.persistSectionPreferences();
    }
  }

  handleNavigate(): void {
    this.navigate.emit();
  }

  handleCloseMenu(): void {
    this.closeMenu.emit();
  }

  handleToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  handleLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  private syncSectionsWithRoute(url: string): void {
    for (const section of this.sections) {
      if (!section.collapsible) {
        continue;
      }

      const hasActiveItem = section.items.some((item) => this.matchesRoute(url, item.path));

      if (hasActiveItem) {
        section.expanded = true;
      }
    }

    this.persistSectionPreferences();
  }

  private matchesRoute(currentUrl: string, itemPath: string): boolean {
    return currentUrl === itemPath || currentUrl.startsWith(`${itemPath}/`);
  }

  private restoreSectionPreferences(): void {
    if (!this.isBrowser) {
      return;
    }

    const storedPreferences = localStorage.getItem(AppSidebarComponent.SECTIONS_PREFERENCE_KEY);

    if (!storedPreferences) {
      return;
    }

    try {
      const expandedByTitle = JSON.parse(storedPreferences) as Record<string, boolean>;

      for (const section of this.sections) {
        if (!section.collapsible) {
          continue;
        }

        const storedState = expandedByTitle[section.title];

        if (typeof storedState === 'boolean') {
          section.expanded = storedState;
        }
      }
    } catch {
      localStorage.removeItem(AppSidebarComponent.SECTIONS_PREFERENCE_KEY);
    }
  }

  private persistSectionPreferences(): void {
    if (!this.isBrowser) {
      return;
    }

    const expandedByTitle = this.sections.reduce<Record<string, boolean>>((accumulator, section) => {
      if (section.collapsible) {
        accumulator[section.title] = section.expanded;
      }

      return accumulator;
    }, {});

    localStorage.setItem(
      AppSidebarComponent.SECTIONS_PREFERENCE_KEY,
      JSON.stringify(expandedByTitle),
    );
  }
}

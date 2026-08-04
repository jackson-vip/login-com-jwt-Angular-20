import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
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
export class AppSidebarComponent implements OnChanges {
  private static readonly SECTIONS_PREFERENCE_KEY = 'app-sidebar.sections-expanded';
  private static readonly MOBILE_DRAWER_MEDIA_QUERY = '(max-width: 960px)';
  private static readonly FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  @Input() open = false;
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  @ViewChild('sidebarRoot') private readonly sidebarRoot?: ElementRef<HTMLElement>;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private lastFocusedElement: HTMLElement | null = null;

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
      title: 'Usuários',
      icon: 'fa-solid fa-users',
      collapsible: true,
      expanded: true,
      items: [
        { label: 'Lista de Usuários', path: '/usuarios', icon: 'fa-solid fa-user' },
        { label: 'Grupo de Acesso', path: '/grupo-acesso', icon: 'fa-solid fa-user-shield' },
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

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser || !changes['open']) {
      return;
    }

    if (changes['open'].currentValue) {
      this.activateMobileFocusTrap();
      return;
    }

    this.restoreFocusAfterClose();
  }

  @HostListener('document:keydown', ['$event'])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open || !this.isMobileDrawer()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleCloseMenu();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
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

  private isMobileDrawer(): boolean {
    return this.isBrowser && window.matchMedia(AppSidebarComponent.MOBILE_DRAWER_MEDIA_QUERY).matches;
  }

  private activateMobileFocusTrap(): void {
    if (!this.isMobileDrawer()) {
      return;
    }

    const activeElement = document.activeElement;

    this.lastFocusedElement = activeElement instanceof HTMLElement ? activeElement : null;

    setTimeout(() => {
      if (!this.open) {
        return;
      }

      const focusableElements = this.getFocusableElements();

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return;
      }

      this.sidebarRoot?.nativeElement.focus();
    });
  }

  private restoreFocusAfterClose(): void {
    if (!this.isMobileDrawer() || !this.lastFocusedElement) {
      this.lastFocusedElement = null;
      return;
    }

    const elementToFocus = this.lastFocusedElement;
    this.lastFocusedElement = null;

    setTimeout(() => {
      if (typeof elementToFocus.focus === 'function') {
        elementToFocus.focus();
      }
    });
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const hasFocusInsideSidebar =
      activeElement instanceof HTMLElement && this.sidebarRoot?.nativeElement.contains(activeElement);

    if (!hasFocusInsideSidebar) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const sidebarElement = this.sidebarRoot?.nativeElement;

    if (!sidebarElement) {
      return [];
    }

    const candidates = sidebarElement.querySelectorAll<HTMLElement>(AppSidebarComponent.FOCUSABLE_SELECTOR);

    return Array.from(candidates).filter(
      (element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0,
    );
  }
}

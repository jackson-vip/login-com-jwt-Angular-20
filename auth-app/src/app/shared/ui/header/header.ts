import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class AppHeaderComponent {
  @Input() user: AuthUser | null = null;
  @Input() sidebarOpen = false;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logoutRequest = new EventEmitter<void>();

  emitMenuToggle(): void {
    this.menuToggle.emit();
  }

  emitLogoutRequest(): void {
    this.logoutRequest.emit();
  }
}

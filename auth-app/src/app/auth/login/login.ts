import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthResponse, AuthService } from '../../core/services/auth.service';
import { PasswordToggleDirective } from '../../core/directives/password-toggle.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    PasswordToggleDirective
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  // Injeção de dependências usando o `inject` do Angular para obter instâncias dos serviços necessários.
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Variáveis com `signal` para gerenciar o estado de mensagens de erro, sucesso e o status de submissão do formulário.
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSubmitting = signal(false);
  private notificationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Formulário reativo para o login, com validação para os campos de email e senha.
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  
  // O Método construtor é usado no Angular para inicializar a classe do componente.
  constructor() {
    const navigationState = history.state as { registrationSuccessMessage?: string };
    if (navigationState.registrationSuccessMessage) {
      this.showSuccessMessage(navigationState.registrationSuccessMessage);
    }
  }

  // Lifecycle Métodos : 
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.successMessage.set('');
      this.errorMessage.set('Informe email e senha validos para continuar.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    const payload = this.loginForm.getRawValue() as { email: string; password: string };

    this.authService.login(payload).subscribe({
      next: (response: AuthResponse) => {
        this.showSuccessMessage(`Login realizado para ${response.user.username}.`);
        this.errorMessage.set('');
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: { error?: { detail?: string } }) => {
        this.errorMessage.set(error.error?.detail ?? 'Nao foi possivel realizar o login.');
        this.scheduleMessageDismiss();
        this.isSubmitting.set(false);
      },
    });
  }

  // Métodos :
  private showSuccessMessage(message: string): void {
    this.successMessage.set(message);
    this.scheduleMessageDismiss();
  }

  private scheduleMessageDismiss(): void {
    if (this.notificationTimeoutId) {
      clearTimeout(this.notificationTimeoutId);
    }

    this.notificationTimeoutId = setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
      this.notificationTimeoutId = null;
    }, 4000);
  }
}

/** Dicionário englês-português para termos usados no código:
 *  - scheduleMessageDismiss: agendarDescarteMensagem
 *  - showSuccessMessage: mostrarMensagemSucesso
 *  - navigationState: estadoNavegacao
 */
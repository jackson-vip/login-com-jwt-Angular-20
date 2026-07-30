import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { PasswordToggleDirective } from '../../core/directives/password-toggle.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PasswordToggleDirective
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSubmitting = signal(false);
  private notificationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /** Explicação :
   * Usamos o ReactiveFormsModule -> Para criar um formulário reativo, ouseja, um formulário que é controlado pelo código TypeScript. Ele nos permite criar um FormGroup, que é um grupo de controles de formulário, e associá-lo ao template HTML.
   * FormBuilder -> É uma classe que facilita a criação de formulários reativos. Ele fornece métodos para criar FormGroup, FormControl e FormArray de forma mais concisa.
   * FormGroup -> É uma coleção de controles de formulário. Ele representa um formulário completo ou uma parte dele. No nosso caso, estamos criando um FormGroup para o formulário de registro, que contém os campos name, email e password.
   * No construtor da classe Register, estamos usando o FormBuilder para criar o FormGroup e inicializá-lo com os campos necessários para o registro.
   * O template HTML (register.html) irá usar esse FormGroup para criar os campos de entrada e associá-los ao formulário reativo, permitindo que o Angular gerencie o estado do formulário e as validações.
   */

  registerForm: FormGroup;

  constructor( private fb: FormBuilder ) { 
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.successMessage.set('');
      this.errorMessage.set('Revise os campos obrigatorios antes de continuar.');
      this.scheduleMessageDismiss();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    const payload = this.registerForm.getRawValue() as {
      username: string;
      email: string;
      password: string;
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.successMessage.set(`Cadastro realizado para ${response.username}.`);
        this.errorMessage.set('');
        this.registerForm.reset();
        this.isSubmitting.set(false);
        this.scheduleMessageDismiss();
        void this.router.navigate(['/login'], {
          state: {
            registrationSuccessMessage: `Cadastro realizado com sucesso para ${response.username}. Agora faca seu login.`,
          },
        });
      },
      error: (error: { error?: { detail?: string } }) => {
        this.errorMessage.set(error.error?.detail ?? 'Nao foi possivel concluir o cadastro.');
        this.scheduleMessageDismiss();
        this.isSubmitting.set(false);
      },
    });
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

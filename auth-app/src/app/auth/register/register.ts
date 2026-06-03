import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule 
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

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
    // Se o formulário for válido
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      console.log('Form Data:', formData);
      // Aqui você pode adicionar a lógica para enviar os dados do formulário para o backend ou realizar outras ações necessárias.
    } else {
      console.log('Formulário inválido');
    }
  }

}

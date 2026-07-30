import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '.pw-wrap', // aplica em qualquer elemento com essa classe
  standalone: true,
})
export class PasswordToggleDirective {
  private visible = false;
  private toggleTimeout: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener('click', ['$event.target'])
  onClick(target: EventTarget | null) {
    // Se o target não for um HTMLElement, retorna imediatamente.
    if (!(target instanceof HTMLElement)) return;
    // Se o target não for um ícone de olho (fa-eye ou fa-eye-slash), retorna imediatamente.
    if (!target.classList.contains('fa-eye') && !target.classList.contains('fa-eye-slash')) return;

    const input = this.el.nativeElement.querySelector('input');
    const icon = this.el.nativeElement.querySelector('i');

    // Limpar timeout anterior se existir
    if (this.toggleTimeout) {
      clearTimeout(this.toggleTimeout);
    }

    this.visible = !this.visible;
    this.renderer.setAttribute(input, 'type', this.visible ? 'text' : 'password'); // Se visible for true, o tipo do input será 'text', caso contrário, será 'password'.
    this.renderer.removeClass(icon, this.visible ? 'fa-eye' : 'fa-eye-slash'); // Se visible for true, remove a classe 'fa-eye', caso contrário, remove a classe 'fa-eye-slash'.
    this.renderer.addClass(icon, this.visible ? 'fa-eye-slash' : 'fa-eye'); // Se visible for true, adiciona a classe 'fa-eye-slash', caso contrário, adiciona a classe 'fa-eye'.

    // Retornar ao estado inicial após 10 segundos
    if (this.visible) {
      this.toggleTimeout = setTimeout(() => {
        this.visible = false;
        this.renderer.setAttribute(input, 'type', 'password');
        this.renderer.removeClass(icon, 'fa-eye-slash');
        this.renderer.addClass(icon, 'fa-eye');
      }, 8000);
    }
  }
}

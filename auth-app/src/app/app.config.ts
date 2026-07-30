import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

/** Aqui podemos adicionar configurações globais para o aplicativo Angular, como provedores de serviços, 
 * interceptadores HTTP e configuração de roteamento.
 * 
 * O `provideHttpClient` é usado para configurar o cliente HTTP do Angular, permitindo a adição de interceptadores, como o `authInterceptor`, que pode manipular requisições e respostas HTTP.
 * 
 * O `provideRouter` é usado para configurar o roteamento do aplicativo, permitindo a definição de rotas e navegação entre diferentes componentes.
 * 
 * O `provideBrowserGlobalErrorListeners` e `provideZoneChangeDetection` são usados para melhorar a detecção de mudanças e o tratamento de erros globais no aplicativo.
 * 
 * Em resumo, este arquivo é responsável por configurar aspectos importantes do aplicativo Angular, como comunicação HTTP, roteamento e tratamento de erros.
 * 
 * @see https://angular.io/guide/dependency-injection-providers
 * @see https://angular.io/api/common/http/HttpClient
 * @see https://angular.io/api/router/Router
 * @see https://angular.io/api/core/ApplicationConfig
 * @see https://angular.io/api/core/provideBrowserGlobalErrorListeners
 *
 */

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes)
  ]
};

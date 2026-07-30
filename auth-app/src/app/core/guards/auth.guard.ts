import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Guard para rotas que requerem autenticação. 
// Se o usuário não estiver autenticado, ele será redirecionado para a página de login.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(
    map((isAuthenticated) => isAuthenticated || router.createUrlTree(['/login'])),
  );
};

export const guestOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(
    map((isAuthenticated) => (!isAuthenticated ? true : router.createUrlTree(['/dashboard']))),
  );
};

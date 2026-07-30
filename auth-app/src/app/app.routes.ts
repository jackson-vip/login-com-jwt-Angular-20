import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { guestOnlyGuard, authGuard } from './core/guards/auth.guard';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'login', component: Login, canActivate: [guestOnlyGuard] },
	{ path: 'register', component: Register, canActivate: [guestOnlyGuard] },
	{ path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'login' },
];

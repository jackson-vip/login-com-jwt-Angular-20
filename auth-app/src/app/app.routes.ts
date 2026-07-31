import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { guestOnlyGuard, authGuard } from './core/guards/auth.guard';
import { PrivateLayout } from './layouts/private-layout/private-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Clients } from './pages/clients/clients';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{
		path: '',
		component: PrivateLayout,
		canActivate: [authGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{ path: 'dashboard', component: Dashboard },
			{ path: 'clientes', component: Clients },
		],
	},
	{
		path: '',
		component: PublicLayout,
		canActivate: [guestOnlyGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'login' },
			{ path: 'login', component: Login },
			{ path: 'register', component: Register },
		],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

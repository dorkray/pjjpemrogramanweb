import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';

// Import semua komponen yang sudah kita buat
import { Activities } from './pages/activities/activities';
import { Contacts } from './pages/contacts/contacts';
import { Customers } from './pages/customers/customers';
import { Deals } from './pages/deals/deals';
import { Leads } from './pages/leads/leads';
import { Users } from './pages/users/users';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: Login },

  { path: 'activities', component: Activities, canActivate: [authGuard] },
  { path: 'contacts', component: Contacts, canActivate: [authGuard] },
  { path: 'customers', component: Customers, canActivate: [authGuard] },
  { path: 'deals', component: Deals, canActivate: [authGuard] },
  { path: 'leads', component: Leads, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] }
];
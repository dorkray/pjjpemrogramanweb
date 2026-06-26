import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';


// Import semua komponen yang sudah kita buat
import { Dashboard } from './pages/dashboard/dashboard';
import { Activities } from './pages/activities/activities';
import { Contacts } from './pages/contacts/contacts';
import { Customers } from './pages/customers/customers';
import { Deals } from './pages/deals/deals';
import { Leads } from './pages/leads/leads';
import { Users } from './pages/users/users';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'auth/login', component: Login },
  

  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'activities', component: Activities, canActivate: [authGuard] },
  { path: 'contacts', component: Contacts, canActivate: [authGuard] },
  { path: 'customers', component: Customers, canActivate: [authGuard] },
  { path: 'deals', component: Deals, canActivate: [authGuard] },
  { path: 'leads', component: Leads, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] }
];
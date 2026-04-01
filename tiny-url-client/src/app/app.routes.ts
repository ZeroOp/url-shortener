import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { authGuard } from './core/guards/auth-guard';
import { SigninComponent } from './pages/signin/signin';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'signin', component: SigninComponent },
    {
        path:'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    }
];

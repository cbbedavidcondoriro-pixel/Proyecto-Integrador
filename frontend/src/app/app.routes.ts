import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Patients } from './pages/patients/patients';
import { Treatments } from './pages/treatments/treatments'; // 👈 Importamos el nuevo componente de tratamientos

export const routes: Routes = [

    {
        path: '',
        component: Home
    },

    {
        path: 'login',
        component: Login
    },

    {
        path: 'register',
        component: Register
    },

    {
        path: 'dashboard',
        component: Dashboard
    },

    {
        path: 'patients',
        component: Patients
    },

    {
        path: 'treatments', // 👈 Agregamos la ruta oficial para Tratamientos Médicos
        component: Treatments
    },

    {
        path: '**',
        redirectTo: ''
    }

];
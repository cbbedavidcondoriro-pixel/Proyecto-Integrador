import { Routes } from '@angular/router';

// Importaciones existentes del proyecto
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Patients } from './pages/patients/patients';
import { Treatments } from './pages/treatments/treatments'; 

// Nueva importación del módulo de Reportes Clínicos
import { ReportesComponent } from './pages/reportes/reportes';

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
        path: 'treatments',
        component: Treatments
    },
    {
        path: 'reportes', // 👈 Ruta oficial para el Centro de Reportes Médicos
        component: ReportesComponent
    },
    /* 💡 NOTA: Si en el futuro creas los componentes para Recordatorios y Configuración, 
    solo cambias el componente acá abajo como hicimos con Reportes. Por ahora los redirigimos al dashboard.
    */
    {
        path: 'recordatorios',
        redirectTo: 'dashboard'
    },
    {
        path: 'configuracion',
        redirectTo: 'dashboard'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
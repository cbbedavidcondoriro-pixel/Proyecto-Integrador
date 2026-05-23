import { Routes } from '@angular/router';

// Importaciones existentes del proyecto
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Patients } from './pages/patients/patients';
import { Treatments } from './pages/treatments/treatments'; 
import { ConsultasComponent } from './pages/consultas/consultas';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';

// Nueva importación del módulo de Historial Clínico y Reportes
import { HistorialClinicoComponent } from './pages/historial-clinico/historial-clinico';
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
        path: 'historial-clinico', // 👈 Ruta oficial mapeada para las observaciones médicas
        component: HistorialClinicoComponent
    },
    {
        path: 'treatments',
        component: Treatments
    },
    {
        path: 'reportes', 
        component: ReportesComponent
    },
    { 
        path: 'consultas', 
        component: ConsultasComponent 
    },
    { 
        path: 'configuracion', 
        component: ConfiguracionComponent 
    },
    {
        path: '**',
        redirectTo: ''
    }
];
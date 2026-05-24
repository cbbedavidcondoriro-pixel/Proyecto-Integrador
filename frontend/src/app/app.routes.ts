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

import { BuscarPaciente } from './pages/buscar-paciente/buscar-paciente';

import { RegistrarPaciente } from './pages/registrar-paciente/registrar-paciente';

import { RegistrarTratamiento } from './pages/registrar-tratamiento/registrar-tratamiento';

import { ConfiguracionFarmaceutico } from './pages/configuracion-farmaceutico/configuracion-farmaceutico';

// Nueva importación del módulo de Historial Clínico y Reportes
import { HistorialClinicoComponent } from './pages/historial-clinico/historial-clinico';
import { ReportesComponent } from './pages/reportes/reportes';

// 🚀 NUEVA VISTA: Importación de la pantalla dedicada al Listado Completo
import { PatientsList } from './pages/patients/patients-list'; 

// 💊 NUEVA VISTA FARMACIA: Importación de la pantalla exclusiva para el Farmacéutico
import { DashboardFarmaceutico } from './pages/dashboard-farmaceutico/dashboard-farmaceutico';

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
        path: 'dashboard-farmaceutico', // 👈 Nueva ruta oficial para el módulo del farmacéutico global
        component: DashboardFarmaceutico
    },
    {
        path: 'patients', // 👈 Aquí se queda solo el formulario de Registro
        component: Patients
    },
    {
        path: 'patients-list', // 👈 Nueva ruta oficial para la tabla completa de pacientes
        component: PatientsList
    },
    {
        path: 'historial-clinico', 
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
    path: 'buscar-paciente',
    component: BuscarPaciente
    },
    {
    path: 'registrar-paciente',
    component: RegistrarPaciente
    },
    {
    path: 'registrar-tratamiento',
    component: RegistrarTratamiento
    },
    {
    path: 'configuracion-farmaceutico',
    component: ConfiguracionFarmaceutico
   },
    {
        path: '**', // 👈 Comodín: si escriben cualquier ruta inválida, regresa al Home seguro
        redirectTo: ''
    }
];
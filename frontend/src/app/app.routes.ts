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

import { DashboardPaciente } from './pages/dashboard-paciente/dashboard-paciente';

import { AlertasIot } from './pages/alertas-iot/alertas-iot';

// Módulo de Historial Clínico y Reportes
import { HistorialClinicoComponent } from './pages/historial-clinico/historial-clinico';
import { ReportesComponent } from './pages/reportes/reportes';

// Vista dedicada al Listado Completo de Pacientes
import { PatientsList } from './pages/patients/patients-list'; 

// Vista exclusiva para el Dashboard del Farmacéutico
import { DashboardFarmaceutico } from './pages/dashboard-farmaceutico/dashboard-farmaceutico';

// 🚀 NUEVAS IMPORTACIONES EXCLUSIVAS PARA EL PACIENTE SINKRONIZADO CON IOT
import { InicioPaciente } from './pages/inicio-paciente/inicio-paciente';
import { LoginPacientePage } from './pages/login-paciente/login-paciente.page';

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
        path: 'dashboard-farmaceutico', 
        component: DashboardFarmaceutico
    },
    {
        path: 'patients', 
        component: Patients
    },
    {
        path: 'patients-list', 
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

    // 🔔 RUTA DE BIENVENIDA EXCLUSIVA PARA PACIENTES (VISTA MÓVIL)
    {
        path: 'inicio-paciente',
        component: InicioPaciente
    },

    // 🔐 INICIO DE SESIÓN EXCLUSIVO PARA PACIENTES
    {
        path: 'login-paciente',
        component: LoginPacientePage
    },
    {
    path: 'dashboard-paciente',
    component: DashboardPaciente
    },
{ path: 'alertas-iot', component: AlertasIot },

    // 🛑 COMODÍN GLOBAL (Siempre debe ser la última ruta del arreglo)
    {
        path: '**', 
        redirectTo: ''
    }
];
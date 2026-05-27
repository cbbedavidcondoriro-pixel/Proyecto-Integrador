import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-paciente',
  templateUrl: './dashboard-paciente.html',
  styleUrls: ['./dashboard-paciente.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class DashboardPaciente implements OnInit {
  
  API: string = 'http://localhost:5000';
  pacienteData: any = null; // Datos de la sesión local
  
  // Variables reales de la Base de Datos
  perfilBD: any = null;
  tratamientos: any[] = [];
  historialClinico: any = null;
  
  cargando: boolean = true;
  errorMensaje: string = '';
  fechaActual: string = '';

  // 🌟 Inyectamos ChangeDetectorRef (cdr) para obligar a Angular a redibujar la vista
  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.obtenerFechaActual();
  }

  ngOnInit() {
    const sesion = localStorage.getItem('paciente_sesion');
    if (!sesion) {
      this.router.navigate(['/login-paciente']);
      return;
    }
    this.pacienteData = JSON.parse(sesion);
    this.cargarDashboardCompleto();
  }

  obtenerFechaActual() {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-ES', opciones);
  }

  cargarDashboardCompleto() {
    this.cargando = true;
    this.errorMensaje = '';

    this.http.get(`${this.API}/api/paciente/${this.pacienteData.id}/dashboard-completo`)
      .subscribe({
        next: (res: any) => {
          console.log("📥 Respuesta recibida de Flask:", res); // Esto te permitirá ver en la consola F12 si llegaron los datos
          
          if (res.success) {
            this.perfilBD = res.perfil;
            this.tratamientos = res.tratamientos || [];
            this.historialClinico = res.historial;
          } else {
            this.errorMensaje = res.mensaje;
          }
          
          this.cargando = false;
          this.cdr.detectChanges(); // 🌟 ¡Fuerza a Angular a ocultar el Spinner y mostrar los datos!
        },
        error: (err) => {
          console.error('Error al conectar con el ecosistema de base de datos:', err);
          this.errorMensaje = 'Error de enlace seguro. Sincronización fallida con MySQL.';
          this.cargando = false;
          this.cdr.detectChanges(); // 🌟 También forzamos el redibujado en caso de error
        }
      });
  }

  logoutPaciente() {
    localStorage.removeItem('paciente_sesion');
    this.router.navigate(['/inicio-paciente']);
  }
}
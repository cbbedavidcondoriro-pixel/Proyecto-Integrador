import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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
  pacienteData: any = null; 
  
  perfilBD: any = null;
  tratamientos: any[] = [];
  historialClinico: any = null;
  
  cargando: boolean = true;
  errorMensaje: string = '';
  fechaActual: string = '';

  // 🌟 Variable interactiva para abrir/cerrar los detalles del doctor
  mostrarTarjetaMedico: boolean = false;

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

  // 🌟 Alternar el modal del doctor
  toggleTarjetaMedico() {
    this.mostrarTarjetaMedico = !this.mostrarTarjetaMedico;
    this.cdr.detectChanges();
  }

  // 🌟 Listener global: Cierra la tarjeta flotante del médico si el paciente pulsa fuera de ella
  @HostListener('document:click', ['$event'])
  cerrarTarjetaAlHacerClicFuera(event: Event) {
    this.mostrarTarjetaMedico = false;
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
          console.log("📥 Datos del paciente cargados desde Flask:", res);
          
          if (res.success) {
            this.perfilBD = res.perfil;
            this.tratamientos = res.tratamientos || [];
            this.historialClinico = res.historial;
          } else {
            this.errorMensaje = res.mensaje;
          }
          
          this.cargando = false;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error al conectar con el ecosistema de base de datos:', err);
          this.errorMensaje = 'Error de enlace seguro. Sincronización fallida con MySQL.';
          this.cargando = false;
          this.cdr.detectChanges(); 
        }
      });
  }

  logoutPaciente() {
    localStorage.removeItem('paciente_sesion');
    this.router.navigate(['/inicio-paciente']);
  }
}
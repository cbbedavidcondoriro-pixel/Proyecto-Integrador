import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // 👈 Limpiamos RouterLink de aquí
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // 👈 Quitamos RouterLink para eliminar el WARNING NG8113
  templateUrl: './treatments.html',
  styleUrl: './treatments.css'
})
export class Treatments implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuario: any = null;
  pacientes: any[] = [];
  tratamientos: any[] = [];

  // Objeto enlazado al formulario
  tratamiento = {
    paciente_id: '',
    medicamento: '',
    dosis: '',
    frecuencia: 'Cada 4 horas',
    via_administracion: 'Oral',
    hora_inicio: '',
    duracion_dias: '',
    fecha_inicio: '',
    fecha_final: '',
    activar_alertas: false,
    notificar_incumplimiento: false,
    monitoreo_tiempo_real: false,
    alertar_familiar: false,
    observaciones: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.cargarSesionYDatos();
    }, 50);
  }

  cargarSesionYDatos() {
    const sesion = localStorage.getItem('usuario');
    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(sesion);
    const medicoId = this.usuario.id || this.usuario.id_usuario || 1;

    // 1. Cargar pacientes asignados a este médico para el select dropdown
    this.http.get<any[]>(`${`${this.API}/pacientes`}/${medicoId}`)
      .subscribe({
        next: (res) => {
          this.pacientes = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar pacientes para tratamientos:', err)
      });

    // 2. Cargar historial de tratamientos creados por este médico
    this.http.get<any[]>(`${`${this.API}/tratamientos`}/${medicoId}`)
      .subscribe({
        next: (res) => {
          this.tratamientos = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar historial de tratamientos:', err)
      });
  }

  guardarTratamiento() {
    if (!this.tratamiento.paciente_id || !this.tratamiento.medicamento || !this.tratamiento.fecha_inicio) {
      alert('Por favor, selecciona un paciente, ingresa el medicamento y la fecha de inicio.');
      return;
    }

    const medicoId = this.usuario.id || this.usuario.id_usuario || 1;

    const dataToSend = {
      medico_id: medicoId,
      ...this.tratamiento
    };

  this.http.post(`${this.API}/tratamientos`, dataToSend)
      .subscribe({
        next: (res: any) => {
          alert(res.mensaje || '¡Tratamiento inteligente guardado con éxito!');
          this.limpiarFormulario();
          this.cargarSesionYDatos(); // Recargar historial de la tabla
        },
        error: (err) => {
          console.error('Error al guardar el tratamiento:', err);
          alert('Error al procesar el tratamiento en el servidor Flask.');
        }
      });
  }

  limpiarFormulario() {
    this.tratamiento = {
      paciente_id: '',
      medicamento: '',
      dosis: '',
      frecuencia: 'Cada 4 horas',
      via_administracion: 'Oral',
      hora_inicio: '',
      duracion_dias: '',
      fecha_inicio: '',
      fecha_final: '',
      activar_alertas: false,
      notificar_incumplimiento: false,
      monitoreo_tiempo_real: false,
      alertar_familiar: false,
      observaciones: ''
    };
    this.cdr.detectChanges();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
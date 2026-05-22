import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reportes.html'
})
export class ReportesComponent implements OnInit {
  idPacienteSeleccionado: number = 0;
  idMedicoLogueado: number = 1; // Por defecto 1 (Se sobreescribe con la sesión)
  
  listaPacientes: any[] = [];
  reportes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // 1. Obtener la sesión real del médico desde el localStorage
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      const userObj = JSON.parse(usuarioSesion);
      this.idMedicoLogueado = userObj.id || 1; 
    }

    this.cargarPacientesDelMedico();
  }

  // Carga la lista inicial para el selector desplegable
  cargarPacientesDelMedico() {
    // Reemplaza esta URL con tu endpoint actual de visualización de pacientes
    this.http.get<any[]>(`http://localhost:5000/api/pacientes?id_medico=${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { this.listaPacientes = data; },
        error: (err) => { console.error('Error cargando pacientes', err); }
      });
  }

  // Carga la telemetría e historial clínico exclusivo al cambiar de paciente
  cargarReportes() {
    if (this.idPacienteSeleccionado === 0) return;

    this.http.get<any[]>(`http://localhost:5000/api/reportes/paciente/${this.idPacienteSeleccionado}?id_medico=${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          this.reportes = data; 
        },
        error: (err) => { 
          console.error('Error al obtener reportes', err); 
          this.reportes = [];
        }
      });
  }
}
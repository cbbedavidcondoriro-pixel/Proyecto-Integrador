import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  
  API = 'http://127.0.0.1:5000';
  idPacienteSeleccionado: number = 0;
  idMedicoLogueado: number = 1;
  
  usuario: any = null;
  listaPacientes: any[] = [];
  
  // Objeto contenedor maestro del reporte consolidado
  reporteMedica: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      this.usuario = JSON.parse(usuarioSesion);
      this.idMedicoLogueado = this.usuario.id || this.usuario.id_usuario || this.usuario.id_medico || 1; 
    }
    this.cargarPacientesDelMedico();
  }

  cargarPacientesDelMedico() {
    this.http.get<any[]>(`${this.API}/api/pacientes/selector/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          this.listaPacientes = data || []; 
          this.cdr.detectChanges();
        },
        error: (err) => console.error('❌ Error cargando select de pacientes:', err)
      });
  }

  cargarReportes() {
    if (Number(this.idPacienteSeleccionado) === 0) {
      this.reporteMedica = null;
      return;
    }

    this.http.get<any>(`${this.API}/api/reportes/consolidado/${this.idPacienteSeleccionado}`)
      .subscribe({
        next: (data) => { 
          console.log("📊 Reporte clínico integrado recibido:", data);
          this.reporteMedica = data; 
          this.cdr.detectChanges();
        },
        error: (err) => { 
          console.error('❌ Error consolidando la ficha:', err); 
          this.reporteMedica = null;
        }
      });
  }

  // Método de impresión nativo con sanitización de interfaz
  imprimirReporte() {
    window.print();
  }
}
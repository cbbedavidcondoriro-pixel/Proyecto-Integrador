import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './historial-clinico.html',
  styleUrls: ['./historial-clinico.css']
})
export class HistorialClinicoComponent implements OnInit {
  API = 'http://127.0.0.1:5000'; // Sincronizado a la IP estándar de Flask
  idMedicoLogueado: number = 1;
  listaPacientes: any[] = [];

  registro: any = {
    paciente_id: 0,
    motivo_consulta: '',
    sintomas_principales: '',
    antecedentes_relevantes: '',
    presion_arterial: '',
    frecuencia_cardiaca: null,
    temperatura_corporal: null,
    saturacion_oxigeno: null,
    examen_fisico_detallado: '',
    diagnostico_definitivo: '',
    indicaciones_inmediatas: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      const userObj = JSON.parse(usuarioSesion);
      this.idMedicoLogueado = userObj.id || userObj.id_usuario || 1;
    }
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.http.get<any[]>(`${this.API}/pacientes/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => {
          console.log('Pacientes cargados para historial clínico:', data);
          this.listaPacientes = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando pacientes:', err)
      });
  }

  guardarHistorial() {
    if (Number(this.registro.paciente_id) === 0) {
      alert('Por favor, seleccione un paciente de la lista.');
      return;
    }
    if (!this.registro.motivo_consulta.trim() || !this.registro.diagnostico_definitivo.trim()) {
      alert('El motivo de consulta y el diagnóstico definitivo son campos obligatorios.');
      return;
    }

    const payload = {
      medico_id: this.idMedicoLogueado,
      paciente_id: Number(this.registro.paciente_id),
      motivo_consulta: this.registro.motivo_consulta,
      sintomas_principales: this.registro.sintomas_principales,
      antecedentes_medicos: this.registro.antecedentes_relevantes, 
      examen_fisico: this.registro.examen_fisico_detallado,        
      diagnostico_definitivo: this.registro.diagnostico_definitivo,
      indicaciones_inmediatas: this.registro.indicaciones_inmediatas,
      presion_arterial: this.registro.presion_arterial,
      frecuencia_cardiaca: this.registro.frecuencia_cardiaca,
      temperatura: this.registro.temperatura_corporal,
      saturacion_oxigeno: this.registro.saturacion_oxigeno
    };

    this.http.post<any>(`${this.API}/api/historial`, payload)
      .subscribe({
        next: (res) => {
          alert(res.mensaje || '¡Evaluación e historial clínico registrados con éxito!');
          this.router.navigate(['/treatments']); // Redirecciona directo a tratamientos farmacológicos
        },
        error: (err) => {
          console.error('Error al guardar expediente en el servidor:', err);
          alert('Hubo un error al registrar la evaluación en el servidor.');
        }
      });
  }
}
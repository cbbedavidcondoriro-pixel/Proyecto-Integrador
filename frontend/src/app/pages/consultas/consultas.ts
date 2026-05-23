import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './consultas.html',
  styleUrls: ['./consultas.css']
})
export class ConsultasComponent implements OnInit {
  // 🌟 Estandarizamos la URL base eliminando el '/api' estorboso de las rutas fijas
  API = 'http://localhost:5000';
  
  // Usamos tipo 'any' para evitar conflictos si el HTML inyecta un String desde el <select>
  idPacienteSeleccionado: any = 0;
  idMedicoLogueado: number = 1; 
  
  listaPacientes: any[] = [];
  datosConsulta: any = null; // Almacenará la ficha completa del paciente para el HTML

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      const userObj = JSON.parse(usuarioSesion);
      // Extrae tu ID de sesión real
      this.idMedicoLogueado = userObj.id || userObj.id_usuario || 1; 
    }
    this.cargarPacientesDelMedico();
  }

  // Carga inicial (Idéntico a la lógica funcional de tus Tratamientos)
  cargarPacientesDelMedico() {
    this.http.get<any[]>(`${this.API}/pacientes/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          this.listaPacientes = data || []; 
          this.cdr.detectChanges();
        },
        error: (err) => { 
          console.error('Error cargando pacientes en consultas:', err); 
        }
      });
  }

  // 🛠️ FUNCIÓN DEL BOTÓN CORREGIDA
  realizarConsulta() {
    // Forzamos la conversión a número para evitar que Angular pase un texto vacío o "0"
    const idPaciente = Number(this.idPacienteSeleccionado);

    if (idPaciente === 0 || !idPaciente) {
      alert('Por favor, seleccione un paciente válido de la lista desplegable.');
      return;
    }

    console.log(`Enviando consulta a Flask para Paciente ID: ${idPaciente} y Médico ID: ${this.idMedicoLogueado}`);

    // Hacemos la llamada exacta apuntando a tu endpoint de Python
    this.http.get<any>(`${this.API}/api/consultas/paciente/${idPaciente}?id_medico=${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          console.log('Respuesta de la base de datos recibida con éxito:', data);
          this.datosConsulta = data; 
          this.cdr.detectChanges(); // Forzamos a Angular a pintar las tarjetas del HTML inmediatamente
        },
        error: (err) => { 
          console.error('Error crítico al obtener la ficha clínica desde Flask:', err); 
          alert('Error en el servidor. Revise que la ruta exista en Python y que MySQL esté corriendo.');
          this.datosConsulta = null;
          this.cdr.detectChanges();
        }
      });
  }
}
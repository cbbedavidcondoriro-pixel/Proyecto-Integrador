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
  // URL Base del servidor backend de Flask
  API = 'http://localhost:5000';
  
  idPacienteSeleccionado: any = "0";
  idMedicoLogueado: number = 1; 
  
  listaPacientes: any[] = [];
  datosConsulta: any = null; 

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      const userObj = JSON.parse(usuarioSesion);
      // Extrae de forma segura el identificador numérico de la sesión activa
      this.idMedicoLogueado = userObj.id || userObj.id_usuario || 1; 
    }
    this.cargarPacientesDelMedico();
  }

  cargarPacientesDelMedico() {
    // Si la ruta base directa da error, probamos alternativamente con el prefijo /api
    this.http.get<any[]>(`${this.API}/pacientes/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          this.listaPacientes = data || []; 
          this.cdr.detectChanges();
        },
        error: (err) => { 
          console.warn('Intentando ruta alternativa para lista de pacientes...');
          this.http.get<any[]>(`${this.API}/api/pacientes/${this.idMedicoLogueado}`)
            .subscribe({
              next: (data) => {
                this.listaPacientes = data || [];
                this.cdr.detectChanges();
              },
              error: (err2) => {
                console.error('Error definitivo cargando pacientes:', err2);
              }
            });
        }
      });
  }

  realizarConsulta() {
    const idPaciente = Number(this.idPacienteSeleccionado);

    if (idPaciente === 0 || !idPaciente) {
      alert('Por favor, seleccione un paciente válido de la lista desplegable.');
      return;
    }

    console.log(`Enviando consulta a Flask para Paciente ID: ${idPaciente} y Médico ID: ${this.idMedicoLogueado}`);

    // Intentamos la petición al endpoint estructurado
    const urlPrimaria = `${this.API}/api/consultas/paciente/${idPaciente}?id_medico=${this.idMedicoLogueado}`;
    
    this.http.get<any>(urlPrimaria)
      .subscribe({
        next: (data) => { 
          console.log('Respuesta recibida con éxito:', data);
          this.datosConsulta = data; 
          this.cdr.detectChanges(); 
        },
        error: (err) => { 
          console.warn('Ruta primaria falló (404/500). Intentando comunicación con ruta alternativa...');
          
          // Reintento automático sin el prefijo /api en caso de desajuste de enrutamiento
          const urlAlternativa = `${this.API}/consultas/paciente/${idPaciente}?id_medico=${this.idMedicoLogueado}`;
          
          this.http.get<any>(urlAlternativa)
            .subscribe({
              next: (data) => {
                console.log('Respuesta recibida con éxito desde ruta alternativa:', data);
                this.datosConsulta = data;
                this.cdr.detectChanges();
              },
              error: (err2) => {
                console.error('Error crítico al obtener la ficha clínica desde Flask:', err2); 
                
                // Extraemos el mensaje de error real enviado por Python si existe
                const mensajeError = err2.error?.error || 'Error en el servidor. Revise que la ruta exista en Python y que MySQL esté corriendo.';
                alert(mensajeError);
                
                this.datosConsulta = null;
                this.cdr.detectChanges();
              }
            });
        }
      });
  }
}
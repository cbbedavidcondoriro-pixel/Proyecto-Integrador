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
  API = 'http://localhost:5000';
  
  idPacienteSeleccionado: any = "0";
  idMedicoLogueado: number = 1; 
  
  listaPacientes: any[] = [];
  datosConsulta: any = null; 

  pestanaActiva: string = 'ficha';
  
  mostrarModalHistorial: boolean = false;
  historialEditando: any = {};

  mostrarModalTratamiento: boolean = false;
  tratamientoEditando: any = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      const userObj = JSON.parse(usuarioSesion);
      this.idMedicoLogueado = userObj.id || userObj.id_usuario || 1; 
    }
    this.cargarPacientesDelMedico();
  }

  cargarPacientesDelMedico() {
    this.http.get<any[]>(`${this.API}/pacientes/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => { 
          this.listaPacientes = data || []; 
          this.cdr.detectChanges();
        },
        error: (err) => { 
          this.http.get<any[]>(`${this.API}/api/pacientes/${this.idMedicoLogueado}`)
            .subscribe({
              next: (data) => {
                this.listaPacientes = data || [];
                this.cdr.detectChanges();
              },
              error: (err2) => console.error('Error cargando pacientes:', err2)
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

    const pacienteEncontrado = this.listaPacientes.find(p => Number(p.id) === idPaciente);
    if (!pacienteEncontrado) {
      alert('No se encontraron los datos base del paciente.');
      return;
    }

    this.datosConsulta = {
      paciente: pacienteEncontrado,
      historial_clinico: null,
      treatment: null, // Mapeado por seguridad
      tratamiento: null,
      tiene_tratamiento: false
    };

    this.pestanaActiva = 'ficha';

    const urlPrimaria = `${this.API}/api/consultas/paciente/${idPaciente}?id_medico=${this.idMedicoLogueado}`;
    
    this.http.get<any>(urlPrimaria).subscribe({
      next: (res) => {
        console.log('Respuesta tratamiento recibida:', res);
        const tratamientoEncontrado = res?.tratamiento || res;

        if (tratamientoEncontrado && (tratamientoEncontrado.medicamento || tratamientoEncontrado.id)) {
          this.datosConsulta.tratamiento = tratamientoEncontrado;
          this.datosConsulta.tiene_tratamiento = true;
        }

        this.buscarHistorialClinico(idPaciente);
      },
      error: (err) => {
        console.warn('Ruta primaria falló. Intentando alternativa...');
        const urlAlternativa = `${this.API}/consultas/paciente/${idPaciente}?id_medico=${this.idMedicoLogueado}`;
        
        this.http.get<any>(urlAlternativa).subscribe({
          next: (resAlt) => {
            const tratamientoEncontrado = resAlt?.tratamiento || resAlt;
            if (tratamientoEncontrado && (tratamientoEncontrado.medicamento || tratamientoEncontrado.id)) {
              this.datosConsulta.tratamiento = tratamientoEncontrado;
              this.datosConsulta.tiene_tratamiento = true;
            }
            this.buscarHistorialClinico(idPaciente);
          },
          error: (err2) => {
            console.error('No se pudo obtener tratamiento de ninguna ruta.');
            this.buscarHistorialClinico(idPaciente);
          }
        });
      }
    });
  }

  buscarHistorialClinico(idPaciente: number) {
    this.http.get<any>(`${this.API}/api/historial/ultimo/${idPaciente}`)
      .subscribe({
        next: (historialData) => {
          console.log('Historial clínico inyectado con éxito:', historialData);
          if (historialData && historialData.id) {
            this.datosConsulta.historial_clinico = historialData;
          } else {
            this.datosConsulta.historial_clinico = null;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.warn('El paciente no registra historial clínico.');
          this.datosConsulta.historial_clinico = null;
          this.cdr.detectChanges();
        }
      });
  }

  abrirModalHistorial(historial: any) {
    this.historialEditando = { ...historial };
    this.mostrarModalHistorial = true;
  }

  guardarHistorialEditado() {
    const id = this.historialEditando.id;
    this.http.put(`${this.API}/api/historial/${id}`, this.historialEditando)
      .subscribe({
        next: () => {
          alert('¡Historial Clínico actualizado exitosamente!');
          this.mostrarModalHistorial = false;
          this.realizarConsulta(); 
        },
        error: () => {
          this.http.put(`${this.API}/historial/${id}`, this.historialEditando).subscribe({
            next: () => {
              alert('¡Historial Clínico actualizado exitosamente!');
              this.mostrarModalHistorial = false;
              this.realizarConsulta();
            },
            error: (err) => alert('Error en el servidor al intentar modificar el historial.')
          });
        }
      });
  }

  eliminarHistorial(idHistorial: number) {
    if (confirm('⚠️ ¿Está seguro de eliminar este historial clínico?')) {
      this.http.delete(`${this.API}/api/historial/${idHistorial}`).subscribe({
        next: () => {
          alert('Historial clínico eliminado.');
          this.realizarConsulta();
        },
        error: () => {
          this.http.delete(`${this.API}/historial/${idHistorial}`).subscribe({
            next: () => {
              alert('Historial clínico eliminado.');
              this.realizarConsulta();
            },
            error: (err) => alert('No se pudo eliminar el historial.')
          });
        }
      });
    }
  }

abrirModalTratamiento(tratamiento: any) {
    console.log('📦 Datos del tratamiento recibidos al abrir modal:', tratamiento);
    
    // Forzamos la detección del ID por si viene mapeado con otro nombre desde el endpoint de consultas
    const idDetectado = tratamiento.id || tratamiento.id_tratamiento || tratamiento.id_reporte;

    this.tratamientoEditando = { 
      ...tratamiento,
      id: idDetectado, // Aseguramos que el ID exista sí o sí
      activar_alertas: treatmentFieldToBool(tratamiento.activar_alertas),
      notificar_incumplimiento: treatmentFieldToBool(tratamiento.notificar_incumplimiento),
      monitoreo_tiempo_real: treatmentFieldToBool(tratamiento.monitoreo_tiempo_real),
      alertar_familiar: treatmentFieldToBool(tratamiento.alertar_familiar)
    };
    this.mostrarModalTratamiento = true;
  }

guardarTratamientoEditado() {
    const id = this.tratamientoEditando.id;
    
    if (!id) {
      alert('⚠️ Error: No se encontró el ID del tratamiento a editar.');
      return;
    }

    // Estructuramos los datos idénticos a las columnas de tu MySQL
    const datosParaEnviar = {
      id: id,
      medicamento: this.tratamientoEditando.medicamento,
      dosis: this.tratamientoEditando.dosis,
      frecuencia: this.tratamientoEditando.frecuencia,
      via_administracion: this.tratamientoEditando.via_administracion || 'Oral',
      hora_inicio: this.tratamientoEditando.hora_inicio,
      duracion_dias: this.tratamientoEditando.duracion_dias,
      fecha_inicio: this.tratamientoEditando.fecha_inicio,
      fecha_final: this.tratamientoEditando.fecha_final,
      activar_alertas: this.tratamientoEditando.activar_alertas ? 1 : 0,
      notificar_incumplimiento: this.tratamientoEditando.notificar_incumplimiento ? 1 : 0,
      monitoreo_tiempo_real: this.tratamientoEditando.monitoreo_tiempo_real ? 1 : 0,
      alertar_familiar: this.tratamientoEditando.alertar_familiar ? 1 : 0
    };

    console.log('🚀 Enviando datos limpios a Flask:', datosParaEnviar);

    this.http.put(`${this.API}/api/tratamientos/${id}`, datosParaEnviar)
      .subscribe({
        next: () => {
          alert('¡Tratamiento médico actualizado!');
          this.mostrarModalTratamiento = false;
          this.realizarConsulta();
        },
        error: () => {
          // Intento por la ruta alternativa en caso de problemas de prefijo
          this.http.put(`${this.API}/tratamientos/${id}`, datosParaEnviar).subscribe({
            next: () => {
              alert('¡Tratamiento médico actualizado!');
              this.mostrarModalTratamiento = false;
              this.realizarConsulta();
            },
            error: (err) => {
              console.error('Error definitivo al guardar:', err);
              alert('Error al intentar modificar los datos en Flask.');
            }
          });
        }
      });
}

  eliminarTratamiento(idTratamiento: number) {
    if (confirm('❌ ¿Desea anular este tratamiento?')) {
      this.http.delete(`${this.API}/api/tratamientos/${idTratamiento}`).subscribe({
        next: () => {
          alert('El tratamiento ha sido removido.');
          this.realizarConsulta();
        },
        error: () => {
          this.http.delete(`${this.API}/tratamientos/${idTratamiento}`).subscribe({
            next: () => {
              alert('El tratamiento ha sido removido.');
              this.realizarConsulta();
            },
            error: (err) => alert('No se pudo procesar la eliminación.')
          });
        }
      });
    }
  }
}

function treatmentFieldToBool(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  return !!Number(value);
}
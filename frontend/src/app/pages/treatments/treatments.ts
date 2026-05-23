import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], 
  templateUrl: './treatments.html',
  styleUrl: './treatments.css'
})
export class Treatments implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuario: any = null;
  pacientes: any[] = [];

  // AQUÍ ALMACENAREMOS EL HISTORIAL CLÍNICO QUE JALAMOS DE LA BD
  ultimoHistorial: any = null;

  listaMedicamentos: any[] = [];

  tempMedicamento = {
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
    alertar_familiar: false
  };

  tratamiento = {
    paciente_id: '',
    observaciones: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarSesionYPacientes();
  }

  cargarSesionYPacientes() {
    const sesion = localStorage.getItem('usuario');
    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(sesion);
    const medicoId = this.usuario.id || this.usuario.id_usuario || this.usuario.id_medico || this.usuario.usuario_id;

    if (!medicoId) return;

    this.http.get<any[]>(`${this.API}/pacientes/${medicoId}`)
      .subscribe({
        next: (res) => {
          this.pacientes = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('❌ Error al cargar los pacientes:', err)
      });
  }

  // ESTA FUNCIÓN SE DISPARA CUANDO EL MEDICO SELECCIONA UN PACIENTE
  onPacienteChange() {
    if (!this.tratamiento.paciente_id) {
      this.ultimoHistorial = null;
      return;
    }

    const idPacienteNum = Number(this.tratamiento.paciente_id);
    console.log("🔄 Buscando historial clínico del paciente ID:", idPacienteNum);

    // Llamamos al backend para traer su historial guardado
    this.http.get<any>(`${this.API}/api/historial/ultimo/${idPacienteNum}`)
      .subscribe({
        next: (res) => {
          console.log("📥 Historial clínico encontrado:", res);
          this.ultimoHistorial = res; // Se guarda para mostrarlo en el HTML
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('⚠️ El paciente no tiene historial clínico previo registrado.');
          this.ultimoHistorial = null; // No muestra nada si no hay datos
          this.cdr.detectChanges();
        }
      });
  }

  agregarMedicamentoALaReceta() {
    if (!this.tempMedicamento.medicamento.trim() || !this.tempMedicamento.fecha_inicio) {
      alert('Por favor, ingrese el nombre del medicamento y la fecha de inicio.');
      return;
    }
    this.listaMedicamentos.push({ ...this.tempMedicamento });
    this.tempMedicamento = {
      medicamento: '', dosis: '', frecuencia: 'Cada 4 horas', via_administracion: 'Oral',
      hora_inicio: '', duracion_dias: '', fecha_inicio: '', fecha_final: '',
      activar_alertas: false, notificar_incumplimiento: false, monitoreo_tiempo_real: false, alertar_familiar: false
    };
    this.cdr.detectChanges();
  }

  eliminarMedicamentoDeReceta(index: number) {
    this.listaMedicamentos.splice(index, 1);
    this.cdr.detectChanges();
  }

  guardarTratamiento() {
    if (!this.tratamiento.paciente_id) {
      alert('Por favor, seleccione un paciente.');
      return;
    }
    if (this.listaMedicamentos.length === 0) {
      alert('Debe añadir al menos 1 medicamento a la receta.');
      return;
    }

    const medicoId = this.usuario.id || this.usuario.id_usuario || this.usuario.id_medico || this.usuario.usuario_id;
    const dataToSend = {
      medico_id: medicoId,
      paciente_id: Number(this.tratamiento.paciente_id),
      observaciones: this.tratamiento.observaciones,
      medicamentos: this.listaMedicamentos
    };

    this.http.post(`${this.API}/tratamientos`, dataToSend)
      .subscribe({
        next: (res: any) => {
          alert(res.mensaje || '¡Tratamiento guardado exitosamente!');
          this.limpiarFormulario();
        },
        error: (err) => alert('Hubo un error al guardar el tratamiento.')
      });
  }

  limpiarFormulario() {
    this.tratamiento = { paciente_id: '', observaciones: '' };
    this.listaMedicamentos = [];
    this.ultimoHistorial = null;
    this.cdr.detectChanges();
  }
}
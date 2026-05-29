import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-tratamiento',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './registrar-tratamiento.html',
  styleUrl: './registrar-treatment.css'
})
export class RegistrarTratamiento implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuarioLogueado: any = null;
  imagenPerfilUrl: string | null = null;
  cargandoBusqueda: boolean = false;
  cargandoGuardado: boolean = false;

  // 🌟 Variable de control interactivo para abrir/cerrar la tarjeta desplegable flotante
  mostrarTarjetaFarmaceutico: boolean = false;

  // Búsqueda de paciente
  buscarCI: string = '';
  pacienteSeleccionado: any = null;
  busquedaRealizada: boolean = false;

  // Carrito dinámico de medicamentos
  listaMedicamentos: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioLogueado = JSON.parse(user);
    
    // 📸 Resolver foto de perfil real
    this.procesarFotoPerfil();

    // Inicializar con un espacio de medicamento listo para llenar
    this.agregarMedicamentoFila();
  }

  // 🌟 Alterna visibilidad de la tarjeta modal del perfil flotante
  toggleTarjetaFarmaceutico() {
    this.mostrarTarjetaFarmaceutico = !this.mostrarTarjetaFarmaceutico;
    this.cdr.detectChanges();
  }

  // 🌟 Cierra el modal flotante de forma automática si se hace clic fuera del perfil
  @HostListener('document:click', ['$event'])
  cerrarTarjetaAlDarClicFuera(event: Event) {
    this.mostrarTarjetaFarmaceutico = false;
  }

  procesarFotoPerfil() {
    if (this.usuarioLogueado && this.usuarioLogueado.foto) {
      if (this.usuarioLogueado.foto.startsWith('http') || this.usuarioLogueado.foto.startsWith('data:')) {
        this.imagenPerfilUrl = this.usuarioLogueado.foto;
      } else {
        this.imagenPerfilUrl = `${this.API}/uploads/${this.usuarioLogueado.foto}`;
      }
    } else {
      this.imagenPerfilUrl = null;
    }
    this.cdr.detectChanges();
  }

  // 🔍 BUSCADOR DE PACIENTE POR CI
  buscarPaciente() {
    if (!this.buscarCI.trim()) {
      alert('Por favor, ingresa un número de carnet válido.');
      return;
    }

    this.cargandoBusqueda = true;
    this.busquedaRealizada = true;
    this.pacienteSeleccionado = null;

    this.http.get(`${this.API}/pacientes/buscar/${this.buscarCI}`)
      .subscribe({
        next: (res: any) => {
          this.pacienteSeleccionado = res;
          this.cargandoBusqueda = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.warn('Paciente no encontrado', err);
          this.pacienteSeleccionado = null;
          this.cargandoBusqueda = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ➕ AÑADIR NUEVA FILA DE MEDICAMENTO
  agregarMedicamentoFila() {
    this.listaMedicamentos.push({
      medicamento: '',
      dosis: '',
      frecuencia: 'Cada 8 horas',
      via_administracion: 'Oral',
      hora_inicio: '08:00',
      duracion_dias: 7,
      fecha_inicio: new Date().toISOString().substring(0, 10),
      activar_alertas: true,
      monitoreo_tiempo_real: true,
      observaciones: ''
    });
    this.cdr.detectChanges();
  }

  // ❌ QUITAR UN MEDICAMENTO DE LA LISTA
  removerMedicamentoFila(index: number) {
    if (this.listaMedicamentos.length > 1) {
      this.listaMedicamentos.splice(index, 1);
    } else {
      alert('Debes registrar al menos un medicamento para el tratamiento.');
    }
    this.cdr.detectChanges();
  }

  // 💾 ENVIAR TODA LA RECETA JUNTA A FLASK
  guardarTratamientoCompleto() {
    if (!this.pacienteSeleccionado) {
      alert('Primero debes buscar y seleccionar un paciente válido.');
      return;
    }

    // Validar que ninguna fila tenga el nombre del medicamento vacío
    for (let med of this.listaMedicamentos) {
      if (!med.medicamento.trim() || !med.dosis.trim()) {
        alert('Por favor, completa el nombre y la dosis de todos los medicamentos agregados.');
        return;
      }
    }

    this.cargandoGuardado = true;

    const payload = {
      paciente_id: this.pacienteSeleccionado.id,
      medico_id: this.usuarioLogueado.id, // ID del farmacéutico/médico que inició sesión
      receta: this.listaMedicamentos
    };

    console.log('📡 Enviando lote de medicamentos a la BD:', payload);

    this.http.post(`${this.API}/tratamientos/registrar-lote`, payload)
      .subscribe({
        next: (res: any) => {
          alert('🎉 ¡Tratamiento múltiple registrado con éxito! Sincronizado con la red IoT.');
          this.cargandoGuardado = false;
          this.limpiarPantalla();
          this.router.navigate(['/buscar-paciente']);
        },
        error: (err) => {
          console.error(err);
          alert('Error al guardar el tratamiento en el servidor.');
          this.cargandoGuardado = false;
          this.cdr.detectChanges();
        }
      });
  }

  limpiarPantalla() {
    this.buscarCI = '';
    this.pacienteSeleccionado = null;
    this.busquedaRealizada = false;
    this.listaMedicamentos = [];
    this.agregarMedicamentoFila();
    this.cdr.detectChanges();
  }
}
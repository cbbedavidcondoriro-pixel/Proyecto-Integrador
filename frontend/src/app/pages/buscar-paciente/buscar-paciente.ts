import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscar-paciente',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './buscar-paciente.html',
  styleUrl: './buscar-paciente.css'
})
export class BuscarPaciente implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuarioLogueado: any = null;
  imagenPerfilUrl: string | null = null;

  // 🌟 Variable interactiva para controlar la apertura de la tarjeta de perfil
  mostrarTarjetaFarmaceutico: boolean = false;

  buscarCI: string = '';
  pacienteEncontrado: any = null;
  busquedaRealizada: boolean = false;
  cargando: boolean = false;
  
  // 💊 Medicamentos reales traídos de la base de datos
  medicamentosPaciente: any[] = [];

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
    
    // 📸 Resolver ruta de la foto de perfil en tiempo real
    this.procesarFotoPerfil();
  }

  // 🌟 Abre y cierra el modal del perfil flotante absoluto
  toggleTarjetaFarmaceutico() {
    this.mostrarTarjetaFarmaceutico = !this.mostrarTarjetaFarmaceutico;
    this.cdr.detectChanges();
  }

  // 🌟 Listener global: si hace clic en cualquier otra sección, se cierra la tarjeta
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

  ejecutarBusqueda() {
    if (!this.buscarCI.trim()) {
      alert('Por favor, introduce un número de carnet válido.');
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;
    this.pacienteEncontrado = null;
    this.medicamentosPaciente = [];

    this.http.get(`${this.API}/pacientes/buscar/${this.buscarCI}`)
      .subscribe({
        next: (res: any) => {
          this.pacienteEncontrado = res;
          this.medicamentosPaciente = res.tratamientos || [];
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.warn('⚠️ Paciente no registrado o error de comunicación.', err);
          this.pacienteEncontrado = null;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  despacharMedicamento(idTratamiento: number) {
    alert('Despachando medicamento ID: ' + idTratamiento + '. Sincronizando con el pastillero IoT...');
  }

  limpiarFicha() {
    this.buscarCI = '';
    this.pacienteEncontrado = null;
    this.busquedaRealizada = false;
    this.medicamentosPaciente = [];
    this.cdr.detectChanges();
  }
}
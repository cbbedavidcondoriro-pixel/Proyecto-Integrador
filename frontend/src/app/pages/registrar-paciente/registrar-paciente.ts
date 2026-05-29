import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './registrar-paciente.html',
  styleUrl: './registrar-paciente.css'
})
export class RegistrarPaciente implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuarioLogueado: any = null;
  imagenPerfilUrl: string | null = null;
  cargando: boolean = false;

  // 🌟 Control de visualización para la tarjeta flotante del perfil del farmacéutico
  mostrarTarjetaFarmaceutico: boolean = false;

  // Modelo del formulario adaptado a tu SQL exacto
  paciente = {
    nombre: '',
    ci: '',
    edad: null,
    sexo: 'Masculino', 
    telefono: '',
    correo: '',
    direccion: '',
    emergencia: '',
    usuario: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Validar sesión del farmacéutico
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioLogueado = JSON.parse(user);
    
    // 📸 Resolver foto de perfil del operario logueado
    this.procesarFotoPerfil();
  }

  // 🌟 Conmutar visibilidad de la tarjeta informativa del farmacéutico
  toggleTarjetaFarmaceutico() {
    this.mostrarTarjetaFarmaceutico = !this.mostrarTarjetaFarmaceutico;
    this.cdr.detectChanges();
  }

  // 🌟 Listener para cerrar la tarjeta al hacer clic en cualquier sección externa
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

  guardarPaciente() {
    if (!this.paciente.nombre || !this.paciente.ci || !this.paciente.usuario || !this.paciente.password) {
      alert('Por favor, rellena los campos obligatorios (*).');
      return;
    }

    this.cargando = true;
    console.log('📡 Registrando nuevo paciente sin médico asignado:', this.paciente);

    this.http.post(`${this.API}/pacientes/registrar-farmacia`, this.paciente)
      .subscribe({
        next: (res: any) => {
          alert('🎉 Paciente registrado con éxito de forma global en el hospital.');
          this.cargando = false;
          this.limpiarFormulario();
          this.router.navigate(['/buscar-paciente']);
        },
        error: (err) => {
          console.error('❌ Error al registrar:', err);
          alert(err.error?.mensaje || 'Hubo un error al guardar el paciente. Verifica si el CI o Usuario ya existen.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  limpiarFormulario() {
    this.paciente = {
      nombre: '',
      ci: '',
      edad: null,
      sexo: 'Masculino',
      telefono: '',
      correo: '',
      direccion: '',
      emergencia: '',
      usuario: '',
      password: ''
    };
    this.cdr.detectChanges();
  }
}
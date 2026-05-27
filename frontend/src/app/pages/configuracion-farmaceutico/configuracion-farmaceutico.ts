import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion-farmaceutico',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './configuracion-farmaceutico.html',
  styleUrl: './configuracion-farmaceutico.css'
})
export class ConfiguracionFarmaceutico implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuarioLogueado: any = null;
  cargando: boolean = false;

  // Datos reales cargados de la BD
  farmaceutico: any = null;

  // Clon para el formulario (todo opcional)
  farmaceuticoEditado: any = {};

  // Estado de la interfaz
  modoEdicion: boolean = false;
  fotoSeleccionada: File | null = null;
  vistaPreviaFoto: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('usuario');
    if (user) {
      this.usuarioLogueado = JSON.parse(user);
      this.cargarDatosPerfil();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // 📡 CARGAR DATOS DESDE EL BACKEND
  cargarDatosPerfil() {
    this.http.get(`${this.API}/usuarios/perfil/${this.usuarioLogueado.id}`)
      .subscribe({
        next: (res: any) => {
          this.farmaceutico = res;
          this.farmaceuticoEditado = { ...res };
          
          // Si la foto es solo el nombre del archivo, construimos la ruta para mostrarla
          if (res.foto && !res.foto.startsWith('http') && !res.foto.startsWith('data:')) {
            this.vistaPreviaFoto = `${this.API}/uploads/${res.foto}`;
          } else {
            this.vistaPreviaFoto = res.foto || null;
          }
          
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener perfil:', err)
      });
  }

  activarEdicion() {
    this.modoEdicion = true;
    this.cdr.detectChanges();
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.farmaceuticoEditado = { ...this.farmaceutico };
    this.fotoSeleccionada = null;
    this.cargarDatosPerfil(); // Resetea la vista previa original
  }

  // 📸 SELECCIONAR ARCHIVO DE IMAGEN (Igual que el médico)
  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;

      // Mostrar previsualización en caliente en la pantalla
      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPreviaFoto = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // 💾 GUARDAR ACTUALIZACIÓN CON CAMPOS OPCIONALES
  actualizarPerfil() {
    this.cargando = true;

    // Enviamos un FormData idéntico al mecanismo del médico
    const formData = new FormData();
    formData.append('nombre', this.farmaceuticoEditado.nombre || '');
    formData.append('apellido', this.farmaceuticoEditado.apellido || '');
    formData.append('correo', this.farmaceuticoEditado.correo || '');
    formData.append('telefono', this.farmaceuticoEditado.telefono || '');
    formData.append('clinica', this.farmaceuticoEditado.clinica || '');
    formData.append('direccion', this.farmaceuticoEditado.direccion || '');
    
    // Si escribió una nueva contraseña, la añadimos, si no, viajará vacía
    formData.append('password', this.farmaceuticoEditado.password || '');

    if (this.fotoSeleccionada) {
      formData.append('foto', this.fotoSeleccionada);
    }

    this.http.put(`${this.API}/usuarios/actualizar-farmacia/${this.farmaceutico.id}`, formData)
      .subscribe({
        next: (res: any) => {
          alert(res.mensaje || '¡Perfil actualizado con éxito!');
          this.farmaceutico = res.usuario;
          
          // Actualizar sesión local
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          
          this.modoEdicion = false;
          this.fotoSeleccionada = null;
          this.cargando = false;
          
          this.cargarDatosPerfil();
        },
        error: (err) => {
          console.error(err);
          alert('No se pudieron guardar los cambios en el servidor.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
}
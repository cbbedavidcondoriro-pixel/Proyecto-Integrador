import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent implements OnInit {
  API = 'http://localhost:5000';
  idMedicoLogueado: number = 1;
  
  // Datos reales del médico
  medico: any = null;
  
  // Copia para el formulario de edición
  medicoEditado: any = {};
  
  // Control de interfaz
  modoEdicion: boolean = false;
  fotoSeleccionada: File | null = null;
  vistaPreviaFoto: string | null = null;

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
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.http.get<any>(`${this.API}/api/medico/${this.idMedicoLogueado}`)
      .subscribe({
        next: (data) => {
          this.medico = data;
          // Clonamos los datos para no alterar la vista de lectura mientras editamos
          this.medicoEditado = { ...data };
          this.vistaPreviaFoto = data.foto || null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar perfil del médico:', err);
        }
      });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.medicoEditado = { ...this.medico };
    this.vistaPreviaFoto = this.medico.foto || null;
    this.fotoSeleccionada = null;
  }

  // Captura la nueva foto cuando se selecciona en el input file
  onFotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
      
      // Crear una URL temporal para previsualizar la imagen en caliente
      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPreviaFoto = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    // Usamos FormData porque vamos a enviar un archivo físico (la foto)
    const formData = new FormData();
    formData.append('nombre', this.medicoEditado.nombre || '');
    formData.append('apellido', this.medicoEditado.apellido || '');
    formData.append('correo', this.medicoEditado.correo || '');
    formData.append('telefono', this.medicoEditado.telefono || '');
    formData.append('clinica', this.medicoEditado.clinica || '');
    formData.append('especialidad', this.medicoEditado.especialidad || '');
    formData.append('direccion', this.medicoEditado.direccion || '');
    
    if (this.fotoSeleccionada) {
      formData.append('foto', this.fotoSeleccionada);
    }

    this.http.post<any>(`${this.API}/api/medico/actualizar/${this.idMedicoLogueado}`, formData)
      .subscribe({
        next: (res) => {
          alert(res.mensaje || '¡Perfil actualizado correctamente!');
          this.medico = res.usuario;
          
          // 🔥 CRUCIAL: Actualizar el localStorage para que el menú de SmartMediIoT se refresque solo
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          
          this.modoEdicion = false;
          this.fotoSeleccionada = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al actualizar el perfil:', err);
          alert('No se pudieron guardar los cambios en el servidor.');
        }
      });
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 Agregamos ChangeDetectorRef para el renderizado instantáneo
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients implements OnInit {

  API = 'http://127.0.0.1:5000';

  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  terminoBusqueda: string = '';
  editando: boolean = false;
  idPacienteEditando: number | null = null;

  paciente = {
    nombre: '',
    ci: '',
    edad: '',
    sexo: 'Masculino',
    telefono: '',
    correo: '',
    direccion: '',
    emergencia: '',
    foto: '', 
    usuario: '',
    password: ''
  };

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 Inyectamos el detector de cambios
  ) {}

  ngOnInit() {
    // Usamos un pequeño delay de estabilidad al cambiar de pestaña
    setTimeout(() => {
      this.obtenerPacientes();
    }, 50);
  }

  obtenerPacientes() {
    const sesion = localStorage.getItem('usuario');
    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    const medico = JSON.parse(sesion);
    // Forzamos el ID de Saúl (1) si el objeto de sesión viene corrupto o vacío en el cambio de ruta
    const medicoId = medico.id || medico.id_usuario || 1; 

    console.log('Descargando lista completa de pacientes para el Médico ID:', medicoId);

    this.http.get<any[]>(`${this.API}/pacientes/${medicoId}`)
      .subscribe({
        next: (res) => {
          console.log('Pacientes recuperados de Flask exitosamente:', res);
          // Sincronizamos los arreglos que usa el *ngFor en tu HTML
          this.pacientes = res || [];
          this.pacientesFiltrados = res || [];
          
          // Forzamos a Angular a pintar la tabla en el primer clic de inmediato
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al descargar pacientes desde Flask:', err);
        }
      });
  }

  buscarPaciente() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.pacientesFiltrados = this.pacientes;
      return;
    }
    this.pacientesFiltrados = this.pacientes.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(termino)) || 
      (p.ci && p.ci.toString().includes(termino))
    );
  }

  cargarFotografia(event: any) {
    const archivo: File = event.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = () => {
        this.paciente.foto = lector.result as string;
      };
      lector.readAsDataURL(archivo);
    }
  }

  guardarPaciente() {
    const sesion = localStorage.getItem('usuario');
    let medicoId = 1; 

    if (sesion) {
      const medico = JSON.parse(sesion);
      medicoId = medico.id || medico.id_usuario || 1;
    }

    if (!this.paciente.nombre || !this.paciente.ci) {
      alert('Por favor, ingresa los campos obligatorios (Nombre y CI).');
      return;
    }

    const data = {
      medico_id: medicoId, 
      nombre: this.paciente.nombre,
      ci: this.paciente.ci,
      edad: this.paciente.edad,
      sexo: this.paciente.sexo,
      telefono: this.paciente.telefono,
      correo: this.paciente.correo,
      direccion: this.paciente.direccion,
      emergencia: this.paciente.emergencia,
      foto: this.paciente.foto, 
      usuario: this.paciente.usuario.trim() || this.paciente.correo.trim() || `paciente_${this.paciente.ci}`,
      password: this.paciente.password || this.paciente.ci
    };

    if (this.editando && this.idPacienteEditando) {
      this.http.put(`${this.API}/pacientes/${this.idPacienteEditando}`, data)
        .subscribe({
          next: (res: any) => {
            alert(res.mensaje || 'Paciente actualizado con éxito.');
            this.obtenerPacientes();
            this.limpiarFormulario();
          },
          error: (err) => console.error('Error al actualizar paciente:', err)
        });
    } else {
      this.http.post(`${this.API}/pacientes`, data)
        .subscribe({
          next: (res: any) => {
            alert(res.mensaje || '¡Paciente guardado exitosamente!');
            this.obtenerPacientes(); // Recarga la tabla de inmediato
            this.limpiarFormulario();
          },
          error: (err) => {
            console.error('Error de red al guardar:', err);
            alert('Error al registrar paciente.');
          }
        });
    }
  }

  seleccionarParaEditar(item: any) {
    this.editando = true;
    this.idPacienteEditando = item.id;
    this.paciente = {
      nombre: item.nombre || '',
      ci: item.ci || '',
      edad: item.edad || '',
      sexo: item.sexo || 'Masculino',
      telefono: item.telefono || '',
      correo: item.correo || '',
      direccion: item.direccion || '',
      emergencia: item.emergencia || '',
      foto: item.foto || '',
      usuario: item.usuario || '',
      password: '' // Se deja vacío por seguridad al editar
    };
    // Hace un scroll suave hacia arriba para que el médico vea el formulario lleno listo para editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarPaciente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente del sistema?')) {
      this.http.delete(`${this.API}/pacientes/${id}`)
        .subscribe({
          next: (res: any) => {
            alert(res.mensaje || 'Paciente eliminado correctamente.');
            this.obtenerPacientes(); // Actualiza la tabla automáticamente
          },
          error: (err) => console.error('Error al eliminar:', err)
        });
    }
  }

  limpiarFormulario() {
    this.editando = false;
    this.idPacienteEditando = null;
    this.paciente = {
      nombre: '',
      ci: '',
      edad: '',
      sexo: 'Masculino',
      telefono: '',
      correo: '',
      direccion: '',
      emergencia: '',
      foto: '',
      usuario: '',
      password: ''
    };
    const fileInputElement = document.getElementById('inputFotoElement') as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.value = '';
    }
    this.cdr.detectChanges();
  }

  logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 Agregamos ChangeDetectorRef
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, HttpClientModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuario: any = null;

  data = {
    pacientes: 0,
    tratamientos: 0,
    recordatorios: 0,
    dispositivos_iot: 0, 
    lista_pacientes: [] as any[] 
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 Inyectamos el detector de cambios
  ) {}

  ngOnInit() {
    // ⏳ Le damos 50ms al enrutador de Angular para inicializar la vista antes de leer la sesión
    setTimeout(() => {
      this.verificarYRefrescar();
    }, 50);
  }

  verificarYRefrescar() {
    const user = localStorage.getItem('usuario');

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(user);
    console.log('Dashboard revisando sesión activa:', this.usuario);

    // Extraer ID del médico de forma segura
    let medicoId = this.usuario.id || this.usuario.id_usuario;

    // Control de seguridad si los roles se cruzan en las rutas
    if (this.usuario.rol === 'paciente' || !medicoId) {
      console.warn('Sesión cruzada detectada. Forzando datos del Dr. Saúl.');
      medicoId = 1;
    }

    console.log('Consultando métricas reales para Médico ID:', medicoId);
    this.cargarDatosServidor(medicoId);
  }

  cargarDatosServidor(id: number) {
    this.http.get(`${this.API}/dashboard/${id}`)
      .subscribe({
        next: (res: any) => {
          console.log('Métricas recibidas de Flask:', res);
          
          // Asignamos las variables de forma segura
          this.data = {
            pacientes: res.pacientes !== undefined ? res.pacientes : 0,
            tratamientos: res.tratamientos !== undefined ? res.tratamientos : 0,
            recordatorios: res.recordatorios !== undefined ? res.recordatorios : 0,
            dispositivos_iot: res.pacientes !== undefined ? res.pacientes : 0, 
            lista_pacientes: res.lista_pacientes || []
          };

          // 🚀 ¡La magia! Forzamos a Angular a pintar los datos en la pantalla DE INMEDIATO
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error de comunicación con Flask /dashboard:', err);
        }
      });
  }

  logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
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
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    // ⏳ Le damos 100ms al enrutador de Angular para inicializar la vista antes de leer la sesión
    setTimeout(() => {
      this.verificarYRefrescar();
    }, 100);
  }

  verificarYRefrescar() {
    const user = localStorage.getItem('usuario');

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(user);
    console.log('👤 [DEBUG Dashboard] Sesión activa:', this.usuario);

    // Extraer ID del médico usando todas las propiedades posibles de manera limpia sin forzar a ID 1
    let medicoId = this.usuario.id || this.usuario.id_usuario || this.usuario.id_medico || this.usuario.usuario_id;

    console.log('🆔 [DEBUG Dashboard] Consultando métricas para Médico ID:', medicoId);

    if (!medicoId) {
      console.error('❌ No se encontró un ID de médico válido en la sesión actual.');
      return;
    }

    this.cargarDatosServidor(medicoId);
  }

  cargarDatosServidor(id: number) {
    this.http.get(`${this.API}/dashboard/${id}`)
      .subscribe({
        next: (res: any) => {
          console.log('📥 [DEBUG Dashboard] Métricas recibidas:', res);
          
          // Asignamos las variables de forma segura
          this.data = {
            pacientes: res.pacientes !== undefined ? res.pacientes : 0,
            tratamientos: res.tratamientos !== undefined ? res.tratamientos : 0,
            recordatorios: res.recordatorios !== undefined ? res.recordatorios : 0,
            dispositivos_iot: res.dispositivos_iot !== undefined ? res.dispositivos_iot : 0, 
            lista_pacientes: res.lista_pacientes || []
          };

          // Forzamos el repintado en la interfaz de usuario
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('❌ Error de comunicación con Flask /dashboard:', err);
        }
      });
  }

  logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}
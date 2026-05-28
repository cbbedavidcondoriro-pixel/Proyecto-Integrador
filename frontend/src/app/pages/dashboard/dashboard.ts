import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  API = 'http://127.0.0.1:5000';
  usuario: any = null;
  
  // Control de interfaz profesional
  mostrarTarjetaDoctor: boolean = false;
  vistaActual: string = 'dashboard'; // Cambia según la sección activa (dashboard, configuracion, etc.)

  data = {
    pacientes: 0,
    tratamientos: 0,
    historiales: 0,
    dispositivos_iot: 0, 
    lista_pacientes: [] as any[],
    grafica_genero: { hombres: 0, mujeres: 0 },
    alertas_iot: [] as any[]
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
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
    console.log('👤 [DEBUG] Sesión activa del médico:', this.usuario);

    let medicoId = this.usuario.id || this.usuario.id_usuario || this.usuario.id_medico || this.usuario.usuario_id;

    if (!medicoId) {
      console.error('❌ No se encontró un ID de médico válido.');
      return;
    }

    this.cargarDatosServidor(medicoId);
  }

  cargarDatosServidor(id: number) {
    this.http.get(`${this.API}/dashboard/${id}`)
      .subscribe({
        next: (res: any) => {
          const pacientesLista = res.lista_pacientes || [];
          const alertasSimuladas = [];
          
          if (pacientesLista.length > 0) {
            alertasSimuladas.push({
              paciente: pacientesLista[0].nombre,
              mensaje: 'Monitoreo de Pulso IoT Sincronizado',
              tipo: 'success',
              hora: 'Hace 5 min'
            });
          }

          this.data = {
            pacientes: res.pacientes || 0,
            tratamientos: res.tratamientos || 0,
            historiales: res.historiales || 0,
            dispositivos_iot: res.dispositivos_iot || 0,
            lista_pacientes: pacientesLista,
            grafica_genero: res.grafica_genero || { hombres: 0, mujeres: 0 },
            alertas_iot: alertasSimuladas
          };

          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('❌ Error cargando métricas reales:', err);
        }
      });
  }

  /**
   * Calcula dinámicamente la altura de la barra en base al valor máximo de datos
   * para que la visualización siempre sea proporcional.
   */
  obtenerPorcentajeBarra(valorActual: number): number {
    const valorMaximo = Math.max(this.data.pacientes, this.data.tratamientos, this.data.historiales);
    if (valorMaximo === 0) return 10; // Altura mínima por defecto si todo es 0
    return (valorActual / valorMaximo) * 100;
  }

  toggleTarjetaDoctor() {
    this.mostrarTarjetaDoctor = !this.mostrarTarjetaDoctor;
  }

  cambiarVista(vista: string) {
    this.vistaActual = vista;
    if (vista === 'configuracion') {
      this.mostrarTarjetaDoctor = false;
    }
  }

  logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}
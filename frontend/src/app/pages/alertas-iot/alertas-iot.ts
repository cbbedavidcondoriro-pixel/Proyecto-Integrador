import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas-iot',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './alertas-iot.html',
  styleUrl: './alertas-iot.css'
})
export class AlertasIot implements OnInit {

  API = 'http://localhost:5000'; // Tu Endpoint real de Flask
  medicoData: any = null;
  avatarRealUrl: string | null = null;
  
  mostrarCard: boolean = false;
  cargandoAlertas: boolean = true;
  listaAlertas: any[] = []; // Corregido: Variable unificada y limpia

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener los datos reales del médico logueado
    const sesionUsuario = localStorage.getItem('usuario');
    if (!sesionUsuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.medicoData = JSON.parse(sesionUsuario);
    
    this.resolverAvatarMedico();
    this.obtenerAlertasIotDesdeBaseDatos();
  }

  toggleCardMedico() {
    this.mostrarCard = !this.mostrarCard;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  cerrarFlotanteAlDarClicFuera(event: Event) {
    this.mostrarCard = false;
  }

  resolverAvatarMedico() {
    if (this.medicoData && this.medicoData.foto) {
      if (this.medicoData.foto.startsWith('http') || this.medicoData.foto.startsWith('data:')) {
        this.avatarRealUrl = this.medicoData.foto;
      } else {
        this.avatarRealUrl = `${this.API}/uploads/${this.medicoData.foto}`;
      }
    } else {
      this.avatarRealUrl = null;
    }
    this.cdr.detectChanges();
  }

  obtenerAlertasIotDesdeBaseDatos() {
    this.cargandoAlertas = true;
    const idMedico = this.medicoData.id || this.medicoData.id_usuario || 1;
    
    this.http.get(`${this.API}/api/alertas/medico/${idMedico}`)
      .subscribe({
        next: (respuesta: any) => {
          this.listaAlertas = respuesta.alertas || respuesta || [];
          this.cargandoAlertas = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.warn('⚠️ No se pudo conectar con el backend, usando fallback estático:', error);
          this.listaAlertas = [
            { 
              id: 101, 
              tipo_alerta: 'Omisión de Toma', 
              fecha_registro: new Date(), 
              paciente_nombre: 'Carlos Mendoza Ramos', 
              paciente_ci: '4823112 LP', 
              medicamento: 'Metformina 850mg', 
              dosis: '1 Tableta', 
              frecuencia: 'Cada 12 Horas', 
              mensaje_bitacora: 'El compartimento N° 1 no registró apertura mecánica a la hora programada (08:00 AM).' 
            },
            { 
              id: 102, 
              tipo_alerta: 'Toma Confirmada', 
              fecha_registro: new Date(), 
              paciente_nombre: 'Elena Rost Flores', 
              paciente_ci: '3940221 CB', 
              medicamento: 'Losartán 50mg', 
              dosis: '1/2 Tableta', 
              frecuencia: 'Cada 24 Horas', 
              mensaje_bitacora: 'Sensor de presencia detectó la extracción física de la cápsula a las 07:45 AM.' 
            }
          ];
          this.cargandoAlertas = false;
          this.cdr.detectChanges();
        }
      });
  }

  filtrarPorTipo(tipo: string): number {
    return this.listaAlertas.filter((a: any) => a.tipo_alerta === tipo).length;
  }

  revisarAlerta(id: number) {
    if (confirm('¿Desea archivar y registrar esta alerta como revisada en la bitácora médica?')) {
      this.http.post(`${this.API}/api/alertas/gestionar/${id}`, {})
        .subscribe({
          next: () => {
            alert('Alerta gestionada correctamente.');
            this.obtenerAlertasIotDesdeBaseDatos();
          },
          error: () => {
            // Remoción fluida local corregida sin el espacio roto 'de lasAlertas'
            this.listaAlertas = this.listaAlertas.filter((a: any) => a.id !== id);
            this.cdr.detectChanges();
          }
        });
    }
  }
}
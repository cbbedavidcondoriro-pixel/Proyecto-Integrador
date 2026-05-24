import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-farmaceutico',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-farmaceutico.html',
  styleUrl: './dashboard-farmaceutico.css'
})
export class DashboardFarmaceutico implements OnInit {

  usuario: any = null;

  // 📊 Métricas de Control Global de la Farmacia
  metrics = {
    recetas_despachadas_mes: 1240,
    recetas_pendientes_hoy: 8,
    alertas_criticas_iot: 3,
    nivel_stock_global: '94%'
  };

  // 📦 Medicamentos en Alerta de Stock Mínimo
  alertas_stock = [
    { medicamento: 'Losartán 50mg', lote: 'LT-8821', stock_actual: 12, estado: 'Crítico' },
    { medicamento: 'Metformina 850mg', lote: 'LT-4019', stock_actual: 45, estado: 'Bajo' },
    { medicamento: 'Amoxicilina 500mg', lote: 'LT-1102', stock_actual: 8, estado: 'Crítico' }
  ];

  // 📉 Flujo Semanal de Despachos (Para el gráfico visual)
  despachos_semana = [
    { dia: 'Lun', cantidad: 45 },
    { dia: 'Mar', cantidad: 62 },
    { dia: 'Mié', cantidad: 55 },
    { dia: 'Jue', cantidad: 78 },
    { dia: 'Vie', cantidad: 90 },
    { dia: 'Sáb', cantidad: 30 }
  ];

  // 🔔 Monitor en Tiempo Real de Nodos IoT (Pastilleros)
  logs_iot = [
    { hora: '20:45', nodo: 'Pastillero #04', evento: 'Alerta: Paciente omitió dosis de la noche.', tipo: 'danger' },
    { hora: '19:30', nodo: 'Pastillero #09', evento: 'Éxito: Medicamento dispensado correctamente.', tipo: 'success' },
    { hora: '18:15', nodo: 'Pastillero #02', evento: 'Conexión: Dispositivo IoT sincronizado con la nube.', tipo: 'info' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(user);
    console.log('💊 Dashboard Farmacia cargado para:', this.usuario.nombre);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
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

  buscarCI: string = '';
  pacienteEncontrado: any = null;
  busquedaRealizada: boolean = false;
  cargando: boolean = false;
  
  // 💊 Aquí se guardarán los medicamentos reales traídos de la base de datos
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
          // Guardamos los datos demográficos del paciente
          this.pacienteEncontrado = res;
          
          // Mapeamos los tratamientos reales que vienen desde Flask
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

  // Función lista para cuando el farmacéutico presione el botón de entregar
  despacharMedicamento(idTratamiento: number) {
    alert('Despachando medicamento ID: ' + idTratamiento + '. Sincronizando con el pastillero IoT...');
    // Aquí haremos la petición POST para cambiar el estado a "Entregado" próximamente
  }

  limpiarFicha() {
    this.buscarCI = '';
    this.pacienteEncontrado = null;
    this.busquedaRealizada = false;
    this.medicamentosPaciente = [];
    this.cdr.detectChanges();
  }
}
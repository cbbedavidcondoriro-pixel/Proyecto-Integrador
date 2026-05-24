import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.css'
})
export class PatientsList implements OnInit {

  API = 'http://127.0.0.1:5000';

  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  terminoBusqueda: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
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
    const medicoId = medico.id || medico.id_usuario || medico.id_medico; 

    if (!medicoId) {
      console.error('❌ No se detectó un ID de médico en la sesión actual.');
      return;
    }

    this.http.get<any[]>(`${this.API}/pacientes/${medicoId}`)
      .subscribe({
        next: (res) => {
          this.pacientes = res || [];
          this.pacientesFiltrados = res || [];
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

irARegistrar() {
    // 📁 CORREGIDO: Apunta a 'patients' en inglés, tal como está en tus rutas
    this.router.navigate(['/patients']); 
  }

seleccionarParaEditar(item: any) {
    // 💾 Guardamos los datos del paciente en el sessionStorage temporal
    sessionStorage.setItem('paciente_a_editar', JSON.stringify(item));
    
    // 📁 CORREGIDO: Redirección al formulario con la ruta exacta de app.routes.ts
    this.router.navigate(['/patients']); 
  }

  eliminarPaciente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente del sistema por completo?')) {
      this.http.delete(`${this.API}/pacientes/${id}`)
        .subscribe({
          next: (res: any) => {
            alert(res.mensaje || 'Paciente eliminado correctamente.');
            this.obtenerPacientes(); 
          },
          error: (err) => console.error('Error al eliminar:', err)
        });
    }
  }
}
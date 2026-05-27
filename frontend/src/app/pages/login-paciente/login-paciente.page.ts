import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-paciente',
  templateUrl: './login-paciente.page.html',
  styleUrls: ['./login-paciente.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class LoginPacientePage implements OnInit {

  API: string = 'http://localhost:5000'; // Base por defecto para la PC
  usuario: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    // 💡 TRUCO INTELIGENTE: Si entras desde la IP en tu celular, Angular cambiará automáticamente la API a la IP local
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      this.API = `http://${window.location.hostname}:5000`;
    }
  }

  ngOnInit(): void {}

  iniciarSesion(): void {
    if (!this.usuario || !this.password) {
      alert('Por favor, introduzca su usuario y contraseña del pastillero.');
      return;
    }

    this.cargando = true;

    const datos = {
      usuario: String(this.usuario).trim(),
      password: String(this.password).trim()
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log(`🚀 Intentando conectar al backend en: ${this.API}/api/paciente/login`);

    this.http.post(`${this.API}/api/paciente/login`, datos, { headers })
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          
          if (res.success) {
            alert(res.mensaje);
            // Guardamos la sesión en el LocalStorage del dispositivo (PC o celular)
            localStorage.setItem('paciente_sesion', JSON.stringify(res.paciente));
            // Redirección directa al dashboard del paciente
            this.router.navigate(['/dashboard-paciente']);
          } else {
            alert(res.mensaje);
          }
        },
        error: (err: any) => {
          this.cargando = false;
          console.error('Detalle completo del error de red:', err);
          alert('Error de enlace de red local. Verifique que Flask esté corriendo con host="0.0.0.0"');
        }
      });
  }
}
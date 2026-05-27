import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 🌟 REQUISITO CRUCIAL: Para que funcione el *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule], // 🌟 AQUÍ AGREGADO: CommonModule soluciona el error NG0303
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  API = 'http://127.0.0.1:5000';

  usuario = {
    usuario: '',
    password: ''
  };

  // 🌟 VARIABLE DE CONTROL: false = oculto (password), true = visible (text)
  mostrarPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    if (!this.usuario.usuario || !this.usuario.password) {
      alert('Completa todos los campos');
      return;
    }

    this.http.post(`${this.API}/login`, this.usuario)
      .subscribe((res: any) => {

        if (res.success) {
          alert('Bienvenido ' + res.usuario.usuario);

          localStorage.setItem('usuario', JSON.stringify(res.usuario));

          const rolUsuario = (res.usuario.rol || '').toLowerCase().trim();
          console.log('🔑 [DEBUG LOGIN] Rol detectado del usuario:', rolUsuario);

          if (rolUsuario === 'farmaceutico' || rolUsuario === 'farmacia') {
            console.log('✈️ Redirigiendo al Módulo de Farmacia Avanzado...');
            this.router.navigate(['/dashboard-farmaceutico']);
          } else {
            console.log('✈️ Redirigiendo al Panel Médico...');
            this.router.navigate(['/dashboard']);
          }

        } else {
          alert(res.mensaje);
        }

      }, error => {
        console.log('❌ Error en petición HTTP /login:', error);
        alert('Error de conexión con el servidor');
      });
  }
}
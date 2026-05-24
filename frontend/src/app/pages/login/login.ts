import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  API = 'http://127.0.0.1:5000';

  usuario = {
    usuario: '',
    password: ''
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    // Validación básica inicial
    if (!this.usuario.usuario || !this.usuario.password) {
      alert('Completa todos los campos');
      return;
    }

    this.http.post(`${this.API}/login`, this.usuario)
      .subscribe((res: any) => {

        if (res.success) {
          alert('Bienvenido ' + res.usuario.usuario);

          // 💾 Guardar sesión de manera persistente en formato JSON string
          localStorage.setItem('usuario', JSON.stringify(res.usuario));

          // 🔍 Extraemos el rol del objeto y lo normalizamos a minúsculas sin espacios
          const rolUsuario = (res.usuario.rol || '').toLowerCase().trim();
          console.log('🔑 [DEBUG LOGIN] Rol detectado del usuario:', rolUsuario);

          // 🧭 Redirección Condicional Inteligente
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
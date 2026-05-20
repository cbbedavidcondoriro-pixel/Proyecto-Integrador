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

    // validación básica
    if (!this.usuario.usuario || !this.usuario.password) {
      alert('Completa todos los campos');
      return;
    }

    this.http.post(`${this.API}/login`, this.usuario)
      .subscribe((res: any) => {

        if (res.success) {

          alert('Bienvenido ' + res.usuario.usuario);

          // guardar sesión
          localStorage.setItem('usuario', JSON.stringify(res.usuario));

          // redirigir al dashboard
          this.router.navigate(['/dashboard']);

        } else {

          alert(res.mensaje);

        }

      }, error => {

        console.log(error);
        alert('Error de conexión con el servidor');

      });

  }

}
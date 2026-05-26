import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-paciente',
  templateUrl: './login-paciente.page.html',
  styleUrls: ['./login-paciente.page.scss'], // O si es .css pon .css aquí
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule] // Solo módulos estándar web
})
export class LoginPacientePage implements OnInit {

  // Usamos la IP de tu PC para que el celular también pueda comunicarse con el Backend de Flask
  API = 'http://192.168.100.7:5000'; 
  usuario: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {}

  iniciarSesion() {
    if (!this.usuario.trim() || !this.password.trim()) {
      alert('Por favor, introduce tu usuario y contraseña del pastillero.');
      return;
    }

    this.cargando = true;

    const datos = {
      usuario: this.usuario,
      password: this.password
    };

    this.http.post(`${this.API}/api/paciente/login`, datos)
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          alert(res.mensaje);
          // Guardamos la sesión del paciente
          localStorage.setItem('paciente_sesion', JSON.stringify(res.paciente));
          
          // Por ahora puedes dejarlo comentando hasta crear la vista del pastillero real
          // this.router.navigate(['/dashboard-paciente']);
        },
        error: (err) => {
          this.cargando = false;
          alert(err.error?.mensaje || 'Error de conexión con el servidor.');
        }
      });
  }
}
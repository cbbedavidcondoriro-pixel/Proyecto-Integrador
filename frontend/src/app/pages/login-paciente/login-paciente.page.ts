import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonLoading } from '@ionic/framework/components';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-paciente',
  templateUrl: './login-paciente.page.html',
  styleUrls: ['./login-paciente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonLoading
  ]
})
export class LoginPacientePage implements OnInit {

  API = 'http://127.0.0.1:5000'; // Tu servidor Flask
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
          // Guardamos la sesión del paciente de forma local en el teléfono
          localStorage.setItem('paciente_sesion', JSON.stringify(res.paciente));
          // Redireccionamos a su pastillero inteligente
          this.router.navigate(['/dashboard-paciente']);
        },
        error: (err) => {
          this.cargando = false;
          alert(err.error?.mensaje || 'Error de conexión con el centro médico.');
        }
      });
  }
}
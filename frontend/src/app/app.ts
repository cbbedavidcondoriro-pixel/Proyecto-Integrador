import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class App implements OnInit { // 🌟 Tu clase original 'App' intacta
  
  isLoggedIn: boolean = false;
  esFarmaceutico: boolean = false;
  esPaciente: boolean = false; // 🌟 Bandera de control para aislar al paciente

  constructor(private router: Router) {}

  ngOnInit() {
    // Evaluar la ruta actual nada más arrancar la aplicación
    this.evaluarRutaYMenu(this.router.url);

    // Rastrear los cambios de ruta en tiempo real mientras navega
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.evaluarRutaYMenu(event.urlAfterRedirects || event.url);
    });
  }

  evaluarRutaYMenu(url: string) {
    // 🔒 SI ES RUTA PÚBLICA, DE PACIENTE O DE REGISTRO: Ocultamos totalmente la barra administrativa
    // 🌟 SE AÑADIÓ: url.includes('/register') para limpiar la pantalla de creación de cuentas
    if (url === '/' || url === '/inicio-paciente' || url.includes('/login-paciente') || url.includes('/dashboard-paciente') || url.includes('/register')) {
      this.esPaciente = true;   
      this.isLoggedIn = false;  // Al ser false, el *ngIf del <aside> no se activará
      return;
    }

    // 👨‍⚕️ SI ES RUTA DE MÉDICO O FARMACÉUTICO: Tu lógica original sigue operando intacta
    this.esPaciente = false;
    const user = localStorage.getItem('usuario'); // Lee el usuario guardado por el login de médicos/farmacia
    if (user) {
      this.isLoggedIn = true;
      const usuarioObj = JSON.parse(user);
      const rol = (usuarioObj.rol || '').toLowerCase().trim();
      
      // Activa el menú correspondiente para farmacia o médico
      this.esFarmaceutico = (rol === 'farmaceutico' || rol === 'farmacia');
      console.log(`[Sidebar Central] Rol detectado: ${rol} | ¿Es Farmacia?: ${this.esFarmaceutico}`);
    } else {
      this.isLoggedIn = false;
    }
  }

  logout() {
    // Tu función original de cierre de sesión
    localStorage.clear(); 
    this.isLoggedIn = false;
    this.esFarmaceutico = false;
    this.esPaciente = false;
    this.router.navigate(['/']);
  }
}
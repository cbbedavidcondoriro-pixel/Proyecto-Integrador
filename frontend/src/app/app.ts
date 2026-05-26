import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App { 
  isLoggedIn = false;
  esFarmaceutico = false; 
  esPaciente = false; // 👈 Nueva bandera inteligente para el paciente

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const urlActual = event.url;

      // 1. Ocultar el sidebar inmediatamente si está en las pantallas del paciente o accesos públicos
      if (
        urlActual === '/' || 
        urlActual === '/login' || 
        urlActual === '/register' || 
        urlActual === '/inicio-paciente' || 
        urlActual === '/login-paciente'
      ) {
        this.isLoggedIn = false;
        this.esFarmaceutico = false;
        this.esPaciente = urlActual.includes('paciente');
        return;
      }

      // 2. Si está en un panel interno, leemos las sesiones para estructurar el menú
      const user = localStorage.getItem('usuario');
      const pacienteSesion = localStorage.getItem('paciente_sesion');

      if (pacienteSesion) {
        // Si hay sesión de paciente, escondemos barra de médicos
        this.isLoggedIn = false;
        this.esFarmaceutico = false;
        this.esPaciente = true;
      } else if (user) {
        this.esPaciente = false;
        this.isLoggedIn = true;
        
        const usuarioObj = JSON.parse(user);
        const rol = (usuarioObj.rol || '').toLowerCase().trim();
        
        this.esFarmaceutico = (rol === 'farmaceutico' || rol === 'farmacia');
        console.log(`[Sidebar] Rol: ${rol} | ¿Es Farmacia?: ${this.esFarmaceutico}`);
      } else {
        this.isLoggedIn = false;
      }

    });
  }

  logout() {
    localStorage.clear(); 
    this.isLoggedIn = false;
    this.esFarmaceutico = false;
    this.esPaciente = false;
    this.router.navigate(['/']);
  }
}
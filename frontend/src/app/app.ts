import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html', /* 👈 Se mantiene tu archivo de plantilla */
  styleUrls: ['./app.css']
})
export class App { 
  isLoggedIn = false;
  esFarmaceutico = false; // 👈 Nuestra nueva bandera inteligente

  constructor(private router: Router) {
    // Detecta la ruta para ocultar el menú en el Home/Login y verificar el Rol
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      // 1. Lógica original: Si está en la raíz, login o registro, ocultamos el sidebar
      if (event.url === '/' || event.url === '/login' || event.url === '/register') {
        this.isLoggedIn = false;
        this.esFarmaceutico = false;
      } else {
        this.isLoggedIn = true;
        
        // 2. Nueva lógica: Leer el rol desde el localStorage para adaptar el menú
        const user = localStorage.getItem('usuario');
        if (user) {
          const usuarioObj = JSON.parse(user);
          const rol = (usuarioObj.rol || '').toLowerCase().trim();
          
          // Si el rol es farmaceutico o farmacia, activamos su menú especial
          this.esFarmaceutico = (rol === 'farmaceutico' || rol === 'farmacia');
          console.log(`[Sidebar Central] Rol detectado: ${rol} | ¿Es Farmacia?: ${this.esFarmaceutico}`);
        }
      }

    });
  }

  logout() {
    localStorage.clear(); // 👈 Limpiamos el localStorage para borrar los datos del usuario
    this.isLoggedIn = false;
    this.esFarmaceutico = false;
    this.router.navigate(['/']);
  }
}
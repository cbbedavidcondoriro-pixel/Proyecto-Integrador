import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html', /* 👈 Cambiado a ./app.html para que encuentre el archivo */
  styleUrls: ['./app.css']
})
export class App { /* 👈 Volvemos a llamarlo 'App' para que coincida con tu main.ts */
  isLoggedIn = false;

  constructor(private router: Router) {
    // Detecta la ruta para ocultar el menú en el Home/Login
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si está en la raíz (Landing/Home) o login, ocultamos el sidebar
      if (event.url === '/' || event.url === '/login' || event.url === '/register') {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
      }
    });
  }

  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
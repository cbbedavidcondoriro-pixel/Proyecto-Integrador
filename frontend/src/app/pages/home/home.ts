import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  // Variable para saber si el usuario bajó más de 300 píxeles en la pantalla
  estaScrolled: boolean = false;

  // 🌟 ESCUCHADOR DE SCROLL: Detecta en tiempo real la posición de la página
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollActual = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Si baja más de 300px, el indicador cambia a modo "Subir arriba" automáticamente
    this.estaScrolled = scrollActual > 300;
  }

  // 🌟 ACCIÓN DINÁMICA: Baja a la presentación o sube al tope quirúrgicamente
  ejecutarScrollAccion() {
    if (this.estaScrolled) {
      // Si está abajo, sube al inicio de la página de forma suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si está arriba, desplaza al usuario de forma automática hacia la sección intermedia
      const elementoDestino = document.getElementById('presentation-section');
      if (elementoDestino) {
        elementoDestino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
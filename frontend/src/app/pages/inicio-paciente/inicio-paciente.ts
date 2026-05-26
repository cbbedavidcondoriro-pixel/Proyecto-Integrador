import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio-paciente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-paciente.html',
  styleUrl: './inicio-paciente.css'
})
export class InicioPaciente {

  constructor(private router: Router) {}

  irAlLogin() {
    // Te redirige al login que ya creamos contigo
    this.router.navigate(['/login-paciente']);
  }
}
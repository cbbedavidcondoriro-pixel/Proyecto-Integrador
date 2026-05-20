import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  API = 'http://127.0.0.1:5000';

  usuario: any = null;

  data = {
    pacientes: 0,
    tratamientos: 0,
    recordatorios: 0
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {

    // 🔐 PROTEGER RUTA
    const user = localStorage.getItem('usuario');

    if (!user) {
      alert('Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(user);

    // 📊 CARGAR DATOS DESDE MYSQL (FLASK)
    this.http.get(`${this.API}/dashboard/1`)
      .subscribe((res: any) => {
        this.data = res;
      });
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
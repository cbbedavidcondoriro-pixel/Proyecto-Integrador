import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients implements OnInit {

  API = 'http://127.0.0.1:5000';

  pacientes: any[] = [];

  paciente = {
    nombre: '',
    ci: '',
    edad: '',
    sexo: '',
    telefono: '',
    correo: '',
    direccion: '',
    emergencia: '',

    // 🔐 login del paciente
    usuario: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerPacientes();
  }

  obtenerPacientes() {

    const medico = JSON.parse(localStorage.getItem('usuario') || '{}');

    this.http.get<any[]>(`${this.API}/pacientes/${medico.id}`)
      .subscribe((res) => {
        this.pacientes = res;
      });

  }

  guardarPaciente() {

    const medico = JSON.parse(localStorage.getItem('usuario') || '{}');

    const data = {
      medico_id: medico.id,

      nombre: this.paciente.nombre,
      ci: this.paciente.ci,
      edad: this.paciente.edad,
      sexo: this.paciente.sexo,
      telefono: this.paciente.telefono,
      correo: this.paciente.correo,
      direccion: this.paciente.direccion,
      emergencia: this.paciente.emergencia,

      // 🔐 acceso del paciente
      usuario: this.paciente.usuario || this.paciente.ci,
      password: this.paciente.password || '1234'
    };

    this.http.post(`${this.API}/pacientes`, data)
      .subscribe((res: any) => {

        alert(res.mensaje);

        this.obtenerPacientes();

        this.paciente = {
          nombre: '',
          ci: '',
          edad: '',
          sexo: '',
          telefono: '',
          correo: '',
          direccion: '',
          emergencia: '',
          usuario: '',
          password: ''
        };

      });

  }

}
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

@Component({

  selector: 'app-register',

  imports: [
    FormsModule
  ],

  templateUrl: './register.html',

  styleUrl: './register.css'

})

export class Register {

  API = 'http://127.0.0.1:5000';

  selectedFile:any;

  usuario = {

    nombre:'',
    apellido:'',
    usuario:'',
    correo:'',
    password:'',
    telefono:'',
    clinica:'',
    especialidad:'',
    direccion:'',
    rol:''

  }

  constructor(

    private http:HttpClient,
    private router:Router

  ){}

  seleccionarImagen(event:any){

    this.selectedFile = event.target.files[0];

  }

  registrar(){

    const formData = new FormData();

    formData.append(
      'foto',
      this.selectedFile
    );

    formData.append(
      'nombre',
      this.usuario.nombre
    );

    formData.append(
      'apellido',
      this.usuario.apellido
    );

    formData.append(
      'usuario',
      this.usuario.usuario
    );

    formData.append(
      'correo',
      this.usuario.correo
    );

    formData.append(
      'password',
      this.usuario.password
    );

    formData.append(
      'telefono',
      this.usuario.telefono
    );

    formData.append(
      'clinica',
      this.usuario.clinica
    );

    formData.append(
      'especialidad',
      this.usuario.especialidad
    );

    formData.append(
      'direccion',
      this.usuario.direccion
    );

    formData.append(
      'rol',
      this.usuario.rol
    );

    this.http.post(

      `${this.API}/register`,
      formData

    ).subscribe((res:any)=>{

      alert(res.mensaje);

      this.router.navigate(['/login']);

    })

  }

}
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename

import json
import os

app = Flask(__name__)


DATABASE = 'database/pacientes.json'

UPLOAD_FOLDER = 'static/uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


if not os.path.exists('database'):
    os.makedirs('database')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(DATABASE):

    with open(DATABASE, 'w') as f:
        json.dump([], f)

@app.route('/login')
def login():

    return render_template(
        'login.html'
    )

def obtener_pacientes():

    with open(DATABASE, 'r') as f:
        return json.load(f)

def guardar_pacientes(data):

    with open(DATABASE, 'w') as f:
        json.dump(data, f, indent=4)


@app.route('/')
def index():

    return render_template('index.html')


@app.route('/dashboard')
def dashboard():

    pacientes = obtener_pacientes()

    total_pacientes = len(pacientes)

    tratamientos = total_pacientes

    recordatorios = total_pacientes * 3

    return render_template(

        'dashboard_medico.html',

        total_pacientes=total_pacientes,
        tratamientos=tratamientos,
        recordatorios=recordatorios

    )


@app.route('/registrar', methods=['GET', 'POST'])
def registrar():

    # ABRIR FORMULARIO
    if request.method == 'GET':

        return render_template(
            'registrar_paciente.html'
        )

    # GUARDAR DATOS
    if request.method == 'POST':

        foto = request.files.get('foto')

        nombre_foto = ''

        if foto and foto.filename != '':

            nombre_foto = secure_filename(
                foto.filename
            )

            ruta = os.path.join(

                app.config['UPLOAD_FOLDER'],
                nombre_foto

            )

            foto.save(ruta)

        nuevo = {

            "nombre": request.form['nombre'],
            "ci": request.form['ci'],
            "edad": request.form['edad'],
            "sexo": request.form['sexo'],
            "fecha_nacimiento": request.form['fecha_nacimiento'],
            "telefono": request.form['telefono'],
            "correo": request.form['correo'],
            "direccion": request.form['direccion'],
            "emergencia": request.form['emergencia'],
            "telefono_emergencia": request.form['telefono_emergencia'],
            "foto": nombre_foto,

            "cumplimiento": "Excelente",
            "asistencias": 0

        }

        pacientes = obtener_pacientes()

        pacientes.append(nuevo)

        guardar_pacientes(pacientes)

        return redirect(url_for('consultar'))

@app.route('/consultar')
def consultar():

    pacientes = obtener_pacientes()

    return render_template(

        'consultar_paciente.html',
        pacientes=pacientes

    )


@app.route('/reportes')
def reportes():

    pacientes = obtener_pacientes()

    return render_template(

        'generar_receta.html',
        pacientes=pacientes

    )


@app.route('/tratamiento')
def tratamiento():

    pacientes = obtener_pacientes()

    return render_template(

        'configurar_tratamiento.html',
        pacientes=pacientes

    )


@app.route('/eliminar/<int:index>')
def eliminar(index):

    pacientes = obtener_pacientes()

    if index < len(pacientes):

        pacientes.pop(index)

        guardar_pacientes(pacientes)

    return redirect(
        url_for('consultar')
    )

@app.route('/receta')
def receta():

    pacientes = obtener_pacientes()

    return render_template(
        'generar_receta.html',
        pacientes=pacientes
    )


if __name__ == '__main__':

    app.run(

        debug=True,
        host='0.0.0.0',
        port=5000

    )
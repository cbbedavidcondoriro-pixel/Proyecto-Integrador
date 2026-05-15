from flask import Flask, render_template, request, redirect, url_for
import json
import os

app = Flask(__name__)

DATABASE = 'database/pacientes.json'

# Crear archivo si no existe
if not os.path.exists(DATABASE):
    with open(DATABASE, 'w') as f:
        json.dump([], f)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard_medico.html')

@app.route('/registrar', methods=['GET', 'POST'])
def registrar():

    if request.method == 'POST':

        nuevo = {

            "nombre": request.form['nombre'],
            "ci": request.form['ci'],
            "edad": request.form['edad'],
            "sexo": request.form['sexo'],
            "telefono": request.form['telefono'],
            "direccion": request.form['direccion'],
            "diagnostico": request.form['diagnostico'],
            "medicamento": request.form['medicamento'],
            "horario": request.form['horario']

        }

        with open(DATABASE, 'r') as f:
            pacientes = json.load(f)

        pacientes.append(nuevo)

        with open(DATABASE, 'w') as f:
            json.dump(pacientes, f, indent=4)

        return redirect('/pacientes')

    return render_template('registrar_paciente.html')


@app.route('/consultar')
def consultar():

    with open(DATABASE, 'r') as f:
        pacientes = json.load(f)

    return render_template(
        'consultar_paciente.html',
        pacientes=pacientes
    )


@app.route('/receta')
def receta():
    return render_template('generar_receta.html')


@app.route('/tratamiento')
def tratamiento():
    return render_template('configurar_tratamiento.html')


if __name__ == '__main__':
    app.run(debug=True)
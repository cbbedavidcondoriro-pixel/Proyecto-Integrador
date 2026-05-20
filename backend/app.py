from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

CORS(app)

UPLOAD_FOLDER = 'uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app)

# =========================
# CONEXIÓN MYSQL
# =========================

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="david0309",
    database="smartmedi"
)

cursor = db.cursor(dictionary=True)

@app.route('/login', methods=['POST'])

def login():

    data = request.json

    sql = """

        SELECT * FROM usuarios

        WHERE usuario=%s
        AND password=%s

    """

    valores = (

        data['usuario'],
        data['password']

    )

    cursor.execute(sql, valores)

    usuario = cursor.fetchone()

    if usuario:

        return jsonify({

            "success":True,
            "usuario":usuario

        })

    else:

        return jsonify({

            "success":False,
            "mensaje":"Credenciales incorrectas"

        })

@app.route('/register', methods=['POST'])

def register():

    foto = request.files['foto']

    nombre_foto = ''

    if foto:

        nombre_foto = secure_filename(foto.filename)

        ruta = os.path.join(

            app.config['UPLOAD_FOLDER'],
            nombre_foto

        )

        foto.save(ruta)

    nombre = request.form['nombre']

    apellido = request.form['apellido']

    usuario = request.form['usuario']

    correo = request.form['correo']

    password = request.form['password']

    telefono = request.form['telefono']

    clinica = request.form['clinica']

    especialidad = request.form['especialidad']

    direccion = request.form['direccion']

    rol = request.form['rol']

    sql = """

        INSERT INTO usuarios(

            foto,
            nombre,
            apellido,
            usuario,
            correo,
            password,
            telefono,
            clinica,
            especialidad,
            direccion,
            rol

        )

        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)

    """

    valores = (

        nombre_foto,
        nombre,
        apellido,
        usuario,
        correo,
        password,
        telefono,
        clinica,
        especialidad,
        direccion,
        rol

    )

    cursor.execute(sql, valores)

    db.commit()

    return jsonify({

        "mensaje":"Usuario registrado correctamente"

    })
    
@app.route('/dashboard/<usuario_id>', methods=['GET'])
def dashboard(usuario_id):

    cursor = mysql.connection.cursor()

    # total pacientes
    cursor.execute("SELECT COUNT(*) FROM pacientes")
    pacientes = cursor.fetchone()[0]

    # total tratamientos
    cursor.execute("SELECT COUNT(*) FROM tratamientos")
    tratamientos = cursor.fetchone()[0]

    # total recordatorios
    cursor.execute("SELECT COUNT(*) FROM recordatorios")
    recordatorios = cursor.fetchone()[0]

    return jsonify({
        "pacientes": pacientes,
        "tratamientos": tratamientos,
        "recordatorios": recordatorios
    })

@app.route('/')

def home():

    return jsonify({
        "mensaje": "API SmartMediIoT funcionando"
    })

# =========================
# REGISTRAR PACIENTE
# =========================

@app.route('/pacientes', methods=['POST'])
def registrar_paciente():

    data = request.json

    cursor = db.cursor()

    # 🔐 1. CREAR USUARIO DEL PACIENTE (LOGIN)
    cursor.execute("""
        INSERT INTO usuarios(usuario, password, rol)
        VALUES(%s,%s,'paciente')
    """, (
        data['usuario'],
        data['password']
    ))

    usuario_id = cursor.lastrowid

    # 🧑‍⚕️ 2. CREAR PACIENTE (FICHA MÉDICA)
    sql = """
        INSERT INTO pacientes(
            usuario_id,
            medico_id,
            nombre,
            ci,
            edad,
            sexo,
            telefono,
            correo,
            direccion,
            emergencia
        )
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    valores = (
        usuario_id,
        data['medico_id'],
        data['nombre'],
        data['ci'],
        data['edad'],
        data['sexo'],
        data['telefono'],
        data['correo'],
        data['direccion'],
        data['emergencia']
    )

    cursor.execute(sql, valores)

    db.commit()

    return jsonify({
        "success": True,
        "mensaje": "Paciente registrado con acceso al sistema"
    })
# =========================
# LISTAR PACIENTES
# =========================

@app.route('/pacientes/<int:medico_id>', methods=['GET'])
def listar_pacientes(medico_id):

    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM pacientes
        WHERE medico_id = %s
    """, (medico_id,))

    pacientes = cursor.fetchall()

    return jsonify(pacientes)

if __name__ == '__main__':

    app.run(
        debug=True,
        port=5000
    )
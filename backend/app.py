from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# CONFIGURACIÓN DE CORS ÚNICA Y ROBUSTA (Para que Angular puerto 4200 no se bloquee)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Asegurar que la carpeta de subidas exista de forma física
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# =========================
# CONEXIÓN MYSQL
# =========================
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="david0309",
    database="smartmedi"
)

# =========================
# HOME DE CONTROL
# =========================
@app.route('/')
def home():
    return jsonify({
        "mensaje": "API SmartMediIoT funcionando"
    })

# =========================
# LOGIN DE USUARIOS
# =========================
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    # Creamos el cursor de forma local dentro de la función
    cursor = db.cursor(dictionary=True)
    
    sql = """
        SELECT * FROM usuarios
        WHERE usuario=%s
        AND password=%s
    """
    valores = (
        data['usuario'],
        data['password']
    )
    
    try:
        cursor.execute(sql, valores)
        usuario = cursor.fetchone()
        
        if usuario:
            return jsonify({
                "success": True,
                "usuario": usuario
            })
        else:
            return jsonify({
                "success": False,
                "mensaje": "Credenciales incorrectas"
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close() # Cerramos el cursor local de forma segura

# =========================
# REGISTRO DE MÉDICOS
# =========================
@app.route('/register', methods=['POST'])
def register():
    cursor = db.cursor()
    
    foto = request.files.get('foto')
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
            foto, nombre, apellido, usuario, correo, 
            password, telefono, clinica, especialidad, direccion, rol
        )
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    valores = (
        nombre_foto, nombre, apellido, usuario, correo,
        password, telefono, clinica, especialidad, direccion, rol
    )

    try:
        cursor.execute(sql, valores)
        db.commit()
        return jsonify({
            "mensaje": "Usuario registrado correctamente"
        })
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

# =========================
# DATA DEL DASHBOARD 
# =========================
@app.route('/dashboard/<int:usuario_id>', methods=['GET'])
def dashboard(usuario_id):
    cursor = db.cursor(dictionary=True)

    try:
        # Contar ÚNICAMENTE los pacientes que pertenecen de forma estricta a este médico
        cursor.execute("SELECT COUNT(*) as total FROM pacientes WHERE medico_id = %s", (usuario_id,))
        pacientes = cursor.fetchone()['total']

        # Contar tratamientos activos generales
        try:
            cursor.execute("SELECT COUNT(*) as total FROM tratamientos")
            tratamientos = cursor.fetchone()['total']
        except Exception:
            tratamientos = 0  

        # Contar recordatorios emitidos generales
        try:
            cursor.execute("SELECT COUNT(*) as total FROM recordatorios")
            recordatorios = cursor.fetchone()['total']
        except Exception:
            recordatorios = 0  

        # Obtener la lista de los últimos 5 pacientes registrados por este médico específico
        try:
            cursor.execute("""
                SELECT id, nombre, ci, edad 
                FROM pacientes 
                WHERE medico_id = %s 
                ORDER BY id DESC 
                LIMIT 5
            """, (usuario_id,))
            lista_pacientes = cursor.fetchall()
        except Exception as e:
            print("Error al obtener la lista de pacientes:", str(e))
            lista_pacientes = []

        # Métrica IoT proporcional a sus pacientes asignados
        dispositivos_iot = pacientes 

        return jsonify({
            "pacientes": pacientes,
            "tratamientos": tratamientos,
            "recordatorios": recordatorios,
            "dispositivos_iot": dispositivos_iot,
            "lista_pacientes": lista_pacientes
        })

    except Exception as e:
        print("Error en dashboard:", str(e))
        return jsonify({
            "pacientes": 0, "tratamientos": 0, "recordatorios": 0, "dispositivos_iot": 0,
            "lista_pacientes": [], "error": str(e)
        }), 500
    finally:
        cursor.close()


@app.route('/pacientes', methods=['POST'])
def registrar_paciente():
    data = request.get_json() or request.json
    cursor = db.cursor(dictionary=True)

    try:
        # Generar un usuario y password por defecto usando su CI si Angular no los envía
        ci_paciente = data.get('ci', '12345')
        username = data.get('usuario', f"user_{ci_paciente}")
        password = data.get('password', ci_paciente)

        # 🔐 Paso A: Crear de manera obligatoria su registro en la tabla de usuarios
        cursor.execute("""
            INSERT INTO usuarios (usuario, password, rol)
            VALUES (%s, %s, 'paciente')
        """, (username, password))
        
        usuario_id = cursor.lastrowid # Obtenemos el ID autogenerado para enlazarlo

        # 🧑‍⚕️ Paso B: Capturar y validar el ID del médico logueado
        medico_id = data.get('medico_id')
        if medico_id is None or medico_id == 0 or medico_id == "":
            medico_id = 1 # Por seguridad, si falla, se le asigna al Dr. Saúl (ID 1)

        # 📋 Paso C: Insertar los datos del paciente en la tabla con sus relaciones correctas
        sql = """
            INSERT INTO pacientes (
                usuario_id, medico_id, nombre, ci, edad, 
                sexo, telefono, correo, direccion, emergencia, foto
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            usuario_id,
            medico_id,
            data.get('nombre'),
            data.get('ci'),
            data.get('edad'),
            data.get('sexo', 'Masculino'),
            data.get('telefono', ''),
            data.get('correo', ''),
            data.get('direccion', ''),
            data.get('emergencia', ''),
            data.get('foto', '')
        )

        cursor.execute(sql, valores)
        db.commit()
        
        return jsonify({
            "success": True, 
            "mensaje": "¡Paciente registrado con éxito!", 
            "medico_id": medico_id,
            "usuario_id": usuario_id
        }), 201

    except Exception as e:
        db.rollback()
        print("Error crítico al registrar paciente en el Backend:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()


# =====================================================================
# 2. LISTAR PACIENTES EXCLUSIVOS DEL MÉDICO
# =====================================================================
@app.route('/pacientes/<int:medico_id>', methods=['GET'])
def listar_pacientes(medico_id):
    cursor = db.cursor(dictionary=True)
    try:
        # Trae de la base de datos únicamente los pacientes que pertenecen a este médico
        cursor.execute("""
            SELECT id, usuario_id, medico_id, nombre, ci, edad, sexo, telefono, correo, direccion, emergencia, foto 
            FROM pacientes 
            WHERE medico_id = %s
        """, (medico_id,))
        pacientes = cursor.fetchall()
        return jsonify(pacientes), 200
    except Exception as e:
        print("Error al listar pacientes:", str(e))
        return jsonify([]), 500
    finally:
        cursor.close()


# =====================================================================
# 3. 🔄 EDITAR PACIENTE
# =====================================================================
@app.route('/pacientes/<int:id>', methods=['PUT'])
def editar_paciente(id):
    data = request.get_json() or request.json
    cursor = db.cursor()

    sql = """
        UPDATE pacientes 
        SET nombre=%s, ci=%s, edad=%s, sexo=%s, telefono=%s, 
            correo=%s, direccion=%s, emergencia=%s, foto=%s
        WHERE id=%s
    """
    valores = (
        data.get('nombre'), data.get('ci'), data.get('edad'), data.get('sexo'), data.get('telefono'),
        data.get('correo'), data.get('direccion'), data.get('emergencia'), data.get('foto', ''), id
    )

    try:
        cursor.execute(sql, valores)
        db.commit()
        return jsonify({"success": True, "mensaje": "Paciente actualizado correctamente"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()


# =====================================================================
# 4. 🗑️ ELIMINAR PACIENTE Y SU USUARIO ASOCIADO
# =====================================================================
@app.route('/pacientes/<int:id>', methods=['DELETE'])
def eliminar_paciente(id):
    cursor = db.cursor()
    try:
        # Primero buscamos cuál es su usuario_id para no dejar datos huérfanos
        cursor.execute("SELECT usuario_id FROM pacientes WHERE id = %s", (id,))
        res = cursor.fetchone()
        
        # Eliminamos de la tabla pacientes
        cursor.execute("DELETE FROM pacientes WHERE id = %s", (id,))
        
        # Si tenía un usuario asignado en el sistema, también lo borramos
        if res and res[0]:
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (res[0],))

        db.commit()
        return jsonify({"success": True, "mensaje": "Paciente borrado del sistema por completo"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()

# =====================================================================
# ENDPOINTS PARA LA GESTIÓN DE TRATAMIENTOS INTELIGENTES
# =====================================================================

@app.route('/tratamientos', methods=['POST'])
def guardar_tratamiento():
    try:
        data = request.json
        print("Datos de tratamiento recibidos:", data)
        
        # Extraer variables enviadas desde Angular
        medico_id = data.get('medico_id')
        paciente_id = data.get('paciente_id')
        medicamento = data.get('medicamento')
        dosis = data.get('dosis')
        frecuencia = data.get('frecuencia')
        via_administracion = data.get('via_administracion')
        hora_inicio = data.get('hora_inicio') or None
        duracion_dias = data.get('duracion_dias') or None
        fecha_inicio = data.get('fecha_inicio') or None
        fecha_final = data.get('fecha_final') or None
        
        # Checkboxes (vienen como True/False de Angular, los guardamos como 1 o 0 para MySQL)
        activar_alertas = 1 if data.get('activar_alertas') else 0
        notificar_incumplimiento = 1 if data.get('notificar_incumplimiento') else 0
        monitoreo_tiempo_real = 1 if data.get('monitoreo_tiempo_real') else 0
        alertar_familiar = 1 if data.get('alertar_familiar') else 0
        observaciones = data.get('observaciones', '')

        cur = mysql.connection.cursor()
        
        # Query para insertar el tratamiento médico en la base de datos
        query = """
            INSERT INTO tratamientos (
                medico_id, paciente_id, medicamento, dosis, frecuencia, 
                via_administracion, hora_inicio, duracion_dias, 
                fecha_inicio, fecha_final, activar_alertas, 
                notificar_incumplimiento, monitoreo_tiempo_real, 
                alertar_familiar, observaciones
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        valores = (
            medico_id, paciente_id, medicamento, dosis, frecuencia,
            via_administracion, hora_inicio, duracion_dias,
            fecha_inicio, fecha_final, activar_alertas,
            notificar_incumplimiento, monitoreo_tiempo_real,
            alertar_familiar, observaciones
        )
        
        cur.execute(query, valores)
        mysql.connection.commit()
        cur.close()
        
        return jsonify({"mensaje": "¡Tratamiento médico e IoT registrado de manera exitosa!"}), 201

    except Exception as e:
        print("Error crítico al guardar tratamiento:", str(e))
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500


@app.route('/tratamientos/<int:medico_id>', methods=['GET'])
def obtener_tratamientos_medico(medico_id):
    try:
        cur = mysql.connection.cursor()
        
        # Hacemos un INNER JOIN con la tabla pacientes para poder mostrar el NOMBRE del paciente en la tabla
        query = """
            SELECT 
                t.id, 
                t.medicamento, 
                t.dosis, 
                t.frecuencia, 
                t.duracion_dias,
                p.nombre AS paciente_nombre
            FROM tratamientos t
            INNER JOIN pacientes p ON t.paciente_id = p.id
            WHERE t.medico_id = %s
            ORDER BY t.id DESC
        """
        
        cur.execute(query, (medico_id,))
        columnas = [col[0] for col in cur.description]
        resultados = [dict(zip(columnas, fila)) for fila in cur.fetchall()]
        cur.close()
        
        return jsonify(resultados), 200

    except Exception as e:
        print("Error al consultar tratamientos de la BD:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/reportes/paciente/<int:id_paciente>', methods=['GET'])
def obtener_reportes_por_paciente(id_paciente):
    id_medico = request.args.get('id_medico')
    
    if not id_medico:
        return jsonify({'error': 'El ID del médico es requerido para filtrar'}), 400
    
    try:
        # Reemplaza con tu función o lógica de conexión actual
        conexion = mysql.connector.connect(
            host="localhost", user="root", password="", database="tu_base_datos"
        )
        cursor = conexion.cursor(dictionary=True)
        
        # Consulta SQL estricta: Mismo paciente Y mismo médico
        query = """
            SELECT r.*, p.nombre AS nombre_paciente 
            FROM reportes r
            JOIN pacientes p ON r.id_paciente = p.id
            WHERE r.id_paciente = %s AND r.id_medico = %s
            ORDER BY r.fecha_generado DESC
        """
        cursor.execute(query, (id_paciente, id_medico))
        reportes = cursor.fetchall()
        
        cursor.close()
        conexion.close()
        
        return jsonify(reportes), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pacientes', methods=['GET'])
def obtener_pacientes_del_medico():
    # Detectamos qué médico está pidiendo su lista de pacientes
    id_medico = request.args.get('id_medico')
    
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="smartmedi" # Nombre de tu base de datos actual
        )
        cursor = conexion.cursor(dictionary=True)
        
        # 💡 Si pasamos un id_medico, filtramos estrictamente sus pacientes asignados.
        # Ajusta los nombres de las columnas si en tu tabla se llaman diferente.
        if id_medico:
            query = "SELECT id, nombre, ci FROM pacientes WHERE id_medico = %s"
            cursor.execute(query, (id_medico,))
        else:
            query = "SELECT id, nombre, ci FROM pacientes"
            cursor.execute(query)
            
        pacientes = cursor.fetchall()
        cursor.close()
        conexion.close()
        
        return jsonify(pacientes), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/consultas/paciente/<int:id_paciente>', methods=['GET'])
def consultar_ficha_paciente(id_paciente):
    id_medico = request.args.get('id_medico')
    if not id_medico:
        return jsonify({'error': 'ID del médico requerido'}), 400

    try:
        # 🌟 Usamos directamente tu conexión global 'db'
        cursor = db.cursor(dictionary=True)

        # 1. Obtener los datos del paciente (Verificando médico_id como en tu tabla)
        query_paciente = """
            SELECT id, nombre, ci, edad, telefono, sexo, correo, direccion 
            FROM pacientes 
            WHERE id = %s AND medico_id = %s
        """
        cursor.execute(query_paciente, (id_paciente, id_medico))
        paciente = cursor.fetchone()

        if not paciente:
            cursor.close()
            return jsonify({'error': 'Paciente no encontrado o no asignado a este médico'}), 404

        # 2. Buscar el último tratamiento registrado para este paciente
        query_tratamiento = """
            SELECT id, medicamento, dosis, frecuencia, via_administracion, fecha_inicio, fecha_final, observaciones 
            FROM tratamientos 
            WHERE paciente_id = %s 
            ORDER BY id DESC 
            LIMIT 1
        """
        cursor.execute(query_tratamiento, (id_paciente,))
        tratamiento_actual = cursor.fetchone()

        cursor.close()

        # Enviamos la respuesta estructurada limpia que espera tu Angular
        return jsonify({
            'paciente': paciente,
            'tiene_tratamiento': tratamiento_actual is not None,
            'tratamiento': tratamiento_actual
        }), 200

    except Exception as e:
        print("❌ ERROR REAL EN MYSQL:", str(e)) # Revisa tu terminal de VS Code para ver este mensaje si falla
        return jsonify({'error': str(e)}), 500



@app.route('/api/medico/<int:id_medico>', methods=['GET'])
def obtener_perfil_medico(id_medico):
    try:
        cursor = db.cursor(dictionary=True)
        # Consultamos todos los campos del médico de la tabla usuarios
        cursor.execute("""
            SELECT id, foto, nombre, apellido, usuario, correo, telefono, clinica, especialidad, direccion, rol 
            FROM usuarios 
            WHERE id = %s
        """, (id_medico,))
        medico = cursor.fetchone()
        cursor.close()

        if not medico:
            return jsonify({'error': 'Médico no encontrado'}), 404

        return jsonify(medico), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/medico/actualizar/<int:id_medico>', methods=['POST'])
def actualizar_perfil_medico(id_medico):
    try:
        # Recogemos los campos de texto enviados desde el formulario de Angular
        nombre = request.form.get('nombre')
        apellido = request.form.get('apellido')
        correo = request.form.get('correo')
        telefono = request.form.get('telefono')
        clinica = request.form.get('clinica')
        especialidad = request.form.get('especialidad')
        direccion = request.form.get('direccion')

        cursor = db.cursor(dictionary=True)

        # Verificar si mandó una foto nueva en la petición
        foto_url = None
        if 'foto' in request.files:
            file = request.files['foto']
            if file.filename != '':
                filename = secure_filename(f"medico_{id_medico}_{file.filename}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                # Guardamos la ruta relativa para acceder desde el servidor
                foto_url = f"http://localhost:5000/uploads/{filename}"

        # Si subió foto nueva, la incluimos en el UPDATE. Si no, dejamos la que ya tenía.
        if foto_url:
            query = """
                UPDATE usuarios 
                SET nombre=%s, apellido=%s, correo=%s, telefono=%s, clinica=%s, especialidad=%s, direccion=%s, foto=%s
                WHERE id=%s
            """
            valores = (nombre, apellido, correo, telefono, clinica, especialidad, direccion, foto_url, id_medico)
        else:
            query = """
                UPDATE usuarios 
                SET nombre=%s, apellido=%s, correo=%s, telefono=%s, clinica=%s, especialidad=%s, direccion=%s
                WHERE id=%s
            """
            valores = (nombre, apellido, correo, telefono, clinica, especialidad, direccion, id_medico)

        cursor.execute(query, valores)
        db.commit()

        # Volvemos a consultar el usuario actualizado para enviárselo de vuelta a Angular
        cursor.execute("SELECT id, foto, nombre, apellido, usuario, correo, telefono, clinica, especialidad, direccion, rol FROM usuarios WHERE id = %s", (id_medico,))
        usuario_actualizado = cursor.fetchone()
        cursor.close()

        return jsonify({
            'mensaje': '¡Perfil actualizado con éxito!',
            'usuario': usuario_actualizado
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 💡 EXTRA: Ruta estática para que Angular pueda renderizar las imágenes guardadas en /uploads
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)







if __name__ == '__main__':
    app.run(
        debug=True,
        port=5000
    )
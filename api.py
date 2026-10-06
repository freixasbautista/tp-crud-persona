from flask import Flask, jsonify, request

from models.persona import Persona
from services.persona_service import PersonaService


app = Flask(__name__)

servicio = PersonaService()


# Personas iniciales para probar la API
servicio.agregar_persona(
    Persona(
        12345678,
        "Bautista"
    )
)

servicio.agregar_persona(
    Persona(
        87654321,
        "Carlos"
    )
)


# GET - Obtener todas las personas
@app.route("/personas", methods=["GET"])
def obtener_personas():

    personas = servicio.obtener_personas()

    return jsonify([
        {
            "dni": persona.dni,
            "nombre": persona.nombre
        }
        for persona in personas
    ])
# GET - Obtener una persona por DNI
@app.route("/personas/<int:dni>", methods=["GET"])
def obtener_persona(dni):

    persona = servicio.obtener_persona_por_dni(dni)

    if persona is None:
        return jsonify({
            "error": "Persona no encontrada"
        }), 404

    return jsonify({
        "dni": persona.dni,
        "nombre": persona.nombre
    })


# POST - Agregar una persona
@app.route("/personas", methods=["POST"])
def agregar_persona():

    datos = request.get_json()

    persona = Persona(
        datos["dni"],
        datos["nombre"]
    )

    try:

        servicio.agregar_persona(persona)

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 409

    return jsonify({
        "dni": persona.dni,
        "nombre": persona.nombre
    }), 201


# PUT - Modificar una persona
@app.route("/personas/<int:dni>", methods=["PUT"])
def modificar_persona(dni):

    datos = request.get_json()

    persona = Persona(
        datos["dni"],
        datos["nombre"]
    )

    try:

        servicio.modificar_persona(dni, persona)

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 404

    return jsonify({
        "dni": persona.dni,
        "nombre": persona.nombre
    })


# DELETE - Eliminar una persona
@app.route("/personas/<int:dni>", methods=["DELETE"])
def eliminar_persona(dni):

    persona = servicio.obtener_persona_por_dni(dni)

    if persona is None:
        return jsonify({
            "error": "Persona no encontrada"
        }), 404

    servicio.eliminar_persona(dni)

    return jsonify({
        "mensaje": "Persona eliminada correctamente"
    })


if __name__ == "__main__":
    app.run(debug=True)
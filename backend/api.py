from flask import Flask, jsonify, request
from flask_cors import CORS

from models.persona import Persona
from services.persona_service import PersonaService


def persona_a_diccionario(persona):
    """Convierte una Persona en un diccionario JSON serializable."""
    return {
        "dni": persona.dni,
        "nombre": persona.nombre,
    }


def personas_a_lista_diccionarios(personas):
    """Convierte una colección de personas en una lista de diccionarios."""
    return [persona_a_diccionario(persona) for persona in personas]


def crear_app(servicio=None):
    """Crea la aplicación Flask y configura sus rutas."""
    app = Flask(__name__)
    CORS(app)

    if servicio is None:
        servicio = PersonaService()

        personas_iniciales = [
            Persona(12345678, "Bautista"),
            Persona(87654321, "Carlos"),
            Persona(23456789, "Lucia"),
            Persona(34567890, "Mateo"),
            Persona(45678901, "Sofia"),
            Persona(56789012, "Valentina"),
            Persona(67890123, "Nicolas"),
        ]

        for persona in personas_iniciales:
            servicio.agregar_persona(persona)

    @app.get("/personas")
    def obtener_personas():
        personas = servicio.obtener_personas()
        resultado = personas_a_lista_diccionarios(personas)
        return jsonify(resultado), 200

    @app.get("/personas/<int:dni>")
    def obtener_persona(dni):
        persona = servicio.obtener_persona_por_dni(dni)

        if persona is None:
            return jsonify({"error": "Persona no encontrada"}), 404

        return jsonify(persona_a_diccionario(persona)), 200

    @app.post("/personas")
    def agregar_persona():
        datos = request.get_json(silent=True)

        if not isinstance(datos, dict):
            return jsonify({"error": "Se requiere un objeto JSON"}), 400

        if "dni" not in datos or "nombre" not in datos:
            return jsonify({
                "error": "Los campos dni y nombre son obligatorios"
            }), 400

        try:
            persona = Persona(datos["dni"], datos["nombre"])
            servicio.agregar_persona(persona)
        except (TypeError, ValueError) as error:
            return jsonify({"error": str(error)}), 400

        return jsonify(persona_a_diccionario(persona)), 201

    @app.put("/personas/<int:dni>")
    def modificar_persona(dni):
        datos = request.get_json(silent=True)

        if not isinstance(datos, dict):
            return jsonify({"error": "Se requiere un objeto JSON"}), 400

        if "dni" not in datos or "nombre" not in datos:
            return jsonify({
                "error": "Los campos dni y nombre son obligatorios"
            }), 400

        try:
            persona = Persona(datos["dni"], datos["nombre"])
            servicio.modificar_persona(dni, persona)
        except (TypeError, ValueError) as error:
            return jsonify({"error": str(error)}), 400

        return jsonify(persona_a_diccionario(persona)), 200

    @app.delete("/personas/<int:dni>")
    def eliminar_persona(dni):
        persona = servicio.obtener_persona_por_dni(dni)

        if persona is None:
            return jsonify({"error": "Persona no encontrada"}), 404

        servicio.eliminar_persona(dni)

        return jsonify({
            "mensaje": "Persona eliminada correctamente"
        }), 200

    return app


app = crear_app()


if __name__ == "__main__":
    app.run(debug=True)
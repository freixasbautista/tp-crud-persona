
from repository.persona_repository import PersonaRepository
from models.persona import Persona


class PersonaService:

    def __init__(self, repositorio=None):
        self._repositorio = (
            repositorio if repositorio is not None
            else PersonaRepository()
        )

    def agregar_persona(self, persona: Persona):
        if self._repositorio.obtener_por_dni(persona.dni) is not None:
            raise ValueError("Ya existe una persona con ese DNI")

        self._repositorio.guardar(persona)

    def obtener_personas(self):
        return self._repositorio.obtener_todos()

    def obtener_persona_por_dni(self, dni: int):
        return self._repositorio.obtener_por_dni(dni)

    def eliminar_persona(self, dni: int):
        return self._repositorio.eliminar(dni)

    def modificar_persona(self, dni: int, nueva_persona: Persona):

        persona_existente = self._repositorio.obtener_por_dni(dni)

        if persona_existente is None:
            raise ValueError("No existe una persona con ese DNI")

        if dni != nueva_persona.dni:
            raise ValueError("No se puede modificar el DNI de una persona")

        return self._repositorio.actualizar(nueva_persona)

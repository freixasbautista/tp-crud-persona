from models.persona import Persona
from repository.persona_repository import PersonaRepository


class PersonaService:

    def __init__(self):
        self.repo = PersonaRepository()

    def agregar_persona(self, persona: Persona):

        if self.repo.buscar_por_dni(persona.dni) is not None:
            raise ValueError("Ya existe una persona con ese DNI.")

        self.repo.guardar(persona)

    def obtener_personas(self):
        return self.repo.obtener_todos()

    def obtener_persona_por_dni(self, dni: int):
        return self.repo.buscar_por_dni(dni)

    def eliminar_persona(self, dni: int):
        self.repo.eliminar(dni)

    def modificar_persona(self, dni: int, persona_nueva: Persona):

        persona_existente = self.repo.buscar_por_dni(dni)

        if persona_existente is None:
            raise ValueError("No existe una persona con ese DNI.")

        self.repo.modificar(dni, persona_nueva)
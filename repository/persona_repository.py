from models.persona import Persona


class PersonaRepository:

    def __init__(self):
        self._personas: list[Persona] = []

    def guardar(self, persona: Persona) -> None:
        self._personas.append(persona)

    def buscar_por_dni(self, dni: int) -> Persona | None:

        for persona in self._personas:

            if persona.dni == dni:
                return persona
        return None

    def obtener_todos(self) -> list[Persona]:
        return self._personas.copy()

    def eliminar(self, dni: int) -> None:

        persona = self.buscar_por_dni(dni)

        if persona is not None:
            self._personas.remove(persona)

    def modificar(self, dni: int, persona_nueva: Persona) -> None:

        for i, persona in enumerate(self._personas):

            if persona.dni == dni:
                self._personas[i] = persona_nueva
                return
class PersonaRepository:
    def __init__(self):
        self._personas = []

    def guardar(self, persona):
        self._personas.append(persona)

    def buscar_por_dni(self, dni):
        for persona in self._personas:
            if persona.dni == dni:
                return persona

        return None

    def obtener_todos(self):
        return self._personas.copy()

    def eliminar(self, dni):
        for indice, persona in enumerate(self._personas):
            if persona.dni == dni:
                del self._personas[indice]
                return True

        return False

    def modificar(self, dni, nueva_persona):
        for indice, persona in enumerate(self._personas):
            if persona.dni == dni:
                self._personas[indice] = nueva_persona
                return True

        return False
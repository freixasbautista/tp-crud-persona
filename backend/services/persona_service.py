from repository.persona_repository import PersonaRepository


class PersonaService:
    def __init__(self, repositorio=None):
        self._repositorio = (
            repositorio if repositorio is not None
            else PersonaRepository()
        )

    def agregar_persona(self, persona):
        if self._repositorio.buscar_por_dni(persona.dni) is not None:
            raise ValueError("Ya existe una persona con ese DNI")

        self._repositorio.guardar(persona)

    def obtener_personas(self):
        return self._repositorio.obtener_todos()

    def obtener_persona_por_dni(self, dni):
        return self._repositorio.buscar_por_dni(dni)

    def eliminar_persona(self, dni):
        return self._repositorio.eliminar(dni)

    def modificar_persona(self, dni, nueva_persona):
        if self._repositorio.buscar_por_dni(dni) is None:
            raise ValueError("No existe una persona con ese DNI")

        if dni != nueva_persona.dni:
            persona_con_nuevo_dni = (
                self._repositorio.buscar_por_dni(nueva_persona.dni)
            )

            if persona_con_nuevo_dni is not None:
                raise ValueError("Ya existe una persona con ese DNI")

        return self._repositorio.modificar(dni, nueva_persona)
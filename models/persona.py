from dataclasses import dataclass


@dataclass(frozen=True)
class Persona:

    _dni: int
    _nombre: str

    def __post_init__(self):

        if not isinstance(self._dni, int):
            raise TypeError("El DNI debe ser un número entero.")

        if self._dni <= 0:
            raise ValueError("El DNI debe ser mayor que 0.")

        self._validar_nombre(self._nombre)

    @staticmethod
    def _validar_nombre(nombre: str):

        if not isinstance(nombre, str):
            raise TypeError("El nombre debe ser un texto.")

        if not nombre:
            raise ValueError("El nombre no puede estar vacío.")

        if len(nombre) > 30:
            raise ValueError("El nombre no puede tener más de 30 caracteres.")

        if not nombre[0].isupper():
            raise ValueError(
                "El nombre debe comenzar con mayúscula."
            )

        if not nombre[1:].islower():
            raise ValueError(
                "El resto del nombre debe estar en minúscula."
            )

    @property
    def dni(self) -> int:
        return self._dni

    @property
    def nombre(self) -> str:
        return self._nombre
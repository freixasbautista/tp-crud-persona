from dataclasses import dataclass


@dataclass(frozen=True)
class Persona:
    _dni: int
    _nombre: str

    def __post_init__(self):
        if not isinstance(self._dni, int) or isinstance(self._dni, bool):
            raise TypeError("El DNI debe ser un número entero")

        if self._dni <= 0:
            raise ValueError("El DNI debe ser mayor que cero")

        if not isinstance(self._nombre, str):
            raise TypeError("El nombre debe ser texto")

        if not self._nombre:
            raise ValueError("El nombre no puede estar vacío")

        if len(self._nombre) > 30:
            raise ValueError("El nombre no puede superar los 30 caracteres")

        if not self._nombre[0].isupper():
            raise ValueError("La primera letra debe ser mayúscula")

        if not self._nombre[1:].islower():
            raise ValueError("El resto del nombre debe estar en minúsculas")

    @property
    def dni(self):
        return self._dni

    @property
    def nombre(self):
        return self._nombre
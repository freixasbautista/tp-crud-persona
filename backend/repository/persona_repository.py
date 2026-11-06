
import sqlite3
from contextlib import closing

from models.persona import Persona


DB_NAME = "personas.db"

SQL_CREAR_TABLA = """
CREATE TABLE IF NOT EXISTS personas (
    dni INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL
);
"""

SQL_INSERTAR = """
INSERT INTO personas (dni, nombre)
VALUES (?, ?)
"""

SQL_BUSCAR_POR_DNI = """
SELECT dni, nombre
FROM personas
WHERE dni = ?
"""

SQL_OBTENER_TODOS = """
SELECT dni, nombre
FROM personas
ORDER BY dni
"""

SQL_ACTUALIZAR = """
UPDATE personas
SET nombre = ?
WHERE dni = ?
"""

SQL_ELIMINAR = """
DELETE FROM personas
WHERE dni = ?
"""


class PersonaRepository:

    def __init__(self):
        """Crea la tabla si todavía no existe."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            with conn:
                conn.execute(SQL_CREAR_TABLA)

    def guardar(self, persona: Persona) -> None:
        """Guarda una persona nueva."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            with conn:
                conn.execute(
                    SQL_INSERTAR,
                    (persona.dni, persona.nombre)
                )

    def obtener_por_dni(self, dni: int) -> Persona | None:
        """Busca una persona por DNI."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            fila = conn.execute(
                SQL_BUSCAR_POR_DNI,
                (dni,)
            ).fetchone()

        return Persona(*fila) if fila is not None else None

    def obtener_todos(self) -> list[Persona]:
        """Obtiene todas las personas ordenadas por DNI."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            filas = conn.execute(SQL_OBTENER_TODOS).fetchall()

        return [Persona(*fila) for fila in filas]

    def actualizar(self, persona: Persona) -> bool:
        """Actualiza el nombre de una persona."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            with conn:
                cursor = conn.execute(
                    SQL_ACTUALIZAR,
                    (persona.nombre, persona.dni)
                )

        return cursor.rowcount > 0

    def eliminar(self, dni: int) -> bool:
        """Elimina una persona por DNI."""
        with closing(sqlite3.connect(DB_NAME)) as conn:
            with conn:
                cursor = conn.execute(
                    SQL_ELIMINAR,
                    (dni,)
                )

        return cursor.rowcount > 0

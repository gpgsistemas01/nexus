# 14. Patrones de construcción de pruebas

`createControllerTestApp` es una factory de test harness: crea una aplicación Express
mínima, instala parsing JSON y deja que cada prueba registre las rutas necesarias. Se
reutiliza en unitarias de borde e integraciones de controller en vez de reconstruir una
aplicación distinta por CRUD.

La ubicación sigue indicando el propósito:

- reglas aisladas y efectos negativos en `tests/unit/controllers/<tipo>/<dominio>`;
- CRUD real por HTTP y Prisma en `tests/integration/controllers`;
- helpers compartidos en `tests/helpers`, con pruebas propias cuando contienen lógica.

Compartir harness o casos tabulados no elimina la integración de cada contexto: ésta
debe demostrar router, permiso, configuración, persistencia y efectos propios.

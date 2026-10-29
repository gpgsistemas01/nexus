# Manual de usuario de Nexus — interfaz Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.2 | 1.0.0 | En revisión | 2026-10-29 | Equipo Nexus |

## Propósito y destinatarios

Este manual explica cómo utilizar Nexus desde el navegador para administrar
existencias, registrar compras, solicitar y surtir salidas, consultar movimientos
y mantener los registros auxiliares. Está dirigido a las personas que operan el
sistema y a quienes administran sus accesos. No requiere conocimientos de Vue ni
de programación.

Cada procedimiento indica dónde empezar, qué capturar, qué acción confirma el
cambio y cómo comprobar su resultado. Los nombres en **negritas** corresponden a
controles de la interfaz. Las capturas muestran datos ficticios de demostración;
los nombres, saldos y folios de su instalación serán diferentes.

## Preparación

Necesita la dirección de acceso proporcionada por su organización, conexión al
servicio y una cuenta habilitada. Abra esa dirección en un navegador actualizado.
No utilice la dirección de desarrollo ni instale herramientas de programación
para operar el sistema.

El menú y las acciones disponibles dependen de los permisos de la cuenta. Poder
consultar una tabla no implica poder crear, editar, ajustar existencias o descargar
un reporte. Si falta una opción necesaria para su trabajo, solicite al responsable
de accesos que revise su cuenta; cambiar la dirección en el navegador no concede
permisos.

## Contenido

Empiece por [Primera jornada: recorrido de inducción](00-induction.md).

| Capítulo | Operaciones |
| --- | --- |
| [1. Acceso y sesión](01-access.md) | Ingresar, recordar usuario, recuperar acceso y salir. |
| [2. Navegación y controles](02-navigation-and-controls.md) | Menú, filtros, tablas, selectores y formularios. |
| [3. Materiales](03-materials.md) | Registrar, consultar, editar y ajustar materiales. |
| [4. Consumibles](04-consumables.md) | Administrar existencias de consumibles. |
| [5. Mermas](05-wastes.md) | Capturar medidas y pesos, agregar existencias y ajustar. |
| [6. Catálogos](06-catalogs.md) | Áreas, roles, presentaciones, unidades, motivos y estados. |
| [7. Personas](07-persons.md) | Personas y sus responsabilidades por área. |
| [8. Usuarios](08-users.md) | Cuentas, asignaciones y contraseñas. |
| [9. Clientes](09-clients.md) | Datos y disponibilidad del cliente. |
| [10. Proveedores](10-suppliers.md) | Razón social, nombre comercial y disponibilidad. |
| [11. Compras](11-purchases.md) | Recepciones, detalles, correcciones y cancelaciones. |
| [12. Salidas](12-issues.md) | Solicitudes, surtido y devoluciones. |
| [13. Movimientos](13-movements.md) | Historial de entradas y salidas de existencias. |
| [14. Reportes](14-reports.md) | Descargar información según filtros o periodo. |
| [15. Errores y recuperación](15-errors-and-recovery.md) | Capturas inválidas, conflictos y fallos de conexión. |
| [16. Glosario para trabajar en Nexus](16-glossary.md) | Significado de campos, cantidades, estados y operaciones. |

## Convenciones de operación

**Guardar**, **Actualizar**, **Surtir**, **Devolver** y las confirmaciones de
corrección o cancelación envían cambios al sistema. **Agregar** dentro de los
detalles de un documento o de las responsabilidades de una persona prepara la
captura; todavía debe guardar el formulario principal. **Cerrar** o **Regresar**
permiten abandonar una captura sin enviarla. Cerrar un mensaje después de una
confirmación exitosa no revierte una operación ya guardada.

Use las unidades indicadas en cada campo. Una cantidad por presentación y una
cantidad convertida pueden tener valores diferentes. Antes de confirmar una
operación de inventario, compruebe el artículo, proveedor, unidad y cantidad.

La confirmación del sistema y la consulta actualizada son la referencia del
resultado. Si se interrumpe la conexión al guardar, siga el capítulo de
[recuperación](15-errors-and-recovery.md) antes de repetir la operación.

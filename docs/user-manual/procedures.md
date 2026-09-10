# Procedimientos y casos

Este capítulo integra las capturas generadas con los pasos que las requieren. El texto situado
sobre cada imagen es su ID actualizado y estable; los casos de uso asociados permiten verificar
la trazabilidad. Antes de exportar, compruebe que las imágenes existentes estén completas,
revisadas y correspondan a la versión del manual. Ejecute `npm run docs:screenshots` sólo si falta
una captura o cambió una pantalla; actualizar capturas y exportar el manual son acciones distintas.

## Convenciones del recorrido

- **Precondiciones:** use una cuenta ficticia autorizada y los datos indicados en el inventario.
- **Alternativas y errores:** si una acción no aparece, no cambie de cuenta; valide permisos y
  estado del registro. Si una validación impide continuar, corrija el dato señalado sin repetir
  una operación cuyo resultado sea incierto.
- **Capturas:** consulte cada imagen inmediatamente después de que aparezca la pantalla que
  representa y antes de capturar datos o ejecutar la siguiente acción. En listados y páginas
  iniciales, la referencia es el primer paso; en formularios y diálogos, sigue a la acción que
  los abre. La captura no se coloca después de guardar, descargar o regresar porque no muestra
  el resultado de esas acciones.
- **Resultado:** confirme el mensaje y el estado visible. Las acciones de existencia, surtido,
  devolución y corrección modifican inventario; las de exportación generan un archivo.

🟨 **ADVERTENCIA:** antes de confirmar una escritura, revise la
[matriz de validación y modos](form-validation-matrix.md); una acción visible después de surtir,
devolver, corregir o cancelar puede habilitar menos campos que la edición general.

## Casos por grupo funcional

Los procedimientos se dividen por grupo para localizar una tarea sin recorrer un único archivo extenso:

- [Autenticación y navegación](cases/authentication.md): iniciar sesión y recuperarse de una página no encontrada.
- [Identidad y acceso](cases/identity-access.md): administrar personas, accesos, usuarios y contraseñas.
- [Catálogos e inventario](cases/catalogs.md): consultar y mantener materiales, proveedores, clientes y mermas.
- [Compras de material](cases/purchases.md): registrar, editar, corregir y exportar compras.
- [Salidas de material y merma](cases/issues.md): registrar, surtir, devolver y exportar salidas.
- [Consultas y reportes](cases/reports.md): consultar movimientos y seleccionar el alcance de su exportación.

### Relación con requisitos y arquitectura

El manual explica **cómo opera la persona usuaria**; no sustituye la descripción normativa ni
las secuencias técnicas. Para revisar un cambio sin perder detalle, use el identificador y nombre
`CU-*` del procedimiento para recorrer las siguientes vistas del mismo grupo:

| Grupo | Descripción normativa | Diagramas funcionales | Secuencia frontend | Secuencia backend | Procedimiento operativo |
| --- | --- | --- | --- | --- | --- |
| `AUT` | [Fichas de autenticación](../requirements/use-case-descriptions.md#grupo-funcional-aut--autenticación) | [Flujos `CU-AUT`](../requirements/requirements-diagrams.md#grupo-funcional-aut--autenticación) | [Frontend](../architecture/frontend-code-sequences/authentication.md) | [Backend](../architecture/backend-code-sequences/authentication.md) | [Acceso](cases/authentication.md) |
| `IDA` | [Fichas de identidad y acceso](../requirements/use-case-descriptions.md#grupo-funcional-ida--identidad-y-acceso) | [Flujos `CU-IDA`](../requirements/requirements-diagrams.md#grupo-funcional-ida--identidad-y-acceso) | [Frontend](../architecture/frontend-code-sequences/identity-access.md) | [Backend](../architecture/backend-code-sequences/identity-access.md) | [Personas y usuarios](cases/identity-access.md) |
| `CAT` | [Fichas de catálogos](../requirements/use-case-descriptions.md#grupo-funcional-cat--catálogos) | [Flujos `CU-CAT`](../requirements/requirements-diagrams.md#grupo-funcional-cat--catálogos) | [Frontend](../architecture/frontend-code-sequences/catalogs.md) | [Backend](../architecture/backend-code-sequences/catalogs.md) | [Catálogos e inventario](cases/catalogs.md) |
| `ENT` | [Fichas de compras](../requirements/use-case-descriptions.md#grupo-funcional-ent--compras-de-material) | [Flujos `CU-ENT`](../requirements/requirements-diagrams.md#grupo-funcional-ent--compras-de-material) | [Frontend](../architecture/frontend-code-sequences/purchases.md) | [Backend](../architecture/backend-code-sequences/purchases.md) | [Compras](cases/purchases.md) |
| `SAL` | [Fichas de salidas](../requirements/use-case-descriptions.md#grupo-funcional-sal--salidas-de-material-y-de-merma) | [Flujos `CU-SAL`](../requirements/requirements-diagrams.md#grupo-funcional-sal--salidas-de-material-y-de-merma) | [Frontend](../architecture/frontend-code-sequences/issues.md) | [Backend](../architecture/backend-code-sequences/issues.md) | [Salidas](cases/issues.md) |
| `REP` | [Fichas de consultas y reportes](../requirements/use-case-descriptions.md#grupo-funcional-rep--consultas-y-reportes) | [Flujos `CU-REP`](../requirements/requirements-diagrams.md#grupo-funcional-rep--consultas-y-reportes) | [Frontend](../architecture/frontend-code-sequences/reports.md) | [Backend](../architecture/backend-code-sequences/reports.md) | [Movimientos y exportaciones](cases/reports.md) |

Al mantener un caso, conserve el mismo **identificador y nombre** en estas vistas. Actualice la
ficha normativa si cambia el objetivo, actor, disparador, precondición, flujo, excepción o
postcondición; el procedimiento si cambia un control o recorrido visible; y las secuencias si
cambia la colaboración del código. Una pantalla deshabilitada para revisar un registro cancelado
pertenece al caso de **consulta**, no al caso de edición o cancelación, porque no confirma ninguna
escritura.

## Manuales por actor

Cada guía de actor funciona como punto de entrada y enlaza únicamente los grupos que corresponden a sus responsabilidades:

- [Administrador del sistema](actors/administrator.md).
- [Personal de almacén](actors/warehouse.md).
- [Usuario de consultas y reportes](actors/reporting.md).

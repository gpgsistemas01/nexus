# 3. Actores y responsabilidad del sistema

| Participante | Responsabilidad |
| --- | --- |
| Personal de almacén (área Almacén y proveduría) | Mantener los catálogos operativos autorizados y ejecutar entradas, salidas y devoluciones. No ajusta existencias mediante la acción administrativa. |
| Usuario de área operativa (Impresión, Taller 3D (Taller/Herrería), Router, PT/Tráfico, Instalaciones o Acabados) | Consultar inventario y crear o editar solicitudes de salida de materiales, consumibles y merma con un rol autorizado. No modifica inventario ni realiza surtidos o devoluciones por este acceso. |
| Solicitante o aprobador | Persona que participa como dato del documento cuando corresponde; no implica una cuenta, acceso ni un flujo de aprobación disponible. |
| Administrador del sistema (área Sistemas) | Ejecutar todas las capacidades vigentes, incluida la administración de clientes, personas, usuarios y accesos, siempre con autorización comprobada en el servidor. Ventas no accede al sistema. |
| Dirección | Parte interesada de supervisión; sus casos de uso y alcance autorizado permanecen pendientes de definición. |
| Nexus (sistema) | Comprobar accesos y reglas, confirmar operaciones sin cambios parciales, asignar folios, conservar historia y notificar actualizaciones. La auditoría tiene el alcance configurado, no cobertura exhaustiva; el sistema no es actor externo. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](../../architecture/contracts/index.md).

El [diagrama de casos de uso](../use-case-model/index.md) conserva
las asociaciones y generalizaciones de actores; cada [ficha `CU-*`](../use-cases/index.md)
nombra al actor que inicia el objetivo. Los
[modos y efectos](06-operation-modes-and-effects.md) concentran las reglas funcionales;
la arquitectura y OpenAPI describen su realización. Estas fuentes se
complementan y no se repiten aquí como otra matriz.

Personal de almacén especializa a Usuario registrado; Administrador del sistema
especializa a Personal de almacén y hereda sus asociaciones, incluida autenticación.
Usuario de área operativa también especializa a Usuario registrado, en una rama
independiente: no hereda las funciones de Almacén. Las asociaciones compartidas por
una jerarquía se dibujan en su actor general; los objetivos
exclusivos, como ajustes administrativos y consulta de movimientos, se asocian al
administrador. Consultar conserva una asociación normal y no incluye ni extiende las
otras acciones por compartir pantalla. La generalización de actores no define
relaciones entre casos ni sustituye la comprobación de permisos.

Solicitantes, aprobadores, asesores, receptores y proveedores
pueden participar en un documento sin convertirse por ello en actores con acceso. Las
lecturas auxiliares para selectores tampoco conceden mantenimiento del catálogo ni
sustituyen los controles de acceso del sistema.

## Responsabilidades del cliente y de la API

| Responsabilidad | Cliente Vue | API del sistema |
| --- | --- | --- |
| Acceso | Presenta rutas y acciones según los permisos recibidos y recupera la sesión cuando se permite. | Autentica y comprueba autorización vigente en cada petición. |
| Captura | Valida las reglas públicas, conserva la información corregible y construye la solicitud del modo elegido. | Valida la entrada y resuelve relaciones, versiones y estado persistido. |
| Existencias e importes | Presenta saldos y vistas previas; espera la confirmación y recarga los datos vigentes. | Calcula y confirma los cambios de documentos, detalle, stock y movimientos sin efectos parciales. |
| Historia y datos | Presenta la información autorizada y los errores sin exponer secretos. | Conserva los datos y la auditoría configurada. |

Una cuenta con varias asignaciones combina los accesos permitidos por ellas. Auxiliar
y Coordinador de Almacén pueden consultar y registrar salidas para todas las áreas;
el acceso operativo se limita a sus áreas autorizadas y no concede surtido ni devolución.
Instalaciones utiliza el rol Instalador. El Administrador del sistema tiene las
capacidades vigentes completas. La fuente de autorización sigue siendo la sesión real.

## Alta contextual de clientes y proveedores

Almacén conserva la lectura de opciones y los permisos de alta para los selectores
de sus operaciones. Si falta un registro, abre el modal, lo guarda y vuelve con
el nuevo registro seleccionado; cancelar conserva la captura principal. El alta
confirmada es independiente de que después guarde o abandone esa operación.
Las páginas de Directorio, su edición y sus reportes corresponden a Sistemas.

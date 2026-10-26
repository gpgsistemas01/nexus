# 3. Casos de uso Vue: acceso, consultas y registros

## Convenciones comunes

Estas fichas describen acciones y resultados de la SPA conforme a la [especificación local](02-client-specification.md). Una cuenta autorizada dispone del permiso concreto del recurso; ocultar un botón no sustituye al servidor. Salvo Acceso, los flujos requieren sesión y API disponibles. Una escritura se confirma por su respuesta válida, no por cerrar un modal. Los componentes indicados al final son realización técnica, no actores nuevos del negocio.

<a id="cu-vue-001"></a>

## CU-VUE-001: iniciar sesión y recuperar acceso

**Actor y objetivo:** visitante o usuario cuya sesión necesita comprobarse; acceder a un módulo permitido. **Disparador:** abrir una URL protegida o pulsar Entrar. **Requisitos:** RF-VUE-001/002/003, RD-VUE-004, RN-VUE-001/002; correspondencia de producto `CU-AUT-01`.

### Datos y flujo principal

1. La página `/inicio-sesion` presenta usuario, contraseña y Recordar usuario sin errores iniciales.
2. El actor captura credenciales. El nombre admite normalización de espacios extremos; la contraseña conserva su contenido exacto.
3. Envía; se valida la captura y se bloquea otro envío pendiente.
4. La API confirma el acceso y la aplicación obtiene identidad/permisos.
5. Se abre el destino interno protegido conservado o el primer módulo permitido. Una cuenta exclusiva de Catálogos entra a Áreas.

### Alternativas, errores y recuperación

- Con sesión vigente, la guarda puede resolver acceso sin repetir credenciales.
- Un access token vencido puede renovarse con la cookie de refresh y continuar la solicitud protegida. El login rechazado no provoca refresh de credenciales inválidas.
- Datos incompletos muestran errores corregibles. Recordar usuario no guarda contraseña ni cambia duración de cookies.
- Un fallo de conexión abre recuperación con destino conservado. Volver a comprobar muestra espera y permite reintentar; un refresh rechazado vuelve al login.
- Destinos externos, desconocidos o de error se descartan como retorno protegido. Un 403 presenta acceso no permitido.

### Postcondición, realización y evidencia

Éxito: identidad vigente por aplicación y navegación autorizada. Rechazo: no se presenta una identidad ficticia ni se afirma haber emitido cookies desde JavaScript. `LoginPage`, `useLoginForm`, sesión, Router y Axios realizan el flujo. [Autenticación](../modules/01-authentication.md), `login.spec.ts`, `sessionRecovery.spec.ts` y el recorrido de sistema conservan su evidencia.

<a id="cu-vue-002"></a>

## CU-VUE-002: navegar y consultar un listado

**Actor:** usuario autenticado. **Objetivo:** localizar registros del recurso permitido. **Disparador:** seleccionar un enlace o abrir una URL Vue. **Requisitos:** RF-VUE-003/004, RN-VUE-003/005/006.

### Flujo principal

1. La navegación presenta sólo enlaces autorizados.
2. Se abre la página y se consulta el listado con su recurso, tamaño y orden inicial.
3. El actor captura búsqueda y filtros propios del módulo, y pulsa Buscar.
4. La consulta vuelve a la primera página y conserva los filtros aplicados separados de los borradores.
5. La tabla presenta filas, conteo y acciones permitidas. Cambiar de página solicita esa página al servidor.
6. Limpiar restablece los filtros; repetir la búsqueda vigente puede actualizar el resultado sin una segunda consulta redundante.

### Variantes y excepciones

En escritorio, pulsar grupo/icono expande el menú compacto; clic fuera, Escape o navegar lo compacta. En móvil el drawer es temporal. Catálogos busca por nombre; Personas añade área/rol; Compras, Salidas y Movimientos tienen filtros propios. Sólo se habilitan órdenes admitidos por la API.

Sin resultados se presenta vacío. Un fallo de lectura conserva contexto y ofrece reintento. Cambiar contexto invalida consultas anteriores. Un recurso desconocido no consulta un endpoint arbitrario. Los rechazos 401/403 siguen la recuperación de sesión o acceso.

### Postcondición y evidencia

Se muestra la página correspondiente a los filtros aplicados. Buscar, ordenar y paginar no escriben registros. Páginas, `usePagedList`, `useListSearch`, `ServerTable` y filtros implementan el flujo. Las suites de los módulos comprueban sus variantes; véase [diseño de pruebas](../testing/01-test-design.md).

<a id="cu-vue-003"></a>

## CU-VUE-003: mantener catálogos, clientes y proveedores

**Actor:** usuario con lectura y escritura del recurso. **Objetivo:** crear un registro o editar una fila vigente. **Requisitos:** RF-VUE-005, RD-VUE-001/002, RN-VUE-001/002/004; correspondencia con capacidades `CU-CAT-*`.

### Datos y flujo principal

1. Abrir Nuevo o Editar en el recurso elegido. Edición precarga datos y versión.
2. Capturar los campos propios: Catálogos tiene nombre/Activo y Unidades añade símbolo; Cliente tiene nombre/Activo; Proveedor tiene razón social/nombre comercial/Activo. No se captura teléfono.
3. Editar un campo y salir valida ese campo; abrir o mover foco sin captura no publica errores.
4. Guardar valida el formulario, construye el payload del modo y muestra espera.
5. La respuesta confirmada cierra el editor, actualiza el listado y presenta el aviso de la operación.

### Reglas y alternativas

Alta no fabrica una versión. Edición envía la versión de apertura. Activo expresa disponibilidad/baja lógica, conservando identidad e historial. El nombre visible no sustituye una clave de permisos. Cancelar cierra sin escribir.

Los errores de campo se presentan junto a su captura. Un conflicto conserva los valores y requiere cerrar/recargar; no se consulta una versión nueva para aceptar silenciosamente la captura anterior. Un fallo de conexión admite reintento explícito. Desmontar invalida confirmaciones tardías.

### Postcondición y evidencia

Éxito: la interfaz refleja un alta/edición confirmados. Cancelación o rechazo: no se anuncia una escritura exitosa ni se pierde silenciosamente la captura. `CatalogEditorPage`, `DirectoryEditorPage`, sus composables y `useRecordSave` coordinan el flujo. [Catálogos](../modules/03-catalogs.md), [Directorio](../modules/04-identity-and-directory.md), `catalogs.spec.ts` y `records.spec.ts` describen los casos concretos.

<a id="cu-vue-004"></a>

## CU-VUE-004: mantener personas y usuarios

**Actor:** administrador con permisos de Personas o Usuarios. **Objetivo:** mantener identidad operativa o cuenta de acceso. **Requisitos:** RF-VUE-005, RD-VUE-002/004, RN-VUE-001/002; correspondencia `CU-IDA-*`.

### Flujo de Personas

1. Abrir alta/edición y capturar nombre completo.
2. Seleccionar área y rol de las opciones disponibles.
3. Agregar la asignación y comprobar la tabla; falta de área/rol o un área repetida impiden agregarla según las reglas del formulario.
4. Retirar una asignación si corresponde. La captura mantiene pares de IDs; sus nombres son etiquetas.
5. Guardar nombre y asignaciones, con versión al editar, y comprobar el resultado confirmado.

### Flujo de Usuarios

1. Abrir alta, edición o Cambiar contraseña en la pantalla de Usuarios.
2. Alta captura nombre de acceso, área, rol y contraseña. Edición de datos no vuelve a enviar una contraseña vacía.
3. Cambiar contraseña usa un modo separado con contraseña y versión leída.
4. Validar, enviar y actualizar el listado tras confirmar. La política de alta/cambio no se aplica retroactivamente al login histórico.

### Errores, postcondición y evidencia

Personas y Usuarios mantienen pantallas distintas dentro de Identidad y acceso. Catálogos auxiliares sin permiso se deshabilitan con explicación. Cancelar no escribe; errores y conflictos conservan captura. Contraseñas no se precargan, no aparecen en la tabla y no se guardan en Storage.

`IdentityPage`, `PersonEditorPage`, `UserEditorPage`, `usePersonEditor` y `useUserEditor` coordinan estos contratos. Véase [Identidad](../modules/04-identity-and-directory.md), `identityTest.ts` y `records.spec.ts`.

<a id="cu-vue-005"></a>

## CU-VUE-005: cerrar sesión

**Actor y disparador:** usuario autenticado que pulsa Cerrar sesión. **Requisitos:** RF-VUE-014, RD-VUE-004; correspondencia `CU-AUT-02`.

### Flujo principal

1. Se solicita el cierre al servidor mediante su acción de cierre.
2. El navegador procesa las cookies de respuesta.
3. Se limpia la identidad de la aplicación y se abre el login.
4. Abrir directamente otra URL protegida vuelve a comprobar acceso.

### Fallo y postcondición

Si no se confirma el cierre se informa del problema y se permite reintentar; no se anuncia éxito del servidor sin su respuesta. Tras confirmación, el cliente no mantiene navegación autenticada. Ocultar el menú no demuestra revocación de tokens: el recorrido de sistema comprueba también `/me` y refresh reales.

La evidencia está en `sessionRecovery.spec.ts`, `application.spec.ts` y fichas `CP-VUE-SESSION-004-01` / `CP-VUE-SYS-001-01` del [registro de pruebas](../testing/02-test-cases.md).

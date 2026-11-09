# CP-VUE-MAN-001-01 — manual de inducción coherente con el acceso

## Diseño y trazabilidad

DP-VUE-MAN-001 y DP-VUE-MAN-005; riesgo de entregar instrucciones o imágenes de una función no
permitida, mezclar cuentas o registrar una operación para preparar una captura.
Tabla de decisiones por área, rol, permiso de tarea, estado del documento y
completitud de los artefactos. Es una prueba de la herramienta documental.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-MAN-001-01` | Dependencias frontend y Chromium; puerto 5177 libre. Fuentes curadas del manual, políticas de autorización vigentes y fixtures de navegador. No necesita base de datos ni credenciales reales para el modo demo. | Administrador en Sistemas; Auxiliar y Coordinador en Almacén; Coordinador y Operador en Impresión, Taller/Herrería, Acabados, Router y PT; Coordinador e Instalador en Instalaciones. Ejemplos existentes de inventario, compra, persona y salida Pendiente/Surtido. Variables de credenciales ficticias sólo en la prueba unitaria. | 1. Ejecutar las particiones de `manualProfilesTest.ts`. 2. Ejecutar `npm run docs:manuals -- --mode demo --all --capture-only`. 3. Revisar fuentes, imágenes y manifest de los perfiles. 4. Comprobar el caso de salida Surtida para Operador e Instalador. 5. Exportar representantes de Administrador, Almacén y área operativa. 6. Para comprobar recuperación, reanudar con `--missing` sin modificar las huellas y contrastar los PNG conservados. | Cada perfil tiene portada, índice, capítulos y capturas propios. Operativos muestran sólo los grupos Almacén/Salidas; no reciben procedimientos de ajustes, surtido o devolución, costos ni reportes. Almacén conserva surtido/devolución y administración conserva sus funciones adicionales. No se intentan escrituras de negocio. Directivas inválidas, rutas ajenas, cuentas inconsistentes o capturas pendientes impiden publicar. Una cuenta sin `expectedAccess` selecciona contenido desde los permisos de la sesión; una etiqueta de Administrador no eleva el acceso de Instalador. Los secretos no forman parte de las fuentes o del manifest. | Cerrar los contextos y el Vite temporal. Las unitarias eliminan sus directorios temporales. Los artefactos de `docs/user-manual/accounts`, `build/docs` y las pruebas permanecen ignorados para revisión; no modificar registros para limpiarlos. |

## Fuente ejecutable y alcance

[manualProfilesTest.ts](../../../tests/unit/tooling/manualProfilesTest.ts) comprueba
selección, configuración, secretos locales y rechazo de publicaciones incompletas.
Incluye capítulos/capturas omitidos o duplicados, imágenes completas retiradas del
contenido y cuentas de sólo consulta: el índice y sus imágenes conservan ese alcance.
La exportación también rechaza capítulos fuera del acceso e imágenes ajenas a la
selección o carpeta del perfil. Una captura ausente o modificada exige verificarla
con la misma cuenta, aunque otro perfil tenga un PNG con ese nombre.
Los capítulos con LF, CRLF o saltos mezclados conservan el filtrado por permisos;
las ediciones de Sistemas y Almacén conservan las mismas fuentes y referencias a capturas.
Una directiva inválida identifica capítulo y línea e impide publicar fuentes.

[manualOptionsTest.ts](../../../tests/unit/tooling/manualOptionsTest.ts) comprueba
que la ejecución use cuentas locales por defecto, admita demo sólo al solicitarlo
y rechace selecciones ambiguas o formatos inválidos. La ayuda funciona sin
archivos locales. Dos cuentas de un mismo `.env` generan carpetas propias aunque
compartan rol y área.

Las cuentas sin usuario o sin contraseña se omiten antes de abrir el navegador;
las completas siguen seleccionadas. La prueba cubre valores ausentes, vacíos,
usuario compuesto sólo por espacios y prioridad del proceso sobre el archivo.
Si no queda ninguna cuenta, el comando termina correctamente sin capturas ni
exportación, también con `--profile`. Un error de lectura del archivo conserva
su rechazo y no se oculta como una cuenta omitida.

El modo con cuentas es `dev`. Los orígenes remotos, incluido HTTPS, se rechazan
antes de capturar. Los comandos de capturas y publicación de manuales fallan con
`NODE_ENV=production`, también para el manual general de referencia.

Las particiones de lectura, gestión y reporte comprueban que un lector de Compras
no recibe instrucciones de alta, edición, corrección ni cancelación; el reporte
se incluye con su permiso independiente. El reporte de Proveedores no concede el
alta y el ajuste de Mermas se incluye para administración, no para Almacén.

Almacén recibe las instrucciones y capturas de alta de Clientes y Proveedores
desde selectores de Salidas y Compras; no recibe la consulta ni el mantenimiento
de sus páginas independientes, reservadas a Sistemas.

La comprobación abarca notas, glosario y referencias a descargas, además de los
procedimientos. Dos cuentas con el mismo rol y área reciben índices propios. Al
reducir el acceso se retiran los capítulos e imágenes anteriores que ya no correspondan.

[profileManuals.spec.ts](../../../tests/manual-profiles/profileManuals.spec.ts)
comprueba las pantallas con los permisos calculados por el código y datos simulados.
No demuestra la asignación de una cuenta real, su autenticación contra Express ni
la persistencia de operaciones. El modo dev requiere la cuenta y datos preparados
del entorno de capacitación, siguiendo el [procedimiento](../../governance/07-manual-accounts-and-files.md).

La autorización efectiva de las áreas se comprueba por separado en las pruebas
backend `permissionsTest.js` y `operationalAccessDbTest.js`. La revisión de Word/PDF
comprueba la presentación; una prueba de navegador aprobada no sustituye esa revisión.

La ubicación y el traslado de ediciones anteriores se comprueban en
[manualPathsTest.ts](../../../tests/unit/tooling/manualPathsTest.ts).
[manualPreparationTest.ts](../../../tests/unit/tooling/manualPreparationTest.ts)
cubre proveedores y materiales en páginas posteriores, medidas inválidas y
consultas fallidas. [manualCapture.spec.ts](../../../tests/e2e/manualCapture.spec.ts)
comprueba los tres cortes de Mermas con una referencia disponible en otro proveedor,
sin escrituras. La ausencia de ROLLO y el error HTTP conservan la captura pendiente.

El catálogo general excluye las ediciones locales por cuenta. El hash del recorrido
también las excluye: generar otra cuenta no invalida por sí solo la reanudación.
Las imágenes siguen orden numérico, incluidos `09`, `09a`, `09b` y `10`.

## Ejecución

[manualAuthenticationTest.ts](../../../tests/unit/tooling/manualAuthenticationTest.ts)
comprueba el contrato `SUCCESS_LOGIN`, el diagnóstico por estado HTTP y conexión,
y la ausencia de credenciales/cookies del error original en el mensaje. Un 200 con
HTML o un contrato distinto no permite continuar las capturas.
El recorrido HTTP inicia Vue si no está disponible y reutiliza un servidor existente
en modo `dev`; la demostración conserva su servidor aislado. Los orígenes HTTPS
locales requieren el servicio TLS preparado. `manualOptionsTest.ts` comprueba estas
particiones de host, puerto, modo y protocolo.

Registrar ambiente, revisión, fecha, comando, código de salida y artefactos como
evidencia EP conforme al [plan](../01-test-plan.md). No versionar resultados de una
corrida ni credenciales en esta ficha.

La variante de autorización `DP-VUE-MAN-004` filtra las fuentes reales de los tres
inventarios con lectura/escritura/costos, lectura/ajuste y sus particiones de rechazo.
El procedimiento de importación sólo aparece cuando la cuenta puede utilizarlo;
los bloques de cada operación conservan sus permisos. `manualProfilesTest.ts` ejecuta
esta tabla de decisión sin crear ni modificar registros de inventario.

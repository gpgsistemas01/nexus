# CP-VUE-MAN-001-01 — manual de inducción coherente con el acceso

## Diseño y trazabilidad

DP-VUE-MAN-001; riesgo de entregar instrucciones o imágenes de una función no
permitida, mezclar cuentas o registrar una operación para preparar una captura.
Tabla de decisiones por área, rol, permiso de tarea, estado del documento y
completitud de los artefactos. Es una prueba de la herramienta documental.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-MAN-001-01` | Dependencias frontend y Chromium; puerto 5177 libre. Fuentes curadas del manual, políticas de autorización vigentes y fixtures de navegador. No necesita base de datos ni credenciales reales para el modo demo. | Administrador en Sistemas; Auxiliar y Coordinador en Almacén; Coordinador y Operador en Impresión, Taller/Herrería, Acabados, Router y PT; Coordinador e Instalador en Instalaciones. Ejemplos existentes de inventario, compra, persona y salida Pendiente/Surtido. Variables de credenciales ficticias sólo en la prueba unitaria. | 1. Ejecutar las particiones de `manualProfilesTest.ts`. 2. Ejecutar `npm run docs:manuals -- --mode demo --all --capture-only`. 3. Revisar fuentes, imágenes y manifest de los perfiles. 4. Comprobar el caso de salida Surtida para Operador e Instalador. 5. Exportar representantes de Administrador, Almacén y área operativa. 6. Para comprobar recuperación, reanudar con `--missing` sin modificar las huellas y contrastar los PNG conservados. | Cada perfil tiene portada, índice, capítulos y capturas propios. Operativos muestran sólo los grupos Almacén/Salidas; no reciben procedimientos de ajustes, surtido o devolución, costos ni reportes. Almacén conserva surtido/devolución y administración conserva sus funciones adicionales. No se intentan escrituras de negocio. Directivas inválidas, rutas ajenas, cuentas inconsistentes o capturas pendientes impiden publicar. Una cuenta sin `expectedAccess` selecciona contenido desde los permisos de la sesión; una etiqueta de Administrador no eleva el acceso de Instalador. Los secretos no forman parte de las fuentes o del manifest. | Cerrar los contextos y el Vite temporal. Las unitarias eliminan sus directorios temporales. Los artefactos de `build/manuals`, `build/docs` y reportes permanecen ignorados para revisión; no modificar registros para limpiarlos. |

## Fuente ejecutable y alcance

[manualProfilesTest.ts](../../../tests/unit/tooling/manualProfilesTest.ts) comprueba
selección, configuración, secretos locales y rechazo de publicaciones incompletas.
[profileManuals.spec.ts](../../../tests/manual-profiles/profileManuals.spec.ts)
comprueba las pantallas con los permisos calculados por el código y datos simulados.
No demuestra la asignación de una cuenta real, su autenticación contra Express ni
la persistencia de operaciones. El modo live requiere la cuenta y datos preparados
del entorno de capacitación, siguiendo el [procedimiento](../../governance/07-manual-accounts-and-files.md).

La autorización efectiva de las áreas se comprueba por separado en las pruebas
backend `permissionsTest.js` y `operationalAccessDbTest.js`. La revisión de Word/PDF
comprueba la presentación; una prueba de navegador aprobada no sustituye esa revisión.

## Ejecución

Registrar ambiente, revisión, fecha, comando, código de salida y artefactos como
evidencia EP conforme al [plan](../01-test-plan.md). No versionar resultados de una
corrida ni credenciales en esta ficha.

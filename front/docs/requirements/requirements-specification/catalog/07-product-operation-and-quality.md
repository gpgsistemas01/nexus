# 4.7 Operación y calidad del producto

| ID | Requisito | Estado |
| --- | --- | --- |
| RC-SEG-001 | Las contraseñas deben almacenarse mediante hash y nunca como texto plano. | Implementado |
| RC-SEG-002 | Una operación protegida debe rechazar una sesión ausente o un permiso insuficiente antes de consultar información protegida o ejecutar cambios. | Implementado |
| RC-SEG-003 | Una ruta con cuerpo debe rechazar un tipo de contenido distinto del declarado antes de procesarlo. | Implementado |
| RC-SEG-004 | Los secretos y URLs con credenciales deben proceder de variables de entorno y no exponerse en logs. | Implementado |
| RC-DAT-001 | Las migraciones deben poder desplegarse de forma reproducible. | Implementado |
| RC-DAT-002 | Las pruebas con persistencia real deben usar `DATABASE_TEST_URL` y nunca la base de desarrollo. | Implementado |
| RC-PRU-001 | Las pruebas unitarias deben cubrir límites, decisiones, errores y efectos negativos del artefacto modificado. | Parcial |
| RC-PRU-002 | Las integraciones CRUD deben atravesar HTTP y comprobar la persistencia real con Prisma. | Parcial |
| RC-MAN-001 | Rutas, capas y pruebas deben organizarse por dominio. | Implementado |
| RC-MAN-002 | Antes de crear un flujo debe evaluarse la reutilización de fábricas CRUD y componentes compartidos. | Implementado |
| RC-DOC-001 | Los cambios en rutas, imports o Prisma deben dejar actualizados los documentos generados y superar `npm run docs:check`. | Implementado |
| RC-OBS-001 | Los fallos operacionales deben registrarse mediante logs estructurados. | Implementado |
| RC-OBS-002 | Los errores y logs expuestos al cliente no deben revelar secretos. | Implementado |
| RC-DES-001 | Si falta `DIRECT_URL` o falla una migración requerida, el contenedor debe terminar antes de iniciar la aplicación. | Implementado |
| RC-DES-002 | La aplicación debe usar `DATABASE_URL` y Prisma CLI debe preferir `DIRECT_URL` para migraciones. | Implementado |
| RC-COM-001 | El cliente debe instalarse y compilarse con una versión de Node.js admitida por `engines` de `front/package.json` y las dependencias fijadas en su lockfile. | Implementado |
| RC-COM-002 | La API debe intercambiar JSON salvo rutas declaradas para archivos o texto plano. | Implementado |
| RC-USA-001 | Una tabla en pantalla angosta debe conservar accesibles las acciones y datos prioritarios. | Implementado |
| RC-USA-002 | La interfaz debe presentar los errores de validación sin perder el contexto del formulario. | Implementado |
| RC-REN-001 | Los listados definidos como paginados deben obtener los datos aplicando filtros y límites de página, sin descargar el conjunto completo para paginarlo en el navegador. | Parcial |

## Alcance y comprobación de calidad

- **CA-RC-USA-001-1:** en una pantalla angosta el usuario puede alcanzar las acciones
  operativas y consultar los datos de la tabla mediante los controles de desplazamiento
  previstos; ocultar una columna no debe ocultar su única acción disponible.
- **CA-RC-USA-002-1:** un rechazo de validación identifica la información que debe
  corregirse y conserva el contexto del formulario para reintentar.
- **CA-RC-SEG-002-1:** la consulta de inventario debe omitir los costos cuando la
  cuenta no tenga permiso para leerlos. El cliente debe omitir su presentación y
  la API no debe incluir el valor protegido en la respuesta.
- `RC-PRU-001`, `RC-PRU-002` y `RC-REN-001` permanecen parciales. Un resultado positivo
  de la suite disponible no demuestra cobertura completa de esas obligaciones.

## Objetivos de calidad por definir

Las medidas y responsables de estos requisitos siguen pendientes de acuerdo.
Véase [Decisiones pendientes](../../vision-scope-and-requirements/04-open-decisions.md).

| ID | Definición necesaria | Estado |
| --- | --- | --- |
| RC-REN-002 | Tiempo máximo de respuesta por operación y carga: línea base, medida, umbral y responsable de aceptación. | Propuesto |
| RC-REN-003 | Volumen y concurrencia soportados: escenario, datos, usuarios simultáneos, umbrales y forma de prueba. | Propuesto |
| RC-DIS-001 | Disponibilidad del servicio: infraestructura, período de medida, objetivo y responsable de operación. | Propuesto |
| RC-DIS-002 | Recuperación y respaldo: tiempo de recuperación (RTO), pérdida de datos tolerada (RPO), infraestructura y forma de comprobación. | Propuesto |

## Restricción de construcción con identificador histórico

`RN-006` conserva su ID histórico para una condición de construcción relacionada
con `RC-MAN-002`.

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-006 | Un catálogo debe reutilizar el ciclo listar-crear-actualizar y sus componentes existentes cuando no cambien sus reglas, permisos ni persistencia. | Implementado |

## Responsabilidad de comprobación

| Ámbito | Dónde se comprueba |
| --- | --- |
| Contraseñas persistidas, autorización, migraciones, arranque y auditoría | Servicio API; el cliente consume sus resultados. |
| Captura, mensajes, navegación, tablas y paginación | Cliente Vue. |
| Contratos y publicación | Integración entre cliente, API y alojamiento. |

La [cobertura de pruebas](../../../testing/04-use-case-coverage.md) identifica las
comprobaciones disponibles y sus límites. La
[arquitectura](../../../architecture/index.md) explica cómo se implementan.

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

Esta sección incluye restricciones técnicas explícitas de seguridad, datos, construcción
y operación. Son requisitos de calidad, no pasos del actor ni reglas de dominio nuevas.
Su evidencia se consulta en el plan de pruebas, la
arquitectura y el
registro de aplicación de calidad.

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

Estas necesidades conservan su ID, pero todavía no tienen condiciones suficientes
para verificar cumplimiento. Sus medidas y responsables deben acordarse en el
[registro de pendientes](../../vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md).

| ID | Definición necesaria | Estado |
| --- | --- | --- |
| RC-REN-002 | Tiempo máximo de respuesta por operación y carga: línea base, medida, umbral y responsable de aceptación. | Propuesto |
| RC-REN-003 | Volumen y concurrencia soportados: escenario, datos, usuarios simultáneos, umbrales y forma de prueba. | Propuesto |
| RC-DIS-001 | Disponibilidad del servicio: infraestructura, período de medida, objetivo y responsable de operación. | Propuesto |
| RC-DIS-002 | Recuperación y respaldo: tiempo de recuperación (RTO), pérdida de datos tolerada (RPO), infraestructura y forma de comprobación. | Propuesto |

## Restricción de construcción con identificador histórico

`RN-006` se conserva por trazabilidad, pero su obligación es de construcción, no una
regla del negocio ni una acción del actor. Se revisa junto con `RC-MAN-002`.

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-006 | Un catálogo debe reutilizar el ciclo listar-crear-actualizar y sus componentes existentes cuando no cambien sus reglas, permisos ni persistencia. | Implementado |

## Responsabilidad y evidencia de calidad

Las obligaciones anteriores conservan su alcance de producto. Esta tabla identifica
qué puede comprobar el cliente y qué requiere evidencia del servicio que consume.

| Requisitos | Responsabilidad y comprobación |
| --- | --- |
| `RC-SEG-001` | La API protege el almacenamiento de contraseñas. Vue conserva su contenido al ingresar, no las guarda en Storage y no necesita implementar el hash persistente. |
| `RC-SEG-002`, `RC-SEG-003` | El cliente presenta acciones autorizadas y construye las solicitudes del contrato. La autorización y el rechazo del contenido HTTP se prueban también contra la API real. |
| `RC-SEG-004`, `RC-OBS-002` | Las variables públicas, mensajes y archivos del cliente se revisan para impedir exposición de secretos; los diagnósticos privados permanecen en el servidor. |
| `RC-DAT-001`, `RC-DES-001`, `RC-DES-002` | Son condiciones de migración y arranque del backend. El sitio estático no ejecuta Prisma ni requiere `DATABASE_URL` o `DIRECT_URL`; consume el servicio ya preparado. |
| `RC-DAT-002`, `RC-PRU-001`, `RC-PRU-002` | Las unitarias y pruebas de navegador con API simulada comprueban contratos e interacción. La suite de sistema utiliza servicios y base aislados; no equivale a cubrir todos los flujos persistentes. |
| `RC-MAN-001`, `RC-MAN-002`, `RN-006` | En Vue se comprueban módulos funcionales, separación de presentación/coordinación/transporte y reutilización de componentes y composables. Las capas privadas del servidor no se trasladan al cliente. |
| `RC-DOC-001` | Los cambios del cliente mantienen su documentación local y `docs:check`. Su referencia generada procede de TS/SFC; los cambios de Prisma se verifican en el servicio propietario. |
| `RC-OBS-001` | El servidor conserva sus logs operacionales; el cliente normaliza y presenta errores recuperables. Esta obligación no exige incorporar el logger privado al navegador. |
| `RC-COM-001`, `RC-COM-002` | La compilación usa el rango de Node declarado por `front/package.json`; la integración comprueba JSON y las respuestas de archivos o texto admitidas. |
| `RC-USA-001`, `RC-USA-002`, `RC-REN-001` | El navegador comprueba interacción en pantalla angosta, errores corregibles y consultas paginadas en los consumidores aplicables. |
| `RC-REN-002`, `RC-REN-003`, `RC-DIS-001`, `RC-DIS-002` | Permanecen propuestos hasta acordar y medir condiciones, límites y responsables; la compilación y las pruebas existentes no les asignan umbrales. |

La [arquitectura](../../../architecture/index.md) explica la realización y el
[plan de pruebas](../../../testing/01-test-plan.md) distingue niveles y límites de
evidencia. Las restricciones de persistencia y operación se mantienen como contexto
del producto y no se presentan como funciones implementadas dentro de Vue.

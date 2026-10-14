# 4.7 Operación y calidad del producto

| ID | Requisito y forma de comprobación | Estado |
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
| RC-COM-001 | La aplicación debe instalarse y ejecutarse en Node.js `>=22 <25`. | Implementado |
| RC-COM-002 | La API debe intercambiar JSON salvo rutas declaradas para archivos o texto plano. | Implementado |
| RC-USA-001 | Una tabla en pantalla angosta debe conservar accesibles las acciones y datos prioritarios. | Implementado |
| RC-USA-002 | La interfaz debe presentar los errores de validación sin perder el contexto del formulario. | Implementado |
| RC-REN-001 | Los listados cuyo flujo contempla paginación y filtros deben aplicarlos al obtener los datos; las consultas todavía no cubiertas conservan el estado Parcial. | Parcial |
| RC-REN-002 | Los tiempos máximos de respuesta requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-REN-003 | Los límites de concurrencia y volumen requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-DIS-001 | El objetivo de disponibilidad requiere infraestructura, medida y aprobación explícitas. | Propuesto |
| RC-DIS-002 | Los objetivos de recuperación y respaldo requieren RTO, RPO, infraestructura y aprobación explícitos. | Propuesto |

No se inventan umbrales de rendimiento o disponibilidad: deben acordarse con quien
opera el sistema y convertirse en una prueba o monitor reproducible antes de cambiar
su estado.

### Alcance y comprobación de calidad

Esta sección incluye restricciones técnicas explícitas de seguridad, datos, construcción
y operación. Son requisitos de calidad, no pasos del actor ni reglas de dominio nuevas.
Su evidencia se consulta en el [plan de pruebas](../../../testing/test-plan.md), la
[arquitectura](../../../architecture/index.md) y el
[registro de aplicación de calidad](../../../governance/standards-application/04-application-of-iso-iec-25010-to-requirements-of-quality.md).

- **CA-RC-USA-001-1:** en una pantalla angosta el usuario puede alcanzar las acciones
  operativas y consultar los datos de la tabla mediante los controles de desplazamiento
  previstos; ocultar una columna no debe ocultar su única acción disponible.
- **CA-RC-USA-002-1:** un rechazo de validación identifica la información que debe
  corregirse y conserva el contexto del formulario para reintentar.
- `RC-REN-002`, `RC-REN-003`, `RC-DIS-001` y `RC-DIS-002` son necesidades propuestas,
  no objetivos cuantitativos aprobados. Antes de verificar cumplimiento se deben acordar
  medida, carga o escenario, umbral, infraestructura, responsable y método de evaluación.
- `RC-PRU-001`, `RC-PRU-002` y `RC-REN-001` permanecen parciales. Un resultado positivo
  de la suite disponible no demuestra cobertura completa de esas obligaciones.

### Restricción de construcción con identificador histórico

`RN-006` se conserva por trazabilidad, pero su obligación es de construcción, no una
regla del negocio ni una acción del actor. Se revisa junto con `RC-MAN-002`.

| ID | Restricción verificable | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RN-006 | Un catálogo debe reutilizar el ciclo listar-crear-actualizar y sus componentes existentes cuando no cambien sus reglas, permisos ni persistencia. | Implementado | fábricas CRUD y servicios de catálogo compartidos |

# 4.7 Operación y calidad del producto

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RC-SEG-001 | Las contraseñas deben almacenarse mediante hash y nunca como texto plano. | Implementado |
| RC-SEG-002 | Una operación protegida debe rechazar una sesión ausente o un permiso insuficiente antes de consultar información protegida o ejecutar cambios. | Implementado |
| RC-SEG-003 | Una ruta con cuerpo debe rechazar un tipo de contenido distinto del declarado antes de procesarlo. | Implementado |
| RC-SEG-004 | Los secretos y URLs con credenciales deben proceder de variables de entorno y no exponerse en logs. | Implementado |
| RC-DAT-001 | Las migraciones deben poder desplegarse de forma reproducible. | Implementado |
| RC-OBS-001 | Los fallos operacionales deben registrarse mediante logs estructurados. | Implementado |
| RC-OBS-002 | Los errores y logs expuestos al cliente no deben revelar secretos. | Implementado |
| RC-DES-001 | Si falta `DIRECT_URL` o falla una migración requerida, el contenedor debe terminar antes de iniciar la aplicación. | Implementado |
| RC-DES-002 | La aplicación debe usar `DATABASE_URL` y Prisma CLI debe preferir `DIRECT_URL` para migraciones. | Implementado |
| RC-COM-001 | El backend debe instalarse y ejecutarse con una versión Node.js admitida por `engines` de `back/package.json` y las dependencias del lockfile (`^24.14.1` o `^26.12.1`). | Implementado |
| RC-COM-002 | La API debe intercambiar JSON salvo rutas declaradas para archivos o texto plano. | Implementado |
| RC-OPS-001 | El proceso debe responder `200` con `{ "status": "ok" }` en `/health/live` aunque PostgreSQL no esté disponible, para distinguir vida del proceso de disponibilidad de dependencias. | Implementado |
| RC-OPS-002 | `/health/ready` debe responder `200` con `{ "status": "ready" }` sólo cuando el proceso acepte tráfico y PostgreSQL responda; durante el arranque, cierre o fallo de base debe responder `503` con `{ "status": "unavailable" }` sin divulgar detalles internos. | Implementado |
| RC-USA-001 | Una tabla en pantalla angosta debe conservar accesibles las acciones y datos prioritarios. | Implementado |
| RC-USA-002 | La interfaz debe presentar los errores de validación sin perder el contexto del formulario. | Implementado |
| RC-REN-001 | Los listados cuyo contrato ofrece filtros y paginación deben aplicarlos en la consulta de servidor y devolver sólo la página solicitada, junto con el total cuando el contrato lo incluye. | Parcial |
| RC-REN-002 | Los tiempos máximos de respuesta requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-REN-003 | Los límites de concurrencia y volumen requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-DIS-001 | El objetivo de disponibilidad requiere infraestructura, medida y aprobación explícitas. | Propuesto |
| RC-DIS-002 | Los objetivos de recuperación y respaldo requieren RTO, RPO, infraestructura y aprobación explícitos. | Propuesto |

No se inventan umbrales de rendimiento o disponibilidad: deben acordarse con quien
opera Nexus y convertirse en una prueba o monitor reproducible antes de cambiar
su estado.

`RC-OPS-001` y `RC-OPS-002` se comprueban en `tests/unit/runtime/healthTest.js`;
la implementación propietaria está en `src/routes/system/healthRoute.js` y
`src/services/healthService.js`.

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
`RC-REN-001` permanece parcial mientras haya consultas que no apliquen el contrato de
paginación del lado servidor. Las prácticas de pruebas y organización del código se
definen en sus [documentos propietarios](../../../testing/test-plan.md) y en los
[estándares de código](../../../architecture/coding-standards/index.md), no como
requisitos de producto.

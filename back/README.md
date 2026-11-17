# Backend Nexus

API REST construida con Express 5 y Node.js. Prisma conecta con PostgreSQL; la
interfaz Vue consume los contratos HTTP y los recursos compartidos del backend.

## Preguntas sobre el sistema

- **¿Qué ofrece la API?** Consulta el [contrato OpenAPI](docs/architecture/openapi/index.md).
- **¿Cómo se organiza el backend y cómo persiste los datos?** Consulta la
  [arquitectura](docs/architecture/index.md), el [modelo Prisma](prisma/schema.prisma)
  y las [referencias de datos](docs/architecture/views/logical/data-and-persistence/index.md).
- **¿Qué reglas y resultados implementa?** Consulta [requisitos y casos de uso](../front/docs/requirements/index.md).
- **¿Cómo se comportan las operaciones?** Consulta las
  [secuencias y procesos](docs/architecture/views/processes/index.md).
- **¿Cómo se inicia en desarrollo, se valida o se exporta la documentación?** Sigue
  la [guía de desarrollo backend](docs/development/index.md).
- **¿Cómo se usa la interfaz?** Consulta los
  [manuales de Vue](../front/docs/user-manual/index.md).

## Estructura

```text
src/          Aplicación HTTP, rutas, controladores, servicios y persistencia
prisma/       Esquema y migraciones PostgreSQL
tests/        Pruebas unitarias, HTTP, integración y rendimiento
docs/         Arquitectura, pruebas y desarrollo
```

Las rutas componen los controladores; éstos coordinan entrada, validación y
respuestas. Los servicios aplican reglas de negocio y coordinan persistencia y
recursos compartidos. Prisma se instancia desde `src/lib/prisma.js`; el proceso
HTTP y Socket.IO se inicia en `src/server.js`, separado de la composición de
`src/app.js`.

Los contratos HTTP se mantienen en OpenAPI. Las reglas funcionales pertenecen a
requisitos y casos de uso; la arquitectura describe su realización técnica.
Las referencias marcadas como generadas se derivan del código y no se editan a
mano.

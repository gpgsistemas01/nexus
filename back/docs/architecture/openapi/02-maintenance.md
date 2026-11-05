# 2. Mantenimiento de la documentación API

[OpenAPI](openapi.json) es la fuente de métodos, parámetros, cuerpos, respuestas y
seguridad. Edite sus archivos por dominio y reutilice componentes. Mantenga
`operationId` estable, resúmenes breves y ejemplos ficticios válidos.

Desde `back/`:

```bash
npm run docs:check
npm run docs:api:lint
npm run docs:api:bundle
npm run docs:export -- arquitectura contrato-api ambos
```

| Comprobación o salida | Alcance |
| --- | --- |
| `docs:check` | Referencias, grupos, IDs, parámetros, seguridad y respuestas; compara las operaciones con las rutas registradas. |
| `docs:api:lint` | Redocly CLI 2.72.1 valida OpenAPI con sus reglas recomendadas. La primera ejecución descarga la herramienta. |
| `docs:api:bundle` | Genera `build/docs/openapi/openapi.json`, autocontenido para visores compatibles con OpenAPI 3.1. |
| Exportación | Publica esta colección en Word/PDF y genera el contrato JSON. Revisar los archivos antes de distribuirlos. |

Los validadores comprueban la descripción; las pruebas HTTP verifican el comportamiento.
Las reglas de negocio permanecen en requisitos y las vistas EJS en su propia colección.

## Referencias adoptadas

| Fuente | Aplicación |
| --- | --- |
| [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) | Formato procesable del contrato HTTP. |
| [Reglas de Redocly](https://redocly.com/docs/cli/rules/built-in-rules) | Comprobaciones habituales de calidad; no son una norma ISO. |
| [Autenticación por cookies en Swagger](https://swagger.io/docs/specification/v3_0/authentication/cookie-authentication/) | Modelo `apiKey` en cookie. Los visores web no pueden establecer libremente cookies desde «Try it out»; los ejemplos curl conservan una sesión real. |

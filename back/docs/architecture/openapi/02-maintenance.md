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

## Swagger UI en desarrollo

Con las dependencias de desarrollo instaladas, inicie la API:

```bash
npm run dev
```

Abra `http://localhost:3000/api-docs/`; use el puerto configurado si es distinto.
El visor consume `/api-docs/openapi.json`, generado desde el contrato existente
con sus referencias resueltas. Al recargar el documento se leen las fuentes actuales;
no se mantienen anotaciones Swagger paralelas en los controladores.

Para probar una operación protegida:

1. Abra `POST /api/auth/login`, pulse **Try it out**, complete sus credenciales de desarrollo y pulse **Execute**.
2. El navegador conserva las cookies `HttpOnly` de la respuesta. Pruebe `GET /api/auth/me` y continúe con las operaciones permitidas para esa cuenta.
3. Use `POST /api/auth/refresh` para renovar una sesión vencida. El visor no realiza la recuperación automática de Vue.

**Execute** envía solicitudes reales a la API del mismo origen. Las cookies se
obtienen por login; el botón **Authorize** no permite establecer cookies `HttpOnly`.
El visor conserva las comprobaciones de autenticación y permisos de cada endpoint.

Swagger UI y sus paquetes son herramientas de desarrollo. Con
`NODE_ENV=production`, `/api-docs` y sus recursos responden 404; la imagen final
Docker omite las dependencias de desarrollo y las fuentes documentales.

## Referencias adoptadas

| Fuente | Aplicación |
| --- | --- |
| [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) | Formato procesable del contrato HTTP. |
| [Reglas de Redocly](https://redocly.com/docs/cli/rules/built-in-rules) | Comprobaciones habituales de calidad; no son una norma ISO. |
| [Autenticación por cookies en Swagger](https://swagger.io/docs/specification/v3_0/authentication/cookie-authentication/) | Modelo `apiKey` en cookie. El visor usa las cookies recibidas del login en el mismo origen; el navegador impide establecerlas desde Authorize. |

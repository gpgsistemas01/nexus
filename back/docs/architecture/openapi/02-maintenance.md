# Mantenimiento del contrato

[OpenAPI](openapi.json) es la fuente de rutas, parámetros, esquemas y respuestas.
Edite el archivo del dominio y reutilice componentes.

Desde `back/`:

```bash
npm run docs:check
npm run docs:api:lint
npm run docs:api:bundle
npm run docs:export -- arquitectura contrato-api ambos
```

`docs:check` compara la descripción con las rutas; `docs:api:lint` valida OpenAPI;
`docs:api:bundle` genera una versión autocontenida. La exportación produce Word/PDF.

## Probar en desarrollo

Ejecute `npm run dev` y abra `http://localhost:3000/api-docs/` (o el puerto configurado).
Use `POST /api/auth/login` para habilitar cookies y probar las rutas autorizadas.
**Execute** envía solicitudes reales; Swagger UI no configura cookies `HttpOnly` desde
**Authorize** ni ejecuta la renovación automática de Vue. `/api-docs` sólo está activo
en desarrollo.

Referencia: [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.html).

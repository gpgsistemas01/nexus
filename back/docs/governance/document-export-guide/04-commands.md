# 4. Comandos

Ejecute los comandos técnicos desde `back/`.

| Objetivo | Comando |
| --- | --- |
| Validar arquitectura de la API | `npm run docs:export -- arquitectura backend --check-sources` |
| Exportar contrato HTTP y OpenAPI | `npm run docs:export -- arquitectura contrato-api ambos` |
| Exportar desarrollo del backend | `npm run docs:export -- arquitectura desarrollo ambos` |
| Exportar la documentación Vue | `npm run docs:export -- arquitectura frontend-vue ambos` |

Los manuales y capturas se ejecutan desde `front/`, en dos pasos:
`npm run docs:screenshots -- --profile <id>` y después
`npm run docs:manuals -- --profile <id>`. La [guía Vue](../../../../front/docs/development/00-commands.md)
conserva sus opciones, cuentas y rutas de salida. `manual-vue` identifica las fuentes
del manual cuando lo invoca la herramienta compartida de exportación.

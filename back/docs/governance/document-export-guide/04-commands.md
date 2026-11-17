# 4. Comandos

Ejecute desde `back/`:

| Objetivo | Comando |
| --- | --- |
| Comprobar documentos generados y OpenAPI | `npm run docs:check` |
| Validar fuentes de arquitectura backend | `npm run docs:export -- arquitectura backend --check-sources` |
| Validar fuentes e imágenes del paquete | `npm run docs:export -- arquitectura backend --check` |
| Exportar contrato HTTP y OpenAPI | `npm run docs:export -- arquitectura contrato-api ambos` |
| Exportar desarrollo del backend | `npm run docs:export -- arquitectura desarrollo-backend ambos` |
| Exportar gobernanza backend | `npm run docs:export -- gobernanza ambos` |

`--check-sources` valida las fuentes y declara las referencias de imagen;
`--check` también exige que sus archivos existan. Ninguno genera DOCX o PDF.

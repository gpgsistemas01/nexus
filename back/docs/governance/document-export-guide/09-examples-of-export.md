# 9. Ejemplos de exportación

Desde `back/`:

```bash
npm run docs:export -- arquitectura backend --check
npm run docs:export -- arquitectura backend docx
npm run docs:export -- arquitectura contrato-api ambos
npm run docs:export -- datos ambos
npm run docs:export -- pruebas pdf
npm run docs:export -- gobernanza ambos
```

La exportación se ejecuta en desarrollo o CI. Los resultados se guardan bajo
`build/docs/` y no se versionan.

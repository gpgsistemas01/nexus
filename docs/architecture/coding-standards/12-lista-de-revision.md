# 12. Lista de revisión

Antes de confirmar un cambio se verifica:

1. ¿Se reutilizó un flujo, factory, helper, parcial o componente existente antes de crear
   otro?
2. ¿Nombres, archivos y orden de operaciones expresan el dominio y la capa?
3. ¿Imports y exports están completos, directos y sin símbolos sin uso, y cada alias
   responde a un contrato compartido o una colisión documentable?
4. ¿Indentación, saltos de línea, espacios, comillas y fin de archivo respetan el área
   modificada?
5. ¿La escritura compuesta conserva transacción, autorización, auditoría y errores?
6. ¿Las pruebas están en la ubicación declarada y verifican el CRUD o regla afectada?
7. ¿Las vistas reutilizan componentes y preservan la última línea EJS?
8. ¿La documentación curada y generada quedó sincronizada?

La revisión mínima ejecuta las pruebas relacionadas, la suite unitaria,
`npm run docs:check` y `git diff --check`. La integración se ejecuta con la base aislada
cuando el cambio afecta persistencia, transacciones, routers CRUD o esquema.

# Reglas para código que genera diagramas

El generador sigue el patrón **extraer → normalizar → representar → comprobar/escribir**:

1. extrae rutas e imports desde `src` y modelos desde `prisma/schema.prisma`;
2. normaliza rutas, áreas, entidades y relaciones en estructuras intermedias;
3. representa tablas y bloques Mermaid mediante funciones sin modificar las fuentes;
4. con `--check` compara el resultado esperado sin escribir, y sin esa opción actualiza
   únicamente `docs/generated`.

Para extenderlo se reutilizan funciones de recorrido y representación antes de crear
otro script. Las listas como `SOURCE_AREAS` y `DATABASE_AREAS` son configuración
declarativa; una nueva área se incorpora allí y debe producir una salida determinista.
Los elementos y relaciones se ordenan para evitar diferencias accidentales. El código
generador nunca debe inferir actores, motivaciones, permisos efectivos o decisiones de
negocio: ésas permanecen en diagramas curados.

# Comportamiento transversal de implementación

Los recorridos de cada operación permanecen en sus secuencias `DIA-BE-CU-*` y
`DIA-FE-CU-*`. Esta colección conserva sólo auditoría, renovación de sesión y estados
locales de formulario y colaboraciones de helpers que responden preguntas compartidas
o de ciclo de vida.

1. [Auditoría de escrituras](01-write-audit.md).
2. [Sesión HTTP y estados de formularios](02-browser-session-and-form-state.md).
3. [Colaboraciones de los helpers CRUD](03-crud-helper-collaborations.md).

Cancelación, surtimiento, corrección y alta de merma se consultan en las secuencias de
sus casos, sin conservar otro gráfico del mismo recorrido. Los mapas generales de imports,
configuración y puntos de extensión pertenecen a desarrollo. Las composiciones junto a
los casos identifican sus archivos concretos de construcción y colaboración.

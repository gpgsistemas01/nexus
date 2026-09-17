# 1. Propósito y alcance

Este documento profundiza el [mapa visual de requisitos](../diagrams/index.md).
Define una línea base revisable de capacidades, reglas y atributos de calidad sin
confundir tres conceptos diferentes:

- **requisito:** comportamiento o restricción que el producto debe cumplir;
- **evidencia:** código, ruta, modelo o prueba que permite comprobarlo;
- **estado:** grado en que la evidencia actual satisface el requisito.

El alcance actual comprende autenticación, administración de identidades, catálogos,
compras, inventario de materiales, inventario de merma, salidas, devoluciones,
movimientos y reportes. El contrato OpenAPI de las operaciones registradas forma parte
de la línea base; una interfaz completa de requisiciones y los objetivos de nivel de
servicio permanecen fuera de la línea base implementada.

Este documento no sustituye historias de usuario, diseños de pantalla ni el contrato
HTTP. El [contrato API](../../architecture/api-contract/index.md), el
[mapa generado](../../generated/code-map.md) y el esquema Prisma aportan esos otros niveles
de detalle. Su estructura adopta selectivamente las prácticas de ingeniería de
requisitos descritas en el [criterio sobre normas documentales](../../governance/documentation-standards.md),
sin declarar conformidad o certificación ISO.

Los objetivos de actor, con participantes, precondiciones, garantías, pasos, flujos
alternativos y excepciones, se describen por familias en el
[catálogo de casos de uso](../use-cases/index.md). Los
requisitos de este archivo conservan los criterios verificables y la evidencia sin
duplicar allí la narrativa de interacción.

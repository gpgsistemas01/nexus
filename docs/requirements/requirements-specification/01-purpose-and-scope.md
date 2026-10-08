# 1. Propósito y alcance

Este documento, junto con las [fichas de casos de uso](../use-cases/index.md), define una
línea base revisable de capacidades, reglas y atributos de calidad sin
confundir tres conceptos diferentes:

- **requisito:** comportamiento o restricción que el producto debe cumplir;
- **evidencia:** código, ruta, modelo o prueba que permite comprobarlo;
- **estado:** grado en que la evidencia actual satisface el requisito.

El alcance actual comprende autenticación, administración de identidades, catálogos,
compras, inventarios separados de materiales, consumibles y mermas, salidas, devoluciones,
movimientos y reportes. Las requisiciones permanecen fuera del alcance vigente; la administración de proyectos
está modelada y los objetivos de nivel de servicio siguen propuestos, sin valores acordados.

Este documento no sustituye historias de usuario, diseños de pantalla ni el contrato
HTTP. El [contrato API](../../architecture/openapi/api-contract.md) describe los intercambios; el
[mapa generado](../../architecture/views/development/code-map.md) localiza realizaciones técnicas
y Prisma representa los datos. Ninguno de ellos sustituye el acuerdo del requisito. Su estructura adopta selectivamente las prácticas de ingeniería de
requisitos descritas en el [criterio sobre normas documentales](../../governance/documentation-standards/index.md),
sin declarar conformidad o certificación ISO.

Los objetivos de actor, con participantes, precondiciones, garantías, pasos, flujos
alternativos y excepciones, se describen por familias en el
[catálogo de casos de uso](../use-cases/index.md). Los
requisitos de esta colección conservan los criterios verificables y la evidencia sin
duplicar allí la narrativa de interacción.

# 1. Propósito y mantenimiento

Estos diagramas representan manualmente la estructura observable del código actual. No los
produce `scripts/generateArchitectureDocs.js`: se revisan en el mismo cambio que modifica
routers, capas, coordinación de servicios o componentes reutilizables. El
[mapa generado](../code-map.md) sigue siendo el inventario verificable de rutas
e imports; estas representaciones agrupan esa evidencia para que una persona pueda comprenderla
sin recorrer todos los archivos.

En las secuencias, las flechas continuas representan llamadas y las discontinuas,
retornos. En los clasificadores UML, `..>` representa dependencia, `<|..` realización,
`<|--` generalización y `*--` composición con propiedad del ciclo de vida. Los
estereotipos describen responsabilidades y no convierten módulos ES en clases.
Los flujos y mapas conservan su propia leyenda cuando Mermaid no ofrece el tipo UML.
Ninguna asociación concede permisos ni convierte una ruta
en caso de uso. Los objetivos del actor se mantienen en el
[diagrama de casos de uso](../../../../requirements/domain-and-use-cases/02-current-use-cases.md).

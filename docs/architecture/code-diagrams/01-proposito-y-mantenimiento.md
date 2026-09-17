# 1. Propósito y mantenimiento

Estas vistas representan manualmente la estructura observable del código actual. No las
produce `scripts/generateArchitectureDocs.js`: se revisan en el mismo cambio que modifica
routers, capas, coordinación de servicios o componentes reutilizables. El
[mapa generado](../../generated/code-map.md) sigue siendo el inventario verificable de rutas
e imports; estos diagramas agrupan esa evidencia para que una persona pueda comprenderla
sin recorrer todos los archivos.

Las flechas continuas significan llamada o delegación; las discontinuas significan
configuración o reutilización. Ninguna asociación concede permisos ni convierte una ruta
en caso de uso. Los objetivos del actor se mantienen en el
[diagrama de casos de uso](../../requirements/domain-and-use-cases/03-casos-de-uso-vigentes.md).

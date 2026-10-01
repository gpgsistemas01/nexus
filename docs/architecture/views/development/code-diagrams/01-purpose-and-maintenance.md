# 1. Propósito y mantenimiento

Estos diagramas representan manualmente la estructura observable del código actual. No los
produce `scripts/generateArchitectureDocs.js`: se revisan en el mismo cambio que modifica
routers, capas, coordinación de servicios o componentes reutilizables. El
[mapa generado](../code-map.md) sigue siendo el inventario verificable de rutas
e imports; estas representaciones agrupan esa evidencia para que una persona pueda comprenderla
sin recorrer todos los archivos.

Las flechas continuas significan llamada o delegación; las discontinuas significan
configuración o reutilización. Ninguna asociación concede permisos ni convierte una ruta
en caso de uso. Los objetivos del actor se mantienen en el
[diagrama de casos de uso](../../../../requirements/domain-and-use-cases/03-current-use-cases.md).

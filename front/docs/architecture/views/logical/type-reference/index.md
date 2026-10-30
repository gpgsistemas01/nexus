# Referencia de contratos TypeScript

Generado desde `src/` con `npm run docs:generate`. No editar manualmente.

Se inspeccionan 173 archivos TS/SFC y se describen 223 contratos declarados.

| Ámbito | Contratos | Miembros directos |
| --- | --- | --- |
| [app](app.md) | 10 | 21 |
| [auth](auth.md) | 11 | 20 |
| [catalogs](catalogs.md) | 13 | 37 |
| [directory](directory.md) | 12 | 35 |
| [identity](identity.md) | 20 | 82 |
| [issues](issues.md) | 37 | 162 |
| [movements](movements.md) | 10 | 38 |
| [purchases](purchases.md) | 37 | 162 |
| [warehouse](warehouse.md) | 31 | 156 |
| [shared](shared.md) | 42 | 157 |

## Alcance y notación

Incluye interfaces, aliases, clases, enums y contratos tipados de props, eventos y slots declarados en `src/`.
Cada contrato conserva su nombre, fuente y firmas. Los objetos anónimos y callbacks permanecen en la declaración que los contiene.
Las uniones, intersecciones y utilidades como Pick, Record o ReturnType se presentan tal como están escritas, sin expandirlas en estructuras inferidas.
Las tablas relacionan sólo contratos propios mencionados en las propiedades, parámetros, aliases y cláusulas extends/implements. Los tipos externos conservan su nombre dentro de las firmas.
La organización por ámbito sigue las carpetas de `src/`. Los retornos sin anotación se consultan en el código y en su referencia de exports.
Los [modelos estructurales](../class-and-type-models/index.md) presentan los diagramas seleccionados por responsabilidad; esta referencia reúne las declaraciones para consulta.

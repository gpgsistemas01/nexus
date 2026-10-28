# Referencia completa de contratos TypeScript

Generado desde `src/` con `npm run docs:generate`. No editar manualmente.

Se inspeccionan 173 archivos TS/SFC y se describen 633 contratos declarados o inferidos.

| Ámbito | Contratos | Miembros directos |
| --- | --- | --- |
| [app](app.md) | 21 | 88 |
| [auth](auth.md) | 21 | 51 |
| [catalogs](catalogs.md) | 35 | 125 |
| [directory](directory.md) | 23 | 87 |
| [identity](identity.md) | 52 | 239 |
| [issues](issues.md) | 126 | 707 |
| [movements](movements.md) | 26 | 117 |
| [purchases](purchases.md) | 100 | 485 |
| [warehouse](warehouse.md) | 99 | 610 |
| [shared](shared.md) | 130 | 552 |

## Alcance y notación

Incluye interfaces, aliases, clases, enums, props/eventos/slots tipados y objetos inline declarados en tipos. También inspecciona objetos públicos y retornos públicos de objeto mediante el checker de TypeScript.
Cada miembro directo conserva su firma completa. Las propiedades heredadas se consultan siguiendo `extends`.
Los aliases conservan uniones, intersecciones, keyof, Record, Pick, Exclude y ReturnType tal como están declarados.
Las relaciones se obtienen de referencias de tipo y de las cláusulas extends/implements, no de campos cuyo nombre termine en Id.
Asociación: propiedad estructural con multiplicidad. Dependencia discontinua: uso de un tipo, callback, unión o parámetro genérico.
Un destino sin ficha local es una referencia externa, un valor de typeof o un parámetro genérico; no se expande el código de dependencias. Los saltos de línea de las etiquetas sólo distribuyen su nombre para facilitar lectura.
Las formas object/callback/tuple/complex en una figura remiten a la firma completa de su tabla; no se omite ningún miembro.
Las firmas inferidas sin anotación se identifican como inferred/signature; los estados inferidos de funciones se distinguen de las interfaces escritas explícitamente en el código.
Los contratos SFC nombrados por contexto son formas estructurales, no clases de componentes Vue.
La forma evaluated_alias desarrolla campos de aliases como Record, Pick o ReturnType cuando el compilador puede resolverlos. La definición original se conserva junto a esa estructura evaluada. La relación de datos no representa el orden de ejecución. El [modelo curado](../class-and-type-models/index.md) explica los cortes y responsabilidades.

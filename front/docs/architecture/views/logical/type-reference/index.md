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
Cada miembro directo conserva su firma completa. La herencia local se consulta siguiendo extends; las bases externas sólo se nombran en la declaración del contrato.
Los aliases conservan uniones, intersecciones, keyof, Record, Pick, Exclude y ReturnType tal como están declarados.
Las relaciones se obtienen de referencias de tipo y de las cláusulas extends/implements, no de campos cuyo nombre termine en Id.
Asociación: propiedad estructural con multiplicidad. Dependencia discontinua: uso de un tipo, callback, unión o parámetro genérico.
Las figuras y las tablas de relaciones sólo incluyen contratos identificados en src/. Incluyen los modelos del negocio y los contratos propios de componentes, transporte y coordinación, que permiten explicar los patrones aplicados.
Las tecnologías utilizadas son Vue, TypeScript, Axios y VeeValidate. Sus clases externas no se dibujan; sus tipos y utilidades conservan el nombre en las firmas únicamente cuando el contrato lo necesita.
Los destinos sin atributos remiten a su propia ficha local. Los saltos de línea de las etiquetas sólo distribuyen su nombre para facilitar lectura.
La división por ámbito sigue las carpetas de src/. Cada contrato se presenta en una figura mientras no supere 16 miembros o 4 destinos distintos por grupo. Los contratos mayores se dividen para mantener legible la exportación; las propiedades se agrupan con sus relaciones. Las partes se numeran únicamente cuando hay varias figuras del mismo contrato.
Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.
Las formas object/callback/tuple/complex en una figura remiten a la firma completa de su tabla; no se omite ningún miembro.
Las firmas inferidas sin anotación se identifican como inferred/signature; los estados inferidos de funciones se distinguen de las interfaces escritas explícitamente en el código.
Los contratos SFC nombrados por contexto son formas estructurales, no clases de componentes Vue.
La forma evaluated_alias desarrolla campos de aliases como Record, Pick o ReturnType cuando el compilador puede resolverlos. La definición original se conserva junto a esa estructura evaluada. La relación de datos no representa el orden de ejecución. El [modelo curado](../class-and-type-models/index.md) explica los cortes y responsabilidades.

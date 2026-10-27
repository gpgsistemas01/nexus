# 3. Catálogos administrables

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `catalogs`. El [corte de componentes](../../logical/components/03-catalogs.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `CatalogPage` / `useCatalogList` | Consulta, recurso, permisos y editor. |
| `CatalogEditorPage` / `useCatalogEditor` | Conectar presentación, esquema e interacción de captura. |
| `catalogDefinition` / `buildCatalogPayload` | Lista blanca de recursos, límites, campos y versión por modo. |
| `CatalogForm` / `CatalogTable` | Props, eventos y presentación reutilizada. |
| `catalogService` | GET/POST/PUT, contrato de fila/versiones y confirmación. |

## Datos y operaciones

| Elemento | Contrato |
| --- | --- |
| Recursos | Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste y Estados de cumplimiento. |
| Acceso | `catalogs:manage` para vista y mantenimiento; recurso desconocido no construye endpoint arbitrario. |
| Captura | Nombre y Activo; símbolo sólo para Unidades. Límites desde definición pública. |
| Edición | `expectedVersion` de apertura; 409 conserva captura y requiere nueva lectura. |
| Consulta | Búsqueda/paginación remotas, nombre recibido presentado como texto. |
| Efectos | Alta/edición; no inventar eliminación donde no existe. |

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Consulta compartida | [Consulta compartida](../../processes/02-list-and-record-save.md) |
| Alta y edición versionadas | [Alta y edición versionadas](../../processes/05-catalog-record-save.md) |

Los [estados de captura y documento](../../logical/document-states.md) complementan las secuencias; los [patrones](../design-and-construction-patterns/index.md) conservan modelo general y aplicación específica.

## Evidencia

catalogEditorTest.ts, catalogServiceTest.ts, catalogListTest.ts y catalogs.spec.ts. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.

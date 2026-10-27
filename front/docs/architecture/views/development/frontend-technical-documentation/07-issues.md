# 7. Salidas

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `issues`. El [corte de componentes](../../logical/components/07-issues.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `IssueWorkspace` | Alta auxiliar de cliente con retorno al documento. |
| `IssuePage` / `useIssueActions` | Listado, lectura vigente, permisos y resolución del modo. |
| `useIssueEditor` | Captura por modo y coordinación de guardar; sin devolución desde el guardado general. |
| `useIssueHeaderSelection` | Clientes/personas/áreas y limpieza dependiente. |
| `useIssueDepartments` | Consulta autorizada reutilizada por filtros y encabezado; asigna y bloquea una única área disponible sin confundir búsqueda o paginación con alcance. |
| `issueLookupService` | Solicita áreas con `context=issues`; el servidor filtra por asignaciones autorizadas. No deduce el alcance a partir del nombre del rol en Vue. |
| `useIssueLineEntry` / `issueDetails` | Borrador y selección de surtido sin mutar documento leído. |
| `useIssueReturn` | Cantidad/observaciones y frontera de saldo entregado. |
| Mappers y `issueService` | Request por modo, validación de respuesta y códigos de su recurso. |

## Datos y operaciones

| Modo | Contrato |
| --- | --- |
| create | Encabezado y detalles de Materiales, Consumibles o Mermas; sin descuento local de stock. |
| edit | Captura completa admitida antes del surtido; protege detalles originales no editables. |
| header | Sólo encabezado tras resolución por estado; PATCH /header. |
| supply | Selección de detalles y cantidad convertida de proyecto; PATCH /details. |
| view | Documento y detalles en consulta; no guarda. |
| return | Editor de devolución separado; positivo hasta saldo leído, PATCH /details/:id/returns. |
| Recurso | materials/consumables usan goods-issues; wastes usa waste-issues y sus códigos. |
| Estado vigente | La apertura relee; la API comprueba de nuevo permiso, pertenencia y saldo en escritura. |

Auxiliar y Coordinador de Almacén pueden consultar y registrar salidas para todas
las áreas. Los accesos operativos sólo consultan, crean y editan documentos de sus
áreas autorizadas. El alcance se aplica por igual a Materiales, Consumibles y Mermas.
El selector de área y el filtro usan el mismo contexto de consulta. Alterar una URL,
un ID o el payload no sustituye la autorización del servidor.

Una respuesta sin búsqueda, de la primera página y con total filtrado `1`, permite
precargar y bloquear el área si la opción está disponible. Una búsqueda con un solo
resultado o una página parcial no permite inferir ese bloqueo. Las respuestas
canceladas no actualizan la instancia anterior. El alta precarga únicamente una
selección vacía; la edición conserva el área, solicitante y proyecto originales.
Los solicitantes se cargan por la dependencia reactiva del área elegida. Limpiar
filtros mantiene el área obligatoria y no la cuenta como un filtro opcional activo.

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Apertura y escritura | [Apertura y escritura](../../processes/16-issue-open-save.md) |
| Surtido | [Surtido](../../processes/17-issue-supply.md) |
| Devolución | [Devolución](../../processes/18-issue-return.md) |
| Alta contextual | [Alta contextual](../../processes/03-documents-and-contextual-creation.md) |
| Reportes | [Reportes](../../processes/19-reports.md) |

Los [estados de captura y documento](../../logical/document-states.md) complementan las secuencias; los [patrones](../design-and-construction-patterns/index.md) conservan modelo general y aplicación específica.

## Evidencia

issueTest.ts, issues.spec.ts y selectCreation.spec.ts en los tres recursos. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.

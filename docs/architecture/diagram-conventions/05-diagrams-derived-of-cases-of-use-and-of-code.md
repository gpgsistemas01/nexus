# 5. Diagramas derivados de casos de uso y de código

La revisión separa dos preguntas que no deben resolverse con la misma fuente. Los casos
de uso explican **por qué y para quién** ocurre una operación; el código permite afirmar
**qué está registrado o conectado**. «Generado» significa que el contenido puede
reconstruirse de manera determinista, no que una herramienta deba inventar semántica de
negocio.

| Origen | Diagrama necesario | Estado y ubicación | Razón para generarlo o mantenerlo curado |
| --- | --- | --- | --- |
| Casos `CU-*` | Casos de uso por actor y límite de Nexus | Curado en `domain-and-use-cases/index.md`. | Actores, objetivos y asociaciones requieren decisión funcional; no se infieren de una ruta. |
| Casos `CU-*` | Flujo de actividad y vista técnica complementaria de cada objetivo | Curado por familia en `requirements/diagrams/`. | El primero representa escenario exitoso, decisiones y resultado; la segunda hace visible su ejecución entre capas o la bifurcación que el flujo omite, sin fusionar objetivos. |
| Casos con estados | Máquina de estados de salidas, surtimientos y devoluciones | Curada en requisitos. | Los nombres y transiciones combinan reglas y cantidades; el código es evidencia, no única fuente normativa. |
| Casos transaccionales | Secuencia específica cuando la coordinación técnica aporta información adicional | Curada en requisitos o en la referencia técnica correspondiente y enlazada al servicio. | Explica el límite atómico y rollback del caso sin fusionarlo con otra operación. |
| Código de routers | Superficie API/Web por área y método | Curada en `code-diagrams/index.md` y comprobada contra el mapa de rutas. | Montajes y métodos son verificables, pero la vista se actualiza explícitamente junto al cambio para conservar agrupaciones comprensibles. |
| Código JavaScript | Dependencias entre áreas | Generada en `generated/code-map.md`. | Los `import` relativos permiten reconstruir aristas deterministas. |
| Prisma | Entidad-relación por área | Generada en `generated/database-schema.md`. | Modelos, claves y relaciones pertenecen al esquema versionado. |
| Código + `CU-*` | Trazabilidad de cada caso hacia endpoint, permiso, servicio y prueba | Matriz curada, no diagrama automático por ahora. | Asociar una ruta con un objetivo exige interpretación; coincidir por verbo o nombre produciría falsos vínculos. |

### Diagramas descartados en la revisión

- **Una secuencia genérica aplicada a varios `CU-*`:** ocultaría diferencias de endpoint,
  participantes, modelos y errores. Sólo los casos cuya coordinación aporta información
  necesitan vista técnica; cuando existe, ésta nombra exclusivamente los elementos del
  objetivo documentado y la reutilización queda en la ficha o vista estructural.
- **Un diagrama de clases generado desde JavaScript:** la aplicación no declara clases de
  dominio equivalentes al modelo conceptual; los imports no permiten inferirlas.
- **Casos de uso generados desde endpoints:** `POST`, `PATCH` o `GET` no revelan actor,
  intención, precondición ni resultado esperado.
- **Permisos inferidos desde vistas o nombres de carpeta:** la autorización efectiva
  depende de middleware y configuración; debe verificarse en la matriz de operaciones.
- **Un grafo con los 61 endpoints como nodos:** el inventario tabular conserva el detalle
  de forma más legible; el diagrama curado agrupa la superficie por área y operación.

Al agregar un caso se actualizan las vistas curadas y su trazabilidad. Al cambiar un
router también se revisa manualmente `code-diagrams/index.md`; al cambiar rutas, imports o
Prisma se ejecuta además `npm run docs:architecture` para comprobar los inventarios. Si
una asociación caso-código llega a tener una fuente declarativa versionada, podrá
generarse entonces; hasta ese momento permanece curada para no presentar heurísticas
como hechos.

Contexto y contenedores pueden inspirarse en C4, y secuencias o estados pueden usar
conceptos habituales de UML, pero se documenta sólo la semántica realmente empleada.
ISO/IEC/IEEE 42010 orienta la separación entre preocupaciones, puntos de vista y vistas;
no obliga a utilizar UML, C4, Mermaid ni una herramienta concreta.

# Arquitectura y construcción de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.2 | 1.0.0 | En revisión | 2026-10-08 | Equipo Nexus |

## Propósito

Este índice presenta la documentación arquitectónica por pregunta y nivel de detalle.
Es la portada y entrada del **documento de arquitectura** exportable; no repite decisiones
ni diagramas que tienen un capítulo propietario. Nexus se describe como un **monolito
modular por dominio con arquitectura por capas** y una correspondencia de **MVC web
extendido**.

## Relación con visión, SRS y casos de uso

Arquitectura responde **cómo** está organizada la solución y cómo satisface las
obligaciones del sistema. No es propietaria del propósito y alcance de negocio ni de la
conducta normativa de los actores:

| Fuente | Responsabilidad | Uso desde arquitectura |
| --- | --- | --- |
| [Visión y alcance](../requirements/vision-scope-and-requirements/index.md) | Define por qué existe el producto, sus interesados y sus límites. | Alimenta el contexto y las preocupaciones arquitectónicas. |
| [SRS](../requirements/requirements-specification/index.md) y [casos de uso](../requirements/use-cases/index.md) | Definen qué debe hacer el sistema, sus reglas y los flujos actor–Nexus. | Aportan los `CU-*` y requisitos que la solución debe realizar. |
| Este documento de arquitectura | Define estructura, responsabilidades, decisiones, contratos, despliegue y realización técnica. | Traza cada obligación hacia vistas, secuencias, código y pruebas sin copiar su definición funcional. |

Que los servicios ejecuten un “caso de uso” o que las secuencias técnicas se organicen
por `CU-*` no cambia la propiedad documental. La ficha funcional permanece en la SRS;
backend y frontend muestran colaboraciones internas, errores técnicos y persistencia.
Ambas vistas se conectan mediante identificadores `CU-*` compartidos por los
[componentes](views/logical/01-components-and-reuse.md), las secuencias y las pruebas.

## Forma arquitectónica y criterios normativos

El [modelo de vistas aplicado](views/index.md)
es la fuente propietaria del enfoque Viewpoint/View, su adaptación de 4+1 y el apoyo de
los niveles de C4. Los [criterios documentales](../governance/documentation-standards/03-application-by-type-of-document.md)
determinan qué orientan ISO/IEC/IEEE 42010, 29148, 1016 y 15289, qué entrega conserva cada
contenido y los límites de la adopción. Este índice sólo dirige a esas decisiones: no
mantiene otra versión de las normas ni del modelo de vistas. El
[índice de vistas](views/index.md) organiza los artefactos que materializan ese modelo.

## Organización de la documentación arquitectónica

La organización separa las **vistas del sistema** de los **artefactos de apoyo**:

1. [Vistas arquitectónicas](views/index.md): escenarios, lógica, procesos, desarrollo y
   física. Bajo `views/` se mantiene todo artefacto cuyo propósito principal es
   representar la solución desde una de esas perspectivas.
2. **Apoyo transversal:** contrato API y estándar de codificación. El contrato se
   mantiene junto a su especificación OpenAPI; el estándar permanece en arquitectura
   porque gobierna la construcción del sistema. El gobierno de la documentación, en
   cambio, pertenece a `docs/governance`.

```text
architecture/
├── views/
│   ├── scenarios/    # Navegación y relación con objetivos del actor
│   ├── logical/      # Componentes, dominios y persistencia
│   ├── processes/    # Secuencias, decisiones y estados dinámicos
│   ├── development/  # Organización, implementación, patrones y mapa del código
│   └── physical/     # Contexto, contenedores y despliegue
├── openapi/          # Referencia HTTP y contrato procesable
└── coding-standards/
```

Los índices de cada vista conducen a sus colecciones sin duplicar contenido. Los casos
de uso continúan en requisitos: la vista de escenarios los referencia, pero no adquiere
su propiedad normativa.

## Recorridos de lectura

1. Para comprender el sistema: [vista física](views/physical/index.md) →
   [vista lógica](views/logical/index.md) → patrón relevante en la
   [vista de desarrollo](views/development/index.md).
2. Para revisar una interacción web: [vista de escenarios](views/scenarios/index.md) →
   [contrato API](openapi/api-contract.md) → [vista de procesos](views/processes/index.md).
3. Para revisar persistencia: [vista lógica](views/logical/index.md) → esquema y
   diccionario generados → servicio en la [vista de desarrollo](views/development/index.md).
4. Para comprobar realización y cobertura: requisito o caso de uso →
   [componentes](views/logical/01-components-and-reuse.md) y secuencia `CU-*` →
   [catálogo de pruebas](../testing/use-case-test-types.md).

## Regla de división

Cada documento responde una clase de pregunta. Los diagramas de contexto, contenedores,
componentes y despliegue presentan arquitectura; las secuencias y actividades presentan
comportamiento; la navegación presenta experiencia web; el mapa generado presenta
hechos mecánicos del código. Cuando una vista existente responde la pregunta, se enlaza
en lugar de duplicarla.

La documentación curada explica intención y decisiones. Los inventarios generados sólo
presentan información inferible desde `src` o Prisma y se validan mediante
`npm run docs:check`.

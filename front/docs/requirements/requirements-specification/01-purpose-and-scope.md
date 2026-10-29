# 1. Propósito y alcance

Esta especificación permite a negocio, Almacén, Sistemas, desarrollo y pruebas
acordar los resultados que Nexus debe ofrecer desde su cliente web. Define
obligaciones observables, reglas, datos y condiciones de calidad; el código y sus
pruebas aportan evidencia, sin sustituir la aceptación funcional.

| Información | Propósito y ubicación |
| --- | --- |
| Necesidad y límites | [Visión y alcance](../vision-scope-and-requirements/index.md). |
| Obligaciones del producto | [Catálogo por ámbito](catalog/index.md): acceso, identidades, catálogos, compras, salidas, inventario, reportes y calidad. |
| Obligaciones del cliente | [Especificación Vue](client-specification.md): navegación, captura, interacción, recuperación y construcción. |
| Objetivos e interacción | [Fichas de casos de uso](../use-cases/index.md) y [modelo visual](../use-case-model/index.md). |
| Realización | [Arquitectura](../../architecture/index.md), con componentes, contratos, procesos y despliegue. |
| Verificación | [Plan de pruebas](../../testing/01-test-plan.md) y [cobertura por caso](../../testing/04-use-case-coverage.md). |
| Condiciones de operación | [Interfaces y dependencias](07-interfaces-and-operating-conditions.md): contratos, entorno, compatibilidad y recuperación. |
| Aceptación de requisitos | [Verificación y aceptación](08-verification-and-acceptance.md): escenarios del cliente, fuentes de comprobación y decisión funcional. |

El alcance vigente comprende autenticación, Personas y Usuarios, seis catálogos
auxiliares, Clientes y Proveedores, Materiales, Consumibles, Mermas, Compras,
Salidas, devoluciones, Movimientos y reportes autorizados. Las requisiciones están
fuera de alcance; la administración de proyectos permanece modelada sin una pantalla
disponible. Los objetivos cuantitativos del servicio requieren un acuerdo pendiente.

La aplicación captura datos, presenta resultados y conserva el contexto del usuario.
La API comprueba acceso, reglas y estado persistido y confirma las operaciones. Las
reglas del producto se explican íntegramente en esta colección; ninguna garantía de
persistencia se atribuye al navegador.

La estructura adopta selectivamente ISO/IEC/IEEE 29148:2018 para requisitos e
ISO/IEC/IEEE 15289:2019 para elementos de información, según su
[aplicación documental](../../governance/03-standard-applicability.md).
Se conserva granularidad por obligación y objetivo, sin crear un requisito por
campo ni convertir una decisión de implementación en una función del negocio.

El paquete permanece **En revisión** hasta registrar responsable, condiciones,
resultado y evidencia de su aceptación. «Implementado» describe evidencia de una
capacidad y no significa que ya haya sido aceptada por el negocio.

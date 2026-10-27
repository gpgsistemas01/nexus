# Contratos consumidos por Vue

El [contrato del cliente](client-contracts.md) describe consulta remota, lectura,
mutación, versiones, contexto, errores y descargas. Los servicios/mappers de cada
dominio validan/traducen esos datos antes de publicarlos a los coordinadores.

| Frontera | Responsabilidad |
| --- | --- |
| Componente → Page | Evento tipado e intención; no transporte. |
| Composable → servicio | Operación del dominio, datos permitidos y AbortSignal. |
| Servicio → API | Ruta fija del recurso, método, parámetros y payload contractual. |
| API → servicio | JSON/blob validable; código y campos esperados. |
| Servicio → contenedor | Resultado de dominio confirmado o error normalizado. |

Los contratos de entrada y las postcondiciones funcionales están en
[Requisitos](../../requirements/index.md). Las secuencias detallan orden y recuperación.

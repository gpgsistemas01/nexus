# Arquitectura del cliente Vue

Esta colección explica estructura, comunicación y tratamiento de datos para
quien desarrolla o revisa el cliente. Aplica selectivamente 1016/42010 conforme al
[índice documental](../index.md#criterios-documentales-adaptados-a-vue), con
responsabilidades propias de Vue, no una copia de capas de Express.

## Capítulos

1. [Arquitectura del frontend Vue](01-structure-and-boundaries.md).
2. [Modelo para documentar la arquitectura web de Vue](02-web-views.md).
3. [Interfaz Vue, HTTP y ubicación de las pruebas](03-ui-and-http.md).
4. [Entradas, normalización y salida segura en Vue](04-input-security.md).
5. [Referencia técnica generada del código Vue](05-code-reference.md).
6. [Contratos consumidos por Vue](06-client-contracts.md).

## Relación con otras fuentes

Las decisiones de reutilización tienen sus modelos en [Patrones](../patterns/index.md).
La realización de cada capacidad está en [Módulos](../modules/index.md);
la preparación y los comandos, en [Desarrollo](../development/index.md).
La SRS y OpenAPI conservan las obligaciones y el contrato HTTP del sistema.
Las vistas distinguen solución implementada, alternativa y decisión pendiente;
una topología descrita por archivos no acredita el estado de un proveedor remoto.

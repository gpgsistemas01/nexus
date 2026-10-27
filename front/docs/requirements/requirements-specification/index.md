# Especificación de requisitos

## Propósito, actores y alcance

El cliente permite acceso y cierre de sesión, inventario de Materiales/Consumibles/
Mermas, seis catálogos auxiliares, Personas/Usuarios, Clientes/Proveedores, Compras,
Salidas, Movimientos y reportes. Usuario registrado, Personal de almacén y Administrador
del sistema participan conforme a permisos de sus asignaciones; aparecer como actor
no concede una autorización adicional.

## Catálogo

1. [Requisitos del cliente](client-specification.md): navegación, captura, estado, datos y restricciones de build.
2. [Reglas de negocio](catalog/index.md): criterios de acceso, catálogos, inventario, documentos, información y calidad.
3. [Casos de uso](../use-cases/index.md): objetivos por operación y flujos completos.
4. [Glosario](../business-glossary.md): términos del dominio.

## Lectura de estados y aceptación

El estado de una regla de producto describe su disponibilidad en Nexus, no el resultado
de la suite Vue. Un requisito modelado o fuera de alcance no acredita una pantalla.
La especificación del cliente describe las capacidades implementadas y criterios que
se verifican por sus contratos. La [cobertura](../../testing/04-use-case-coverage.md)
identifica el alcance real de cada evidencia y los efectos que necesitan API/base reales.

Las reglas son observables y trazables; una regla no se reemplaza por el nombre de un
archivo. Los campos admitidos, la versión leída, el contexto fijo y la normalización
conservan sus contratos. La aceptación registra responsable, revisión, condiciones y
evidencia; estas fuentes permanecen En revisión.

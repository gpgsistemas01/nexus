# 8. Contratos públicos y frontend Vue

Los contratos y validaciones públicas reutilizados por la captura pertenecen a
`src/shared`. Vite los compila con el cliente; no contienen secretos ni políticas
internas. El servidor valida siempre las entradas y calcula lo que persiste.

La presentación pertenece a `front/src`. Reutiliza componentes y composables del
cliente y conserva autorización, transacciones y acceso a datos en Express. Las
reglas de formato, props, eventos, estado y pruebas se mantienen en el
[estándar Vue](../../../../front/docs/architecture/coding-standards/index.md).

Al cambiar un contrato, revisa consumidores de Express y Vue, payload, tratamiento
de errores, documentación y cobertura independiente de servidor y cliente.

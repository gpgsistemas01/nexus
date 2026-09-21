# 1. Propósito y alcance

Este documento aplica la [guía técnica común](../technical-code-documentation/index.md) al código
que se ejecuta en Node.js: `src/routes`, `src/middleware`, `src/controllers`, `src/dtos`,
`src/services`, `src/repository` y Prisma. El contrato consumible de cada endpoint
permanece en el [contrato API](../api-contract/index.md); aquí se explican nombres,
responsabilidades, colaboraciones y límites transaccionales de la implementación.

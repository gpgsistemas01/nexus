# 1. Propósito, alcance y prioridad

## Objetivo

El estándar establece reglas para construir y revisar el cliente Vue: archivos SFC,
TypeScript, estilos, pruebas, configuración y herramientas de documentación. Una
regla permite decidir dónde reside un comportamiento, cómo se expresa y cómo se
comprueba. La arquitectura describe la solución; este estándar regula su construcción.

## Aplicación y fuentes de las reglas

1. Identificar la operación y su contrato funcional en requisitos y casos de uso.
2. Consultar `AGENTS.md`, este estándar y la documentación del módulo propietario.
3. Comprobar la configuración versionada de ESLint, Prettier, TypeScript y Vite.
4. Reutilizar una implementación equivalente antes de crear otra abstracción.
5. Ante una diferencia entre prosa, configuración y código, identificar la regla
   pretendida y corregir las fuentes afectadas en el mismo cambio; no normalizar
   todo el repositorio como efecto secundario.

La herramienta no decide por sí sola una responsabilidad. Un archivo que pasa lint
puede seguir mezclando transporte y presentación. Las recomendaciones oficiales de
Vue complementan estas reglas, con las versiones instaladas en `package.json`.

## Ámbito técnico

Se usa Vue 3 con Composition API y `<script setup lang="ts">`, Vue Router, Vuetify,
VeeValidate y Axios. Los manifiestos y el lockfile fijan las versiones compatibles;
no se documenta una actualización de dependencia como si fuera una decisión de diseño.
Los módulos ES mantienen extensiones explícitas. Los rangos de Node se consultan en
`engines`, incluidos para instalar herramientas de desarrollo.

## Excepciones justificadas

Una excepción debe explicar el contrato que la exige, sus consumidores y la evidencia
que protege el cambio. No se introduce otra biblioteca de formularios, HTTP o estado
para resolver un caso ya cubierto. Las reglas visuales locales se justifican por la
necesidad del componente y no por copiar una pantalla completa.

## Fuentes verificables

`front/.editorconfig`, `prettier.config.js`, `eslint.config.js`, `tsconfig.*.json`,
`vite.config.ts` y `package.json` son las fuentes operativas. Las instrucciones de
preparación se mantienen en [Inicio local](../../development/01-getting-started.md).

## Obligaciones y juicio técnico

El formato configurado, los contratos de entrada/salida, los controles de seguridad
y las fronteras de dependencia son comunes al proyecto. Las recomendaciones sobre
extraer funciones o introducir una abstracción se evalúan por responsabilidad,
consumidores y claridad; no establecen un tamaño obligatorio por archivo.

La [clasificación de reglas y criterios](../../governance/04-conventions-and-criteria.md)
explica qué es obligatorio, qué admite alternativas y cómo se revisa un cambio de
convención. Las decisiones no se sustituyen por preferencias individuales incompatibles.

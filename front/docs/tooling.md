# Herramientas del frontend

## Decisiones aplicadas

La base usa Vue 3, Vue Router 4 y Vite, con TypeScript estricto. `vue-tsc` comprueba
componentes y módulos; ESLint analiza errores comunes de JavaScript/TypeScript y Vue.
El preset de Vue es `essential`, orientado a errores, sin imponer formato cosmético.
Una regla de imports impide dependencias directas de HTTP, stores o páginas dentro
de componentes de presentación. No sustituye la revisión de dependencias indirectas.

Se admiten Node.js `^22.13.0 || ^24.14.1`. Para mantener compatibilidad con Node
24.14.1 se fijan jsdom 29.1.1 y Vue Test Utils 2.4.6: las ramas posteriores agregaban
requisitos más altos de Node mediante dependencias de pruebas. No basta con bajar
`engines`; se verifica la compatibilidad de todo el lockfile y la instalación con
`npm ci --include=dev --engine-strict`, además de lint, pruebas y build.
CI comprueba el frontend con Node 24.14.1 para detectar regresiones de ese mínimo.
El backend conserva sus herramientas y versiones de Node documentadas por separado.
Las versiones exactas se registran en `package-lock.json` y se instalan con `npm ci`.

## Tipos y editor

`tsconfig.json` referencia tres entornos: aplicación (DOM/Vite), configuración (Node)
y pruebas (DOM/Node). El código de navegador no recibe por accidente las variables
globales de Node. Los archivos de estado incremental se guardan en `node_modules/.tmp`.
Las importaciones con `.js` resuelven al fuente `.ts`; los componentes usan `.vue`.

`npm run type-check` ejecuta `vue-tsc --build`. `npm run build` lo ejecuta antes de
Vite y falla si hay errores. `npm run dev` mantiene el comportamiento rápido de Vite:
no promete comprobar todos los tipos. En desarrollo usa Vue - Official en VS Code
o `npm run type-check:watch` en una segunda terminal. No se añadió un overlay extra.

El repositorio recomienda Vue - Official y ESLint mediante `.vscode/extensions.json`.
VS Code solicita instalar las extensiones; el repositorio no las instala automáticamente.
Si tienes Vetur activo, desactívalo en este proyecto Vue 3 para evitar diagnósticos duplicados.

TypeScript comprueba contratos estáticos; no valida las respuestas reales de una API
ni sustituye las reglas de Express. ESLint puede corregir algunos problemas con
`npm run lint:fix`; no repara automáticamente reglas de negocio ni todos los errores de tipos.

## Pruebas y diseño de los casos

La estrategia general está en `back/docs/testing/test-plan.md`; esta suite pertenece
a `front/tests/` y se ejecuta desde `front/`. Se usa Vitest, Vue Test Utils y jsdom.
Las pruebas importan `describe`, `it` y `expect`, siguiendo la suite existente; usan
archivos `*Test.ts`. Los componentes se desmontan tras cada caso.

| Riesgo observable | Nivel y técnica | Resultado esperado |
| --- | --- | --- |
| Perder la pantalla de comparación al entrar directamente | Componentes integrados con router en memoria; particiones de entrada `/` y `/inicio` | Se muestra el comparador en `/inicio`. |
| Quedar atrapado en una dirección inválida | Transición ruta desconocida → enlace de retorno | Se muestra la página no encontrada y se recupera el comparador. |
| Desconectar el evento de presentación o compartir estado entre instancias | Componente con composable; transición inicial → dos acciones → nueva instancia | El contador muestra 0, luego 2; una instancia nueva muestra 0. |

Se comprueba comportamiento visible, no clases CSS, funciones privadas ni estructura
interna de Vue. Estos casos ejercitan la base demostrativa, no certifican los módulos
operativos de Nexus. No hay HTTP real, base de datos ni navegador real en esta suite unitaria.
La suite Playwright en `front/tests/e2e/` verifica los tres candidatos en Chromium:
selección → campos vacíos → captura → visibilidad de contraseña → envío de prueba
→ recarga. Comprueba además ausencia de llamadas API y desbordamiento en móvil.
Los resultados se generan en `front/build/test-results/` y no se versionan.
Al migrar materiales se definirán casos de campos, errores, permisos y contratos;
las pruebas de backend seguirán comprobando integridad y autorización.

## Automatización y Docker

Desde `front/`, `npm run check` ejecuta lint, pruebas y build con tipos. Desde la raíz
puedes usar `npm --prefix front run check`. CI ejecuta esos controles en pasos separados
y conserva el reporte JUnit del frontend como artefacto. No modifica los disparadores
ni las comprobaciones unitarias e integración del backend.

El Dockerfile instala las herramientas en la etapa de build, copia los tsconfig y
compila con comprobación de tipos. La imagen final contiene sólo Nginx y `dist/`.
Los casos de prueba se ejecutan en CI antes del despliegue, no en Nginx.

## Herramientas aplazadas

Pinia se incorporará al integrar sesión o estado compartido real; Axios al conectar
la API. MDB Vue, Vuetify y PrimeVue están instalados como candidatos para el login de prueba;
se elegirá una biblioteca definitiva tras la comparación. VeeValidate/Zod/Yup se
evaluarán con un formulario operativo, aprovechando reglas existentes. Prettier no se incorpora por anticipado. Playwright sí se usa ahora para comprobar
los controles reales de tres bibliotecas. Contenedores, presentación y composables
no requieren esas dependencias adicionales.

# Reglas del frontend Vue

Consulta `docs/index.md` para las fuentes y criterios documentales, y
`docs/architecture/views/development/code-structure.md` desde esta carpeta para las responsabilidades,
convenciones y responsabilidades de implementación. Los comandos npm se ejecutan en `front/`.

- Organiza las capacidades en `src/modules/<dominio>/`; crea sólo carpetas con consumidores.
- Los contenedores de `pages/` coordinan estado y operaciones; `components/` recibe
  props y emite eventos. La presentación no conoce HTTP ni autenticación.
- Usa composables para comportamiento reactivo reutilizable y conserva el estado
  local salvo una necesidad real de compartirlo. No agregues stores por formulario.
- Reutiliza contratos y reglas públicas existentes sin duplicar sus fuentes.
- Mantén autorización, persistencia y validación definitiva en Express.
- No traslades listeners o mutaciones manuales del DOM a componentes controlados por Vue.
- Componentes PascalCase `.vue`, composables `useNombre.ts` y `<script setup lang="ts">`.
  Los imports relativos de módulos TypeScript conservan `.js`, resuelto al `.ts`
  por TypeScript/Vite; los componentes se importan con `.vue`.
- Ejecuta `npm run check` (ESLint, pruebas y compilación con tipos) y el flujo afectado; limita una tarea Vue a su ámbito de código y documentación.

## Documentación propia

- Describe directamente la implementación Vue; evita comparaciones con otras
  tecnologías de presentación y referencias a pantallas que no pertenecen al cliente.

- `docs/requirements` contiene especificación y casos Vue completos; los enlaces a
  documentos backend son complementarios. Repetir conceptos necesarios es válido,
  adaptándolos a responsabilidades, captura y contratos del cliente.
- Consulta `docs/architecture/coding-standards/index.md` y `docs/testing/01-test-plan.md`
  para el estándar y la estrategia específicos de Vue.
- No edites manualmente `docs/architecture/views/development/code-reference.md`: regenera con
  `npm run docs:generate` al cambiar archivos/imports/contratos de `src`.
- Ejecuta `npm run docs:check`. Publica con `npm run docs:export -- ambos`; las
  fuentes y resultados pertenecen a `front/docs` y `front/build/docs`.
- Cada patrón aplicado conserva modelo general y diagrama específico con fuentes,
  contratos y pruebas. Revisa las figuras de cada consumidor afectado, sin copiar
  patrones de Express que no existan en Vue.
- Conserva el motor Mermaid común y valida figuras/exportación representativa al
  cambiarlas. La documentación y herramientas no se incluyen en producción.
- Los procedimientos y capturas de usuario pertenecen a `docs/user-manual/`.
  Si cambia una pantalla, revisa su procedimiento y captura con `npm run docs:screenshots`.
  Ese recorrido usa datos ficticios y bloquea escrituras; no debe registrar operaciones
  para preparar imágenes. Publica con `npm run docs:manual -- ambos` y revisa DOCX/PDF.
- La inducción por cuenta usa `npm run docs:manuals -- --mode live --profile <id>`.
  Consulta `docs/governance/06-manuals-by-access.md`: usa permisos de la sesión,
  capturas propias y archivos locales ignorados; las áreas operativas no realizan
  surtidos ni devoluciones. No cambies una captura faltante por otra de administración.

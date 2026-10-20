# Reglas del frontend Vue

Consulta `docs/architecture.md` desde esta carpeta para las responsabilidades,
convenciones y criterios de migración. Los comandos npm se ejecutan en `front/`.

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
- Ejecuta `npm run check` (ESLint, pruebas y compilación con tipos) y el flujo afectado; no modifiques EJS para una tarea sólo Vue.

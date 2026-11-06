# Decisiones y consecuencias arquitectónicas

| ID | Decisión y motivo | Consecuencia y límite | Fuentes |
| --- | --- | --- | --- |
| ADR-VUE-001 | Módulos funcionales con contenedor/presentación para cambiar captura, UI y transporte por separado. | Props/eventos tipados; una abstracción sólo se comparte con consumidores concretos. | `src/modules`, patrones de contenedor y callbacks. |
| ADR-VUE-002 | Composición reactiva y callbacks para listas, selección, formularios y auxiliares. | Estado por instancia y dependencias explícitas; el Workspace compone dominios. | `src/shared/composables`, `src/app/pages`. |
| ADR-VUE-003 | Sesión por aplicación mediante provide/inject. | Router y páginas comparten la misma identidad; listas y formularios conservan su estado por instancia. | `main.ts`, `modules/auth/session.ts`. |
| ADR-VUE-004 | Un cliente Axios con normalización y refresh coordinado. | Evita implementaciones divergentes; cookies requieren origen/proxy coherente y el servidor autoriza. | `shared/http/apiClient.ts`. |
| ADR-VUE-005 | Reglas públicas compiladas por alias y esquemas adaptados a VeeValidate. | Una fuente de captura; build necesita fuentes permitidas y nunca incluye lógica privada. | `vite.config.ts`, `tsconfig.app.json`, editores. |
| ADR-VUE-006 | Vuetify para controles/tema y SweetAlert2 para feedback. | Vue controla nodos; marcos/slots comparten estilo sin otro motor de DOM. | Plugin visual, componentes compartidos y feedback. |
| ADR-VUE-007 | Paginación remota, cancelación y recarga visible con intervalo. | Sólo la lectura vigente actualiza datos; la recarga automática depende de visibilidad, disponibilidad y antigüedad. | `usePagedList`, `useVisibleRefresh`, lookups. |
| ADR-VUE-008 | Operaciones documentales discriminadas y mappers por contrato. | Consulta, edición, corrección, surtido y devolución conservan responsabilidades y efectos distintos. | Módulos `purchases` e `issues`. |
| ADR-VUE-009 | Documentación y herramientas excluidas del runtime del frontend. | La imagen final sirve archivos compilados; las fuentes documentales y sus herramientas permanecen fuera del contenido público. | `front/Dockerfile`, `front/Dockerfile.dockerignore` y etapas de compilación. |

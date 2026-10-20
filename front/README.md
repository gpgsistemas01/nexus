# Nexus · Frontend

Base de Vue 3 con JavaScript, componentes `.vue`, Composition API (`<script setup>`)
y Vite, creada con la plantilla oficial `create-vite`. Incluye la pantalla de ejemplo
de la plantilla; los módulos de Nexus todavía se sirven mediante EJS en `back/`.

## Desarrollo

Usa Node.js 22.12 o superior dentro de las versiones 22–24 admitidas por el proyecto.
Desde la raíz del repositorio:

```bash
cd front
npm ci
npm run dev
```

Abre la URL que muestra Vite en la terminal. Express se inicia por separado desde
`back/` con `npm run dev`. Esta base todavía no integra la API ni la autenticación.

## Compilación y vista previa

Desde `front/`:

```bash
npm run build
npm run preview
```

`build` genera `front/dist/`. `preview` permite revisar localmente esa compilación;
para producción se publican los archivos de `dist/` mediante el proveedor o servidor
estático elegido. El servidor de desarrollo de Vite no es el servidor de producción.

También puedes ejecutar desde la raíz, sin cambiar de directorio:

```bash
npm --prefix front ci
npm --prefix front run dev
npm --prefix front run build
```

## Estructura

- `src/App.vue`: componente principal.
- `src/components/`: componentes reutilizables; contiene el ejemplo inicial.
- `src/main.js`: arranque de Vue.
- `public/`: archivos estáticos sin transformar.
- `vite.config.js`: integración de Vue con Vite.

Vue gestiona la interfaz; Vite proporciona el servidor de desarrollo y la compilación.
No se añadieron router ni gestor de estado: se incorporarán cuando los módulos los requieran.
Las variables `VITE_*` son públicas al compilar: nunca contienen claves privadas ni
credenciales de PostgreSQL.

El Dockerfile de la raíz sigue construyendo exclusivamente `back/`; `front/` está
excluido mediante `.dockerignore`. En Vercel, el proyecto de frontend puede usar Root
Directory `front`, Build Command `npm run build` y Output Directory `dist`.

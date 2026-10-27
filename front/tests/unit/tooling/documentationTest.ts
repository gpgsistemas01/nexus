import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  generateCodeReference,
  inspectSource,
  renderCodeReference,
} from '../../../scripts/documentation.mjs';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

it('describe props, eventos e imports de un SFC sin interpretar su template o comentarios como dependencias', () => {
  const result = inspectSource(
    'Form.vue',
    `<script setup lang="ts">
    import { ref } from 'vue';
    import type { Item } from './item.js';
    const props = defineProps<{ label: string; item?: Item }>();
    const emit = defineEmits<{ save: [id: string] }>();
    // import ignored from 'not-a-dependency';
    const page = () => import('./Editor.vue');
  </script><template><p>import fake from 'template'</p></template>`,
  );
  expect(result.imports).toEqual(['./Editor.vue (diferido)', './item.js (tipo)', 'vue']);
  expect(result.contracts).toEqual(['defineEmits: save', 'defineProps: label, item']);
  expect(result.exports).toEqual([]);
});

it('conserva nombres públicos y dependencias de tipos y reexports de TypeScript', () => {
  const result = inspectSource(
    'state.ts',
    `
    import { type Contract } from './contract.js';
    export interface State { id: string }
    export const create = () => ({});
    export { load as read } from './service.js';
  `,
  );
  expect(result.imports).toEqual(['./contract.js (tipo)', './service.js (reexport)']);
  expect(result.exports).toEqual(['create', 'read', 'State']);
});

it('rechaza un SFC inválido en lugar de publicar un inventario aparentemente completo', () => {
  expect(() => inspectSource('Broken.vue', '<template><p>incompleto')).toThrow('Broken.vue');
});

it('genera una referencia determinista y detecta que quedó desactualizada al cambiar una fuente', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-vue-docs-'));
  roots.push(root);
  await mkdir(path.join(root, 'src'), { recursive: true });
  await mkdir(path.join(root, 'docs/architecture/views/development'), { recursive: true });
  await writeFile(path.join(root, 'src/state.ts'), 'export const create = () => ({});');
  const first = await renderCodeReference(root);
  expect(first).toBe(await renderCodeReference(root));
  await expect(generateCodeReference(root, true)).rejects.toThrow('desactualizada');
  await generateCodeReference(root, false);
  expect(
    await readFile(
      path.join(root, 'docs/architecture/views/development/code-reference.md'),
      'utf8',
    ),
  ).toBe(first);
  await expect(generateCodeReference(root, true)).resolves.toBeUndefined();
  await writeFile(path.join(root, 'src/state.ts'), 'export const load = () => ({});');
  await expect(generateCodeReference(root, true)).rejects.toThrow('desactualizada');
});

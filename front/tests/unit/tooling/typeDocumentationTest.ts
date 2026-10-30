import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  inspectTypeSource,
  buildTypeModel,
  renderTypeReference,
  generateTypeReference,
} from '../../../scripts/typeDocumentation.mjs';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
const fixture = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-types-'));
  roots.push(root);
  await mkdir(path.join(root, 'src'), { recursive: true });
  return root;
};

const modelFixture = async (root: string) => {
  const folder = path.join(root, 'src/modules/purchases');
  await mkdir(folder, { recursive: true });
  return path.join(folder, 'purchase.ts');
};

it('conserva todos los campos, opcionales, genéricos y parámetros propiedad de constructor', () => {
  const result = inspectTypeSource(
    'src/types.ts',
    `
    export interface Item<T> { id: string; optional?: T[]; value: Record<string, number>; meta?: { active: boolean; owner: Item<T> }; }
    export type Mode = { mode: 'create' } | { mode: 'edit'; row: Item<string> };
    export class Failure extends Error { constructor(public fields: Item<string>[]) { super(); } }
  `,
  );
  expect(
    result.contracts
      .find(({ name }) => name === 'Item')
      ?.members.map(({ name }: { name: string }) => name),
  ).toEqual(['id', 'optional', 'value', 'meta']);
  expect(result.contracts.find(({ name }) => name === 'Mode')?.definition).toContain(
    "mode: 'edit'",
  );
  expect(result.contracts.map(({ name }) => name)).toEqual(['Item', 'Mode', 'Failure']);
  expect(result.contracts[0]?.members[3]?.signature).toContain(
    'meta?: { active: boolean; owner: Item<T> }',
  );
  expect(
    result.contracts
      .find(({ name }) => name === 'Failure')
      ?.members.map(({ name }: { name: string }) => name),
  ).toEqual(['constructor', 'fields']);
});

it('inspecciona props, eventos y slots SFC sin confundirlos con clases de componentes', () => {
  const result = inspectTypeSource(
    'src/Form.vue',
    `<script setup lang="ts">
    defineProps<{ value: string; rows?: Item[] }>();
    defineEmits<{ save: [item: Item] }>();
    defineSlots<{ default: (props: { value: string }) => unknown }>();
  </script><template><p>Ejemplo</p></template>`,
  );
  expect(
    result.contracts.filter(({ kind }) => kind === 'SFC contract').map(({ name }) => name),
  ).toEqual(['Form.defineProps', 'Form.defineEmits', 'Form.defineSlots']);
  expect(result.contracts.find(({ name }) => name === 'Form.defineEmits')?.members[0]?.type).toBe(
    '[item: Item]',
  );
});

it('resuelve imports renombrados y distingue herencia, referencia, array, alias y callback', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'src/item.ts'), 'export interface Item { id: string }');
  await writeFile(
    path.join(root, 'src/state.ts'),
    `
    import type { Item as Row } from './item.js';
    export interface State extends Row { rows: Row[]; selected?: Row | null; readonlyRows: readonly Row[]; genericRows: ReadonlyArray<Row>; lazy: import('./item').Item; save: (row: Row) => void; }
    export type Capture = Pick<Row, 'id'>;
  `,
  );
  const { contracts } = await buildTypeModel(root);
  const state = contracts.find(({ name }) => name === 'State')!;
  expect(state.edges).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: 'inheritance',
        target: expect.objectContaining({ file: 'src/item.ts' }),
      }),
      expect.objectContaining({ kind: 'association', role: 'rows', multiplicity: '0..*' }),
      expect.objectContaining({ kind: 'association', role: 'selected', multiplicity: '0..1' }),
      expect.objectContaining({ kind: 'association', role: 'readonlyRows', multiplicity: '0..*' }),
      expect.objectContaining({ kind: 'association', role: 'genericRows', multiplicity: '0..*' }),
      expect.objectContaining({
        kind: 'association',
        role: 'lazy',
        target: expect.objectContaining({ file: 'src/item.ts' }),
      }),
      expect.objectContaining({ kind: 'dependency', role: 'save' }),
    ]),
  );
  expect(
    contracts
      .find(({ name }) => name === 'Capture')
      ?.edges.every(({ kind }: { kind: string }) => kind === 'dependency'),
  ).toBe(true);
});

it('conserva aliases y nombres declarados sin expandir retornos, spreads ni objetos anónimos', async () => {
  const root = await fixture();
  const modelFile = await modelFixture(root);
  await writeFile(
    modelFile,
    `
    export const useBase = () => ({ isLoading: false });
    export const useEditor = () => ({ ...useBase(), values: { name: '' }, save: () => true });
    export type Values = Record<'name' | 'active', string | boolean>;
    export type EditorState = ReturnType<typeof useEditor>;
  `,
  );
  const model = await buildTypeModel(root);
  expect(model.contracts.map(({ name }) => name)).toEqual(['Values', 'EditorState']);
  expect(model.contracts.find(({ name }) => name === 'EditorState')?.definition).toBe(
    'ReturnType<typeof useEditor>',
  );
  const document = (await renderTypeReference(root)).get('purchases.md')!;
  expect(document).toContain("Record<'name' | 'active', string | boolean>");
  expect(document).toContain('ReturnType<typeof useEditor>');
  expect(document).not.toContain('useEditor.return');
  expect(document).not.toContain('Values.expanded');
});

it('publica contratos propios en tablas y conserva los tipos externos en las firmas', async () => {
  const root = await fixture();
  const modelFile = await modelFixture(root);
  await writeFile(
    modelFile,
    `
    import type { Ref as Box } from 'vue';
    export interface PurchaseDetail { id: string; }
    export interface PurchaseRow<T> {
      selected: Box<PurchaseDetail>;
      data: Record<string, PurchaseDetail>;
      pending: Promise<PurchaseDetail>;
      cancel: AbortSignal;
      value: T;
    }
    export class ApiError extends Error { code: string; }
    export interface PurchaseFormProps { row: PurchaseRow<string>; }
    export type PurchaseResource = 'materials' | 'consumables';
  `,
  );
  const { contracts } = await buildTypeModel(root);
  const row = contracts.find(({ name }) => name === 'PurchaseRow')!;
  expect(row.edges.map(({ target }: { target: { name: string } }) => target.name)).toEqual([
    'PurchaseDetail',
    'PurchaseDetail',
    'PurchaseDetail',
  ]);
  expect(contracts.find(({ name }) => name === 'ApiError')!.edges).toEqual([]);
  const document = (await renderTypeReference(root)).get('purchases.md')!;
  expect(document).toContain('Box<PurchaseDetail>');
  expect(document).toContain('Record<string, PurchaseDetail>');
  expect(document).toContain('extends Error');
  expect(document).toContain('## ApiError');
  expect(document).toContain('## PurchaseResource');
  expect(document).toContain("'materials' | 'consumables'");
  expect(document).toContain('## PurchaseRow');
  expect(document).toContain('## PurchaseFormProps');
  expect(document).toContain('[PurchaseDetail]');
  expect(document).not.toContain('```mermaid');
  for (const technical of ['Box', 'Record', 'Promise', 'AbortSignal', 'Error', 'T'])
    expect(document).not.toContain('## ' + technical + '\n');
});

it('conserva campos y relaciones de un contrato con varios destinos en una sola ficha', async () => {
  const root = await fixture();
  const modelFile = await modelFixture(root);
  const names = [
    'PurchaseDetail',
    'PurchaseDocument',
    'PurchaseValues',
    'PurchaseFilters',
    'PurchaseDetailChange',
  ];
  await writeFile(
    modelFile,
    names.map((name) => `interface ${name} { id: string }`).join('\n') +
      '\ninterface PurchaseRow { ' +
      names.map((name, i) => `row${i}: ${name};`).join(' ') +
      ' name: string; }',
  );
  const document = (await renderTypeReference(root)).get('purchases.md')!;
  const contract = document.split('## PurchaseRow\n')[1]!;
  for (let i = 0; i < names.length; i++) {
    expect(contract).toContain(`row${i}: ${names[i]}`);
    expect(contract).toContain('[' + names[i] + ']');
  }
  expect(contract).toContain('name: string');
  expect(document.match(/^## PurchaseRow$/gm)).toHaveLength(1);
  expect(document).not.toContain('```mermaid');
});

it('publica todos los miembros y detecta fuentes cambiadas o retiradas', async () => {
  const root = await fixture();
  const modelFile = await modelFixture(root);
  await writeFile(
    modelFile,
    'export interface PurchaseRow { ' +
      Array.from({ length: 19 }, (_, i) => `field${i}: string;`).join(' ') +
      ' }',
  );
  const first = await renderTypeReference(root);
  expect([...first]).toEqual([...(await renderTypeReference(root))]);
  const document = first.get('purchases.md')!;
  expect(document).toContain('field18: string');
  expect(document).not.toContain('```mermaid');
  await expect(generateTypeReference(root, true)).rejects.toThrow('desactualizados');
  await generateTypeReference(root, false);
  await expect(generateTypeReference(root, true)).resolves.toBeUndefined();
  await rm(modelFile);
  await expect(generateTypeReference(root, true)).rejects.toThrow('obsoletas');
  await generateTypeReference(root, false);
  await expect(generateTypeReference(root, true)).resolves.toBeUndefined();
});

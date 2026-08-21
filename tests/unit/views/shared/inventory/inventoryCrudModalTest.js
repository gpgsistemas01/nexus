import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const readView = path => readFileSync(path, 'utf8');

describe('modal compartido de los CRUD de inventario', () => {
  it.each([
    'src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs',
    'src/views/shared/issues/issueModal.ejs'
  ])('es reutilizado por el CRUD que compone %s', viewPath => {
    expect(readView(viewPath)).toMatch(/include\(['"][^'"]*inventory\/inventoryCrudModal['"]/);
  });

  it('delega la estructura visual al modal de layout sin conocer un CRUD concreto', () => {
    const source = readView('src/views/shared/inventory/inventoryCrudModal.ejs');

    expect(source).toContain("include('../layout/modal'");
    expect(source).toContain('modalId: modalConfig.modalId');
    expect(source).not.toMatch(/goodsReceipt|goodsIssue|wasteIssue/);
  });
});

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pageContracts = [
  {
    view: 'src/views/pages/sales/clients/clientsPage.ejs',
    entry: 'src/public/js/pages/sales/clients/clientsPage.js',
    forms: ['./clientForm.js']
  },
  {
    view: 'src/views/pages/warehouse/suppliers/suppliersPage.ejs',
    entry: 'src/public/js/pages/warehouse/suppliers/suppliersPage.js',
    forms: ['./supplierForm.js']
  },
  {
    view: 'src/views/pages/warehouse/materials/materialsPage.ejs',
    entry: 'src/public/js/pages/warehouse/materials/materialsPage.js',
    forms: ['./materialForm.js', '../suppliers/supplierForm.js']
  },
  {
    view: 'src/views/pages/warehouse/wastes/wastesPage.ejs',
    entry: 'src/public/js/pages/warehouse/wastes/wastesPage.js',
    forms: ['./wasteForm.js', './wasteStockAdditionForm.js']
  },
  {
    view: 'src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs',
    entry: 'src/public/js/pages/warehouse/goodsReceipts/goodsReceiptsPage.js',
    forms: ['../materials/materialForm.js', '../suppliers/supplierForm.js', './goodsReceiptForm.js']
  },
  {
    view: 'src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs',
    entry: 'src/public/js/pages/warehouse/goodsIssues/goodsIssuesPage.js',
    forms: ['../../sales/clients/clientForm.js', './goodsIssueForm.js']
  }
];

describe('entry points de páginas con modales', () => {
  it.each(pageContracts)('$view carga un solo módulo e inicializa sus formularios desde $entry', async ({
    view,
    entry,
    forms
  }) => {
    const [viewSource, entrySource] = await Promise.all([
      readFile(view, 'utf8'),
      readFile(entry, 'utf8')
    ]);

    expect(viewSource.match(/<script type="module"/g)).toHaveLength(1);

    for (const form of forms) {
      expect(entrySource).toContain(`import '${ form }';`);
    }
  });
});

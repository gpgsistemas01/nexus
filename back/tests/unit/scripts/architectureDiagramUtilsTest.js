import { describe, expect, it } from 'vitest';

import { getSequenceCodeReferenceFailures } from '../../../scripts/architectureDiagramUtils.js';

const sources = new Map([
  ['src/services/adjustment.js', 'const calculateStockAdjustmentValues = values => values;'],
  ['src/services/stock.js', 'export const calculateConvertedQuantity = () => 0;'],
  ['src/routes/api/catalog.js', 'router.get("/:catalog", handler);']
]);

describe('trazabilidad de secuencias hacia el código', () => {
  it('detecta una función atribuida al colaborador equivocado', () => {
    const failures = getSequenceCodeReferenceFailures({
      sequence: 'participant Stock as src/services/stock.js\nAdjustment->>Stock: calculateStockAdjustmentValues(data)',
      sourceContents: sources
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('calculateStockAdjustmentValues');
  });

  it('acepta el método del propietario y una ruta literal de un parámetro registrado', () => {
    expect(getSequenceCodeReferenceFailures({
      sequence: 'participant Adjustment as src/services/adjustment.js\nparticipant Route as src/routes/api/catalog.js\nAdjustment->>Adjustment: calculateStockAdjustmentValues(data)\nHTTP->>Route: GET /api/admin/catalogs/departments',
      sourceContents: sources,
      routes: [{ method: 'GET', route: '/api/admin/catalogs/:catalog', file: 'src/routes/api/catalog.js' }]
    })).toEqual([]);
  });

  it('rechaza un método HTTP distinto y una ruta atribuida a otro router', () => {
    const routes = [{ method: 'GET', route: '/api/warehouse/materials', file: 'src/routes/api/material.js' }];
    const sequence = 'participant Route as src/routes/api/catalog.js\nHTTP->>Route: GET /api/warehouse/materials\nHTTP->>Route: POST /api/warehouse/materials';
    expect(getSequenceCodeReferenceFailures({ sequence, sourceContents: sources, routes })).toHaveLength(2);
  });

  it('contrasta los nombres públicos de una fábrica con su configuración y constructor', () => {
    const sourceContents = new Map([
      ['src/application/factory.js', 'export const buildHandler = () => async () => {};'],
      ['src/application/config.js', 'export const registerItem = buildHandler();']
    ]);
    const sequence = 'participant Handler as factory.js\nClient->>Handler: registerItem(data)';
    const body = [
      '## Participantes y trazabilidad',
      '| `Handler` | control | src/application/factory.js |',
      '| `Config` | control | src/application/config.js |',
      '## Funciones configuradas',
      '| `registerItem` | `Config` | `Handler` · `buildHandler(...)` |'
    ].join('\n');

    expect(getSequenceCodeReferenceFailures({ body, sequence, sourceContents })).toEqual([]);
    expect(getSequenceCodeReferenceFailures({
      body: body.replace('buildHandler(...)', 'unknownFactory(...)'), sequence, sourceContents
    })).toHaveLength(1);
    expect(getSequenceCodeReferenceFailures({
      body, sequence, sourceContents: new Map([...sourceContents, ['src/application/config.js', '']])
    })).toHaveLength(1);
  });
});

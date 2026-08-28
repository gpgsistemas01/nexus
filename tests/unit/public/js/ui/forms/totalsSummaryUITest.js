import { beforeEach, describe, expect, it, vi } from 'vitest';

const totalElements = new Map([
  ['#totalQuantityDisplayValue', { dataset: {}, textContent: '' }],
  ['#totalNetPurchaseAmountDisplayValue', { dataset: {}, textContent: '' }],
  ['#totalGrossPurchaseAmountDisplayValue', { dataset: {}, textContent: '' }]
]);

beforeEach(() => {
  totalElements.forEach(element => {
    element.dataset = {};
    element.textContent = '';
  });
  globalThis.document = {
    querySelector: vi.fn(selector => totalElements.get(selector) ?? null)
  };
});

import { setTotals, updateTotals } from '../../../../../../src/public/js/ui/forms/totalsSummaryUI.js';

describe('totales del CRUD de entradas de compra', () => {
  it('resta del resumen únicamente la partida nueva eliminada', () => {
    setTotals({ quantity: 8, net: 150, gross: 174 });

    updateTotals({
      quantity: 3,
      net: 50,
      gross: 58,
      operation: 'subtract'
    });

    expect(totalElements.get('#totalQuantityDisplayValue').dataset.value).toBe('5');
    expect(totalElements.get('#totalNetPurchaseAmountDisplayValue').dataset.value).toBe('100');
    expect(totalElements.get('#totalGrossPurchaseAmountDisplayValue').dataset.value).toBe('116');
  });
});

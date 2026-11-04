import { expect, it } from 'vitest';
import {
  convertedQuantityText,
  numberText,
  currencyText,
} from '../../../../src/shared/utils/formatNumbers.js';

it.each(['m²', 'm2', 'M²', 'Metros cuadrados'])('presenta %s con dos decimales', (unit) => {
  const value = '1234.567891';
  expect(convertedQuantityText(value, unit)).toBe('1,234.57');
});

it.each([
  [0, '0.00'],
  [0.1 + 0.2, '0.30'],
  [1.005, '1.01'],
  [-1.005, '-1.01'],
  [-0.000001, '0.00'],
  [-0.005, '-0.01'],
  [null, '—'],
  [undefined, '—'],
] as const)('redondea el área %s como %s', (value, expected) => {
  expect(convertedQuantityText(value, 'm²')).toBe(expected);
});

it('mantiene la precisión de otras unidades y produce un valor válido para el input numérico', () => {
  expect(convertedQuantityText('1.234567', 'pza')).toBe('1.234567');
  expect(convertedQuantityText('1234.567891', 'm²', { useGrouping: false })).toBe('1234.57');
  expect(numberText('1.234567')).toBe('1.234567');
  expect(currencyText('1234.567891')).toBe('$1,234.57');
});

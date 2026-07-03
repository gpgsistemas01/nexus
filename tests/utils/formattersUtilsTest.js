import { describe, expect, it } from 'vitest';

import {
  buildStockKey,
  cleanSearchTerm,
  normalizeDecimal,
  normalizeProductDimensions,
  normalizeText,
  parseStockKey,
  roundTo,
  sanitizeEmptyStrings,
  toNumber
} from '../../src/utils/formattersUtils.js';

describe('formattersUtils', () => {
  it('reemplaza cadenas vacías por null sin modificar otros valores', () => {
    expect(sanitizeEmptyStrings({ name: '', stock: 0, active: false, notes: 'ok' })).toEqual({
      name: null,
      stock: 0,
      active: false,
      notes: 'ok'
    });
  });

  it('separa búsquedas con código y nombre manteniendo guiones adicionales en el nombre', () => {
    expect(cleanSearchTerm(' PRD-001 - Lámina - acero ')).toEqual({
      codeSearch: 'PRD',
      nameSearch: '001-Lámina-acero'
    });
  });

  it('redondea números y normaliza resultados cercanos a cero', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(normalizeDecimal(0.004)).toBe(0);
    expect(normalizeDecimal(2.345)).toBe(2.35);
  });

  it('convierte valores numéricos opcionales y limpia dimensiones nulas', () => {
    expect(toNumber('12.5')).toBe(12.5);
    expect(toNumber('')).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(normalizeProductDimensions({ base: '0', height: '0' })).toEqual({ base: null, height: null });
    expect(normalizeProductDimensions({ base: '2.5', height: '4' })).toEqual({ base: 2.5, height: 4 });
  });

  it('genera y descompone claves de inventario por producto y proveedor', () => {
    const key = buildStockKey('product-1', 'supplier-2');

    expect(key).toBe('product-1:supplier-2');
    expect(parseStockKey(key)).toEqual({ productId: 'product-1', supplierId: 'supplier-2' });
  });

  it('normaliza texto quitando espacios y usando mayúsculas', () => {
    expect(normalizeText('  merma de lámina  ')).toBe('MERMA DE LÁMINA');
  });
});

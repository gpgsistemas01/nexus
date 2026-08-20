import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDecimal, roundTo } from '../../../../../src/public/js/utils/formatUtils.js';

describe('formatUtils decimal precision boundary', () => {
    it('conserva seis decimales en cálculos enviados y redondea sólo su presentación', () => {
        const preciseValue = roundTo(12.3456784);

        expect(preciseValue).toBe(12.345678);
        expect(formatDecimal(preciseValue)).toBe('12.35');
        expect(formatCurrency(preciseValue)).toContain('12.35');
    });
});

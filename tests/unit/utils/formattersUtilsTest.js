import { describe, expect, it } from 'vitest';
import { getReportMonthDateRange } from '../../../src/utils/formattersUtils.js';

describe('rango de mes para consultas de reportes', () => {
  it('calcula los límites de un mes específico, incluidos años bisiestos', () => {
    expect(getReportMonthDateRange('2024-02')).toEqual({
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      month: '02',
      year: '2024'
    });
  });

  it('usa el mes actual de México cuando el valor no es válido', () => {
    const range = getReportMonthDateRange('2024-13');

    expect(range.startDate).toMatch(/^\d{4}-\d{2}-01$/);
    expect(range.endDate).toMatch(/^\d{4}-\d{2}-(28|29|30|31)$/);
  });
});

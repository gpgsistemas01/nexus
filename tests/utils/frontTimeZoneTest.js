import { describe, expect, it } from 'vitest';

import {
  createBrowserDateFromTimeZone,
  formatDateTimeInputInTimeZone,
  getTimeZoneDateTimeParts,
  zonedDateTimeToUtcIso
} from '../../src/public/js/utils/timeZone.js';

describe('front timeZone utilities', () => {
  it('muestra los instantes UTC con el horario de Veracruz/México', () => {
    const utcDate = '2026-07-07T18:30:00.000Z';

    expect(formatDateTimeInputInTimeZone(utcDate)).toBe('2026-07-07T12:30');
    expect(getTimeZoneDateTimeParts(utcDate)).toMatchObject({
      year: 2026,
      month: 7,
      day: 7,
      hour: 12,
      minute: 30
    });
  });

  it('convierte el horario seleccionado en Veracruz/México a ISO UTC', () => {
    const browserDate = new Date(2026, 6, 7, 12, 30, 0);

    expect(zonedDateTimeToUtcIso(browserDate)).toBe('2026-07-07T18:30:00.000Z');
  });

  it('crea una fecha de navegador con la hora de pared de Veracruz/México para flatpickr', () => {
    const browserDate = createBrowserDateFromTimeZone('2026-07-07T18:30:00.000Z');

    expect(browserDate.getFullYear()).toBe(2026);
    expect(browserDate.getMonth()).toBe(6);
    expect(browserDate.getDate()).toBe(7);
    expect(browserDate.getHours()).toBe(12);
    expect(browserDate.getMinutes()).toBe(30);
  });
});

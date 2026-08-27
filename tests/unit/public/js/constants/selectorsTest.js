import { describe, expect, it } from 'vitest';

import { INPUT_SELECTORS } from '../../../../../src/public/js/constants/selectors.js';

describe('selectores compartidos del encabezado CRUD de salidas', () => {
  it('identifica la fecha usada por los formularios de material y merma', () => {
    expect(INPUT_SELECTORS.REQUEST_DATE).toBe('#requestDateInput');
  });
});

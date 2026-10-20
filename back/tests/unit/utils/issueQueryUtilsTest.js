import { describe, expect, it } from 'vitest';

import { getIssueDataTableQuery } from '../../../src/utils/issueQueryUtils.js';

describe('issueQueryUtils', () => {
  it('normaliza los filtros y el orden compartidos por las salidas', () => {
    expect(getIssueDataTableQuery({
      query: {
        start: '10',
        length: '5',
        search: { value: 'SAL-2026' },
        order: [{ column: '1', dir: 'asc' }],
        fulfillmentStatusId: 'status-1',
        observationsSearch: 'taller',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        clientId: 'client-1',
        departmentId: 'department-1',
        personId: 'person-1'
      },
      columns: ['referenceNumber', 'requestDate']
    })).toEqual({
      skip: 10,
      take: 5,
      search: 'SAL-2026',
      fulfillmentStatusId: 'status-1',
      observationsSearch: 'taller',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      clientId: 'client-1',
      departmentId: 'department-1',
      personId: 'person-1',
      orderBy: 'requestDate',
      orderDir: 'asc'
    });
  });

  it('aplica valores vacíos y orden descendente por defecto', () => {
    expect(getIssueDataTableQuery({
      columns: ['referenceNumber']
    })).toEqual({
      skip: 0,
      take: 10,
      search: '',
      fulfillmentStatusId: '',
      observationsSearch: '',
      startDate: '',
      endDate: '',
      clientId: '',
      departmentId: '',
      personId: '',
      orderBy: 'referenceNumber',
      orderDir: 'desc'
    });
  });
});

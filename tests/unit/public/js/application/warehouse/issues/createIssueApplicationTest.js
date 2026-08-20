import { describe, expect, it, vi } from 'vitest';

import { createIssueApplication } from '../../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js';

const createRequests = () => ({
  getAll: vi.fn().mockResolvedValue({ data: { data: [] } }),
  register: vi.fn().mockResolvedValue({ data: { code: 'OK', issue: { id: 'issue-1' } } }),
  edit: vi.fn().mockResolvedValue({ data: { code: 'OK', issue: { id: 'issue-1' } } }),
  editHeader: vi.fn().mockResolvedValue({ data: { code: 'OK', issue: { id: 'issue-1' } } }),
  editDetails: vi.fn().mockResolvedValue({ data: { code: 'OK', issue: { id: 'issue-1' } } }),
  returnDetail: vi.fn().mockResolvedValue({
    data: { code: 'OK', issueReturn: { id: 'return-1' } }
  })
});

describe('factory compartida de aplicaciones de salida', () => {
  it('construye una instancia privada completa para cada contexto', () => {
    const firstApplication = createIssueApplication({ requests: createRequests() });
    const secondApplication = createIssueApplication({ requests: createRequests() });

    expect(Object.keys(firstApplication)).toEqual([
      'getAll',
      'register',
      'edit',
      'editHeader',
      'editDetails',
      'returnDetail'
    ]);
    expect(Object.isFrozen(firstApplication)).toBe(true);
    expect(firstApplication).not.toBe(secondApplication);
  });

  it('aplica las claves del contexto sin cambiar el contrato común', async () => {
    const requests = createRequests();
    const application = createIssueApplication({
      requests,
      dataKeys: {
        issue: 'issue',
        issueReturn: 'issueReturn'
      }
    });

    await expect(application.editHeader({
      formData: { clientId: 'client-1' },
      id: 'issue-1'
    })).resolves.toEqual({
      message: expect.any(String),
      data: { id: 'issue-1' }
    });
    await expect(application.returnDetail({
      formData: { quantity: 1 },
      id: 'issue-1',
      detailId: 'detail-1'
    })).resolves.toEqual({
      message: expect.any(String),
      data: { id: 'return-1' }
    });

    expect(requests.editHeader).toHaveBeenCalledWith({
      data: { clientId: 'client-1' },
      id: 'issue-1'
    });
    expect(requests.returnDetail).toHaveBeenCalledWith({
      data: { quantity: 1 },
      id: 'issue-1',
      detailId: 'detail-1'
    });
  });
});

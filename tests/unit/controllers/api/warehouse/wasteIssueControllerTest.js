import { beforeEach, describe, expect, it, vi } from 'vitest';

const createWasteIssue = vi.fn();
const findAllWasteIssues = vi.fn();
const updateWasteIssueDetails = vi.fn();
const updateWasteIssue = vi.fn();
const updateWasteIssueHeader = vi.fn();
const returnWasteIssueDetailService = vi.fn();

vi.mock('../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js', () => ({
  createWasteIssue,
  findAllWasteIssues,
  updateWasteIssueDetails,
  updateWasteIssue,
  updateWasteIssueHeader
}));

vi.mock('../../../../../src/services/warehouse/wasteIssues/wasteIssueReturnService.js', () => ({
  returnWasteIssueDetail: returnWasteIssueDetailService
}));

const {
  editWasteIssueDetails,
  editWasteIssue,
  editWasteIssueHeader,
  getAllWasteIssues,
  registerWasteIssue,
  returnWasteIssueDetail
} = await import('../../../../../src/controllers/api/warehouse/wasteIssueController.js');

const createResponse = () => {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  return response;
};

describe('wasteIssueController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica paginación y búsqueda al consultar salidas', async () => {
    const result = { data: [{ id: 'issue-1' }], recordsTotal: 1, recordsFiltered: 1 };
    const response = createResponse();
    findAllWasteIssues.mockResolvedValue(result);

    await getAllWasteIssues({
      query: {
        start: '10',
        length: '5',
        search: { value: 'SAL-MER-2026' },
        order: [{ column: '0', dir: 'asc' }],
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        clientId: 'client-1',
        departmentId: 'department-1',
        personId: 'person-1',
        fulfillmentStatusId: 'status-1',
        observationsSearch: 'taller'
      }
    }, response);

    expect(findAllWasteIssues).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      search: 'SAL-MER-2026',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      clientId: 'client-1',
      departmentId: 'department-1',
      personId: 'person-1',
      fulfillmentStatusId: 'status-1',
      observationsSearch: 'taller',
      orderBy: 'referenceNumber',
      orderDir: 'asc'
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(result);
  });

  it('normaliza el DTO y conserva únicamente los campos permitidos al crear', async () => {
    const wasteIssue = { id: 'issue-1' };
    const response = createResponse();
    createWasteIssue.mockResolvedValue(wasteIssue);

    await registerWasteIssue({
      user: { id: 'user-1' },
      body: {
        requesterId: ' requester-1 ',
        advisorId: ' advisor-1 ',
        clientId: ' client-1 ',
        departmentId: ' department-1 ',
        projectNumber: ' PR-100 ',
        requestDate: '2026-08-11T12:30:00.000Z',
        observations: '  Entrega al taller  ',
        status: 'COMPLETE',
        details: [{
          wasteId: '  waste-1  ',
          quantity: '2.5',
          suppliedQuantity: 99,
          convertedQuantity: 400.25,
          convertedQuantityDifference: 1
        }]
      }
    }, response);

    expect(createWasteIssue).toHaveBeenCalledWith({
      userId: 'user-1',
      wasteIssueDto: {
        requesterId: 'requester-1',
        advisorId: 'advisor-1',
        clientId: 'client-1',
        departmentId: 'department-1',
        projectNumber: 'PR-100',
        requestDate: new Date('2026-08-11T12:30:00.000Z'),
        observations: 'Entrega al taller',
        details: [{ wasteId: 'waste-1', quantity: 2.5 }]
      }
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ wasteIssue, code: 'CREATED_WASTE_ISSUE' });
  });

  it('convierte cantidades de surtido y no acepta campos de estado enviados por el cliente', async () => {
    const wasteIssue = { id: 'issue-1', fulfillmentStatus: { name: 'Surtido' } };
    const response = createResponse();
    updateWasteIssueDetails.mockResolvedValue(wasteIssue);

    await editWasteIssueDetails({
      params: { id: 'issue-1' },
      body: {
        details: [{
          id: 'detail-1',
          isSupplied: true,
          projectConvertedQuantity: '2.25',
          fulfillmentStatusId: 'client-status'
        }]
      }
    }, response);

    expect(updateWasteIssueDetails).toHaveBeenCalledWith({
      id: 'issue-1',
      wasteIssueDto: {
        details: [{ id: 'detail-1', isSupplied: true, projectConvertedQuantity: 2.25 }]
      }
    });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('edita encabezado y detalles mediante el DTO completo', async () => {
    const wasteIssue = { id: 'issue-1' };
    const response = createResponse();
    updateWasteIssue.mockResolvedValue(wasteIssue);

    await editWasteIssue({
      params: { id: 'issue-1' },
      body: {
        requesterId: ' requester-2 ',
        advisorId: ' advisor-2 ',
        clientId: ' client-2 ',
        departmentId: ' department-2 ',
        projectNumber: ' PR-200 ',
        requestDate: '2026-08-12T08:00:00.000Z',
        observations: '  Cambio completo  ',
        details: [{ wasteId: ' waste-1 ', quantity: '5' }]
      }
    }, response);

    expect(updateWasteIssue).toHaveBeenCalledWith({
      id: 'issue-1',
      wasteIssueDto: {
        requesterId: 'requester-2',
        advisorId: 'advisor-2',
        clientId: 'client-2',
        departmentId: 'department-2',
        projectNumber: 'PR-200',
        requestDate: new Date('2026-08-12T08:00:00.000Z'),
        observations: 'Cambio completo',
        details: [{ wasteId: 'waste-1', quantity: 5 }]
      }
    });
  });

  it('edita solamente el encabezado de una salida ya surtida', async () => {
    const wasteIssue = { id: 'issue-1' };
    const response = createResponse();
    updateWasteIssueHeader.mockResolvedValue(wasteIssue);

    await editWasteIssueHeader({
      params: { id: 'issue-1' },
      body: {
        requesterId: ' requester-3 ',
        advisorId: ' advisor-3 ',
        clientId: ' client-3 ',
        departmentId: ' department-3 ',
        projectNumber: ' PR-300 ',
        requestDate: '2026-08-12T09:00:00.000Z',
        details: [{ quantity: 99 }]
      }
    }, response);

    expect(updateWasteIssueHeader).toHaveBeenCalledWith({
      id: 'issue-1',
      wasteIssueDto: {
        requesterId: 'requester-3',
        advisorId: 'advisor-3',
        clientId: 'client-3',
        departmentId: 'department-3',
        projectNumber: 'PR-300',
        requestDate: new Date('2026-08-12T09:00:00.000Z')
      }
    });
  });

  it('normaliza y registra la devolución de un detalle surtido', async () => {
    const response = createResponse();
    returnWasteIssueDetailService.mockResolvedValue({ id: 'return-1' });

    await returnWasteIssueDetail({
      params: { id: 'issue-1', detailId: 'detail-1' },
      user: { id: 'user-1' },
      body: { returnQuantity: '1.5', observations: ' Devolución parcial ' }
    }, response);

    expect(returnWasteIssueDetailService).toHaveBeenCalledWith({
      id: 'issue-1',
      detailId: 'detail-1',
      userId: 'user-1',
      returnDto: { returnQuantity: 1.5, observations: 'Devolución parcial' }
    });
  });

});

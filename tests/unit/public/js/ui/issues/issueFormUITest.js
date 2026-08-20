import { describe, expect, it, vi } from 'vitest';

import { FORM_MODES } from '../../../../../../src/public/js/constants/formModes.js';
vi.hoisted(() => {
  globalThis.document = {};
  globalThis.$ = () => ({ on: vi.fn() });
});

const {
  applyIssueModalMode,
  createIssueTableActions
} = await import('../../../../../../src/public/js/ui/issues/issueFormUI.js');

const createModalElements = () => {
  const title = { textContent: '' };
  const submit = { textContent: '', classList: { add: vi.fn() } };

  return {
    form: { querySelector: vi.fn(() => submit) },
    modalElement: { querySelector: vi.fn(() => title) },
    submit,
    title
  };
};

describe('UI compartida del CRUD de salidas', () => {
  it.each([
    [FORM_MODES.CREATE, 'Nueva salida', 'Guardar'],
    [FORM_MODES.EDIT, 'Editar salida - Folio MAT-1', 'Editar'],
    [FORM_MODES.EDIT_HEADER, 'Editar salida - Folio MAT-1', 'Editar'],
    [FORM_MODES.EDIT_DETAIL, 'Entregar salida - Folio MAT-1', 'Entregar']
  ])('aplica la presentación configurada para el modo %s', (mode, expectedTitle, expectedSubmit) => {
    const elements = createModalElements();

    applyIssueModalMode({
      ...elements,
      mode,
      entityName: 'salida',
      referenceNumber: 'MAT-1',
      createTitle: 'Nueva salida',
      detailAction: 'Entregar'
    });

    expect(elements.title.textContent).toBe(expectedTitle);
    expect(elements.submit.textContent).toBe(expectedSubmit);
    expect(elements.submit.classList.add).not.toHaveBeenCalled();
  });

  it('conserva las acciones CRUD y de detalle con su modo y registro', () => {
    const openIssueModal = vi.fn();
    const actions = createIssueTableActions({ openIssueModal });
    const issue = { id: 'issue-1', fulfillmentStatus: { name: 'Pendiente' } };

    actions.onCreate();
    actions.onEdit(issue);
    actions.onEditDetails(issue);
    actions.onReturnDetails(issue);

    expect(openIssueModal.mock.calls).toEqual([
      [{ mode: FORM_MODES.CREATE }],
      [{ mode: FORM_MODES.EDIT, data: issue }],
      [{ mode: FORM_MODES.EDIT_DETAIL, data: issue }],
      [{ mode: FORM_MODES.RETURN, data: issue }]
    ]);
  });

  it.each([
    [{ status: { name: 'Cancelada' } }, FORM_MODES.VIEW],
    [{ fulfillmentStatus: { name: 'Cancelado' } }, FORM_MODES.VIEW],
    [{ fulfillmentStatus: { name: 'Surtido' } }, FORM_MODES.EDIT_HEADER]
  ])('resuelve el modo de edición desde el estado de la salida', (issueState, expectedMode) => {
    const openIssueModal = vi.fn();
    const issue = { id: 'issue-1', ...issueState };

    createIssueTableActions({ openIssueModal }).onEdit(issue);

    expect(openIssueModal).toHaveBeenCalledWith({ mode: expectedMode, data: issue });
  });

});

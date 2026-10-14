import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ submit: null }));
vi.mock('../../../../../../src/public/js/utils/domUtils.js', () => ({ on: (_event, _selector, handler) => { state.submit = handler; } }));
vi.mock('../../../../../../src/public/js/api/errorHandler.js', () => ({ handleApiError: vi.fn() }));
vi.mock('../../../../../../src/public/js/utils/formUtils.js', () => ({ hasValidationErrors: () => false }));
vi.mock('../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({ toggleErrorMessages: vi.fn(), normalizeFormErrors: vi.fn(), scrollToFirstFormError: vi.fn() }));
const { useForm } = await import('../../../../../../src/public/js/ui/forms/formUI.js');

it('un envío pendiente no vuelve a preparar, validar ni enviar la misma captura', async () => {
    vi.stubGlobal('FormData', class {
        *[Symbol.iterator]() { yield ['newStock', '3']; }
    });
    const getErrors = vi.fn(() => ({}));
    const normalizeData = vi.fn(({ formData }) => formData);
    let finish;
    const sendRequest = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    await useForm({ selector: '#form', normalizeData, getErrors, sendRequest });
    const form = { dataset: {}, querySelector: () => ({ disabled: false }) };
    const event = { preventDefault: vi.fn() };
    const pending = state.submit(event, form);
    await state.submit(event, form);
    expect(normalizeData).toHaveBeenCalledOnce();
    expect(getErrors).toHaveBeenCalledOnce();
    expect(sendRequest).toHaveBeenCalledOnce();
    finish();
    await pending;
    vi.unstubAllGlobals();
});

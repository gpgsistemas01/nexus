import { describe, expect, it, vi } from 'vitest';

import { BUTTON_SELECTORS } from '../../../../../../src/public/js/constants/selectors.js';
import { resetFormSubmitState } from '../../../../../../src/public/js/ui/forms/formStateUI.js';

describe('resetFormSubmitState en formularios CRUD', () => {
    it('restablece el envío mediante el selector compartido del botón', () => {
        const submitButton = { removeAttribute: vi.fn() };
        const form = {
            dataset: { submitting: 'true' },
            querySelector: vi.fn(() => submitButton)
        };

        resetFormSubmitState(form);

        expect(form.dataset.submitting).toBe('false');
        expect(form.querySelector).toHaveBeenCalledWith(BUTTON_SELECTORS.SUBMIT);
        expect(submitButton.removeAttribute).toHaveBeenCalledWith('disabled');
    });

    it('permite reiniciar un formulario sin botón de envío', () => {
        const form = {
            dataset: { submitting: 'true' },
            querySelector: vi.fn(() => null)
        };

        expect(() => resetFormSubmitState(form)).not.toThrow();
        expect(form.dataset.submitting).toBe('false');
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setSummaryValue } = await import('../../../../../../src/public/js/ui/forms/totalsSummaryUI.js');

describe('Resumen compartido de formularios CRUD', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('sincroniza el valor reutilizable y su representación formateada', () => {
        const element = { dataset: {}, textContent: '' };
        globalThis.document = { querySelector: vi.fn(() => element) };

        setSummaryValue({
            selector: '#quantitySummary',
            value: '1.25',
            formatter: value => `${value.toFixed(2)} kg`
        });

        expect(document.querySelector).toHaveBeenCalledWith('#quantitySummary');
        expect(element.dataset.value).toBe('1.25');
        expect(element.textContent).toBe('1.25 kg');
    });

    it('permite reutilizarlo cuando el resumen no está renderizado', () => {
        globalThis.document = { querySelector: vi.fn(() => null) };

        expect(() => setSummaryValue({
            selector: '#missingSummary',
            value: 1,
            formatter: vi.fn()
        })).not.toThrow();
    });
});

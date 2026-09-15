import { BUTTON_SELECTORS, HEADING_SELECTORS } from '../../../constants/selectors.js';
import { isCreateMode } from '../../../constants/formModes.js';
import { clearFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { initForm, setFormSectionVisibility } from '../../../ui/forms/formStateUI.js';
import { openModal } from '../../../ui/modalUI.js';

const form = document.querySelector('#catalogForm');
const modal = document.querySelector('#catalogModal');
const catalogFields = new Set(document.querySelector('#catalogContext').dataset.fields.split(','));

export const openCatalogModal = ({ catalog, entityLabel, mode, data = null }) => {
    const isCreating = isCreateMode(mode);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    form.dataset.catalog = catalog;
    form.elements.name.value = data?.name || '';
    form.elements.symbol.value = data?.symbol || '';
    form.elements.isActive.checked = data?.isActive ?? true;
    setFormSectionVisibility({
        form,
        selector: '#catalogSymbolInput',
        isVisible: catalog === 'unit-measures',
        fieldNames: ['symbol'],
        clearValues: true
    });
    setFormSectionVisibility({
        form,
        selector: '#catalogActiveInput',
        isVisible: catalogFields.has('isActive'),
        fieldNames: ['isActive']
    });

    const action = isCreating ? 'Registrar' : 'Editar';
    modal.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = `${ action } ${ entityLabel }`;
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = isCreating ? 'Guardar' : 'Actualizar';
    openModal(modal);
};

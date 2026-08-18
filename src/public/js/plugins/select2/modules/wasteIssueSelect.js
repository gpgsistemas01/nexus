import { getAllWastes } from '../../../application/warehouse/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { formatWasteSelectOption } from '../../../utils/warehouse/issueDisplayUtils.js';
import { setupWasteSelect, toggleWasteOption } from '../domains/waste.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = '#wasteIssueModal';
const headerSelects = createIssueHeaderSelects({
    modalSelector,
    formSelector: FORM_SELECTORS.GOODS_ISSUE,
    selectors: {
        requester: FORM_SELECTORS.REQUESTER,
        client: FORM_SELECTORS.CLIENT,
        department: FORM_SELECTORS.DEPARTMENT,
        advisor: FORM_SELECTORS.ADVISOR,
        projectNumber: FORM_SELECTORS.PROJECT_NUMBER
    }
});

export const getWasteIssueHeaderSelects = () => ({
    init: () => {

        headerSelects.init();
        setupWasteSelect({
            modalSelector,
            wasteSelector: FORM_SELECTORS.WASTE_ISSUE_WASTE,
            allowCreate: false
        });
    },
    setOptions: (data) => {

        headerSelects.setOptions(data);
        toggleWasteOption({
            selector: `${ modalSelector } ${ FORM_SELECTORS.WASTE_FORM }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});

export const createWasteIssueSelect = ({
    selector,
    modalSelector
}) => {

    const element = document.querySelector(selector);
    let wastes = new Map();

    const initialize = async () => {
        const response = await getAllWastes({ start: 0, length: 1000, 'search[value]': '' });
        const list = response.data.data;
        const $select = $(element);

        if ($select.hasClass('select2-hidden-accessible')) $select.select2('destroy');

        element.replaceChildren(
            new Option('Seleccione una merma', ''),
            ...list
                .filter(waste => waste.isActive)
                .map(waste => new Option(formatWasteSelectOption(waste), waste.id))
        );
        wastes = new Map(list.map(waste => [waste.id, waste]));

        $select.select2({
            language: 'es',
            placeholder: 'Seleccione una merma',
            width: '100%',
            dropdownParent: $(modalSelector)
        });
    };

    return {
        getSelected: () => wastes.get(element.value),
        initialize
    };
};

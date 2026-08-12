import { getAllWastes } from '../../../application/warehouse/wastes.js';
import { formatWasteSelectOption } from '../../../utils/warehouse/issueDisplayUtils.js';

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

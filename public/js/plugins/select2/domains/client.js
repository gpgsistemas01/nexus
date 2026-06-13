import { openClientModal } from "../../../modules/clients/clientModal.js";
import { getAllClients, getClientOptions } from "../../../application/sales/clients.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const clientFilterSelector = FILTER_SELECTORS.CLIENT;

export const getClientSelectApi = () => ({
    getSelect: () => document.querySelector(clientFilterSelector),
    getValue: () => document.querySelector(clientFilterSelector)?.value || ''
});

export const initClientFilterSelect = ({
    selectedId = null
} = {}) => {

    initbaseSelect2({
        baseSelector: clientFilterSelector,
        containerSelector: 'body',
        get: async (params) => ({
            data: await getClientOptions(params)
        }),
        clearOnOpen: false,
        placeholder: 'Filtrar por cliente',
        data: (params) => ({
            search: params.term
        }),
        processResults: (data) => {
            const list = data.data || data;
            return {
                results: list.map(client => ({
                    id: client.value,
                    text: client.label
                }))
            };
        }
    });

    if (!selectedId) {

        $(clientFilterSelector).val('').trigger('change');
        return;
    }

    const currentOption = $(`${ clientFilterSelector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(clientFilterSelector).val(selectedId).trigger('change');
};

export const attachClientFilterHandler = ({
    onChange
}) => {

    $(clientFilterSelector).off('select2:select').on('select2:select', () => {

        const select = document.querySelector(clientFilterSelector);
        const value = select?.value || '';

        onChange?.(value);
    });
};

export const initClientSelect = ({ 
    modalSelector, 
    advisorSelector = null,
    baseSelector, 
    allowCreate = true
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllClients,
        placeholder: 'Buscar cliente...',
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(c => ({
                    id: c.id,
                    text: c.name,
                }))
            };
        },
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nuevo cliente)`,
                    newTag: true
                };
            }
        })
    });
};

const attachClientHandler = ({
    baseSelector
}) => {

    $(baseSelector).off('select2:select').on('select2:select', (e) => {

        const data = e.params.data;

        if (data.newTag) {

            const name = data.id.replace('new:', '');
            
            openClientModal({
                data: { name },
                onSave: (createdClient) => {

                    toggleClientOption({
                        selector: baseSelector,
                        id: createdClient.id,
                        name: createdClient.name
                    });
                }
            });

            return;
        }
    });
};

export const toggleClientOption = ({ 
    selector, 
    id = null, 
    name = null
}) => toggleSelectOption({
    selector,
    data: {
        id,
        text: name
    }
});

export const setupClientSelect = ({ 
    modalSelector, 
    clientSelector,
    allowCreate = true,
}) => {

    initClientSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ clientSelector }`,
        allowCreate
    });

    attachClientHandler({
        baseSelector: `${ modalSelector } ${ clientSelector }`,
    });
};
